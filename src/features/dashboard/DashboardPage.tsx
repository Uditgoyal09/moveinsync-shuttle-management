import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings, fetchDrivers } from '@/shared/api/client';
import type { Booking } from '@/domain/types';
import { Search, Map as MapIcon, MapPin, Navigation, AlertCircle, Plus, Calendar, UserPlus, User, ArrowRight, BusFront, Loader2, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

// Removed hardcoded ROUTE_COLORS, ROUTE_NAMES, STOP_NAMES in favor of dynamic mapStore

const DRIVERS: Record<string, { name: string, vehicle: string, rating: string }> = {
  d1: { name: 'Aman Singh', vehicle: 'SH-04', rating: '4.8' },
  d2: { name: 'Rahul Pal', vehicle: 'SH-12', rating: '4.6' },
  d3: { name: 'Pawan Kumar', vehicle: 'SH-08', rating: '4.7' },
  d4: { name: 'Suresh Das', vehicle: 'SH-19', rating: '4.9' },
  d5: { name: 'Vikash Kumar', vehicle: 'SH-02', rating: '4.4' },
  d6: { name: 'Rohit Sharma', vehicle: 'SH-21', rating: '4.6' },
};

import { LiveMap } from '@/shared/components/ui/LiveMap';
import type { MapMarkerData } from '@/shared/components/ui/LiveMap';

const LPU_CENTER: [number, number] = [31.2560, 75.7051];

import { useMapStore } from '@/shared/store/mapStore';

import { MasterAssignmentModal } from './MasterAssignmentModal';
import { NewBookingModal } from '@/features/bookings/NewBookingModal';

export function DashboardPage() {
  const { data: bookings, isLoading: bookingsLoading } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const { data: drivers, isLoading: driversLoading } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers, refetchInterval: 5000 });
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'routes' | 'shuttles' | 'stops'>('routes');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStopCoords, setNewStopCoords] = useState<{lat: number, lng: number} | null>(null);

  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [newRouteCoords, setNewRouteCoords] = useState<[number, number][]>([]);
  const [activeRouteColor, setActiveRouteColor] = useState('#3867FF');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  const STOPS = useMapStore(state => state.stops);
  const addStop = useMapStore(state => state.addStop);
  const removeStop = useMapStore(state => state.removeStop);
  const ROUTES = useMapStore(state => state.routes);
  const addRoute = useMapStore(state => state.addRoute);
  const removeRoute = useMapStore(state => state.removeRoute);
  
  const routeIds = Object.keys(ROUTES);

  const onlineDrivers = drivers ? drivers.filter(d => d.status === 'online').map((d, index) => {
    // Automatically assign drivers evenly across available routes if they don't have one
    const isMultiRoute = index % 3 === 0 && routeIds.length > 1;
    let assignedIds = isMultiRoute ? routeIds : (routeIds.length > 0 ? [routeIds[index % routeIds.length]] : []);
    
    let validRouteIds = (d.routeIds && d.routeIds.length > 0) ? d.routeIds.filter(id => ROUTES[id]) : assignedIds;
    if (validRouteIds.length === 0 && assignedIds.length > 0) validRouteIds = assignedIds;
    
    return { ...d, routeIds: validRouteIds };
  }) : [];
  
  const [shuttlePositions, setShuttlePositions] = useState<Record<string, { lat: number, lng: number }>>({});

  const simulationState = useRef<Record<string, { routeId: string, segmentIdx: number, fraction: number, direction: 1 | -1 }>>({});

  useEffect(() => {
    if (!drivers) return;
    
    // Smooth 20 FPS simulation loop
    const interval = setInterval(() => {
      setShuttlePositions(prev => {
        const next = { ...prev };
        
        onlineDrivers.forEach((d) => {
          // 1. Initialize or re-assign routes if they were drawn
          if (!simulationState.current[d.id]) {
            const activeRouteId = d.routeIds[0] || '';
            simulationState.current[d.id] = { 
               routeId: activeRouteId, 
               segmentIdx: activeRouteId && ROUTES[activeRouteId] ? Math.floor(Math.random() * (ROUTES[activeRouteId].path.length - 1)) : 0, 
               fraction: Math.random(), 
               direction: Math.random() > 0.5 ? 1 : -1 
            };
            next[d.id] = { lat: LPU_CENTER[0] + (Math.random()-0.5)*0.01, lng: LPU_CENTER[1] + (Math.random()-0.5)*0.01 };
          }
          
          const state = simulationState.current[d.id];
          if (!d.routeIds.includes(state.routeId)) {
             state.routeId = d.routeIds[0] || '';
             state.segmentIdx = state.routeId && ROUTES[state.routeId] ? Math.floor(Math.random() * (ROUTES[state.routeId].path.length - 1)) : 0;
             state.fraction = Math.random();
          }
          
          const route = ROUTES[state.routeId];
          let targetLat = next[d.id]?.lat || LPU_CENTER[0];
          let targetLng = next[d.id]?.lng || LPU_CENTER[1];
          
          // 2. Determine Target Position (Route)
          if (route && route.path.length >= 2) {
             // Normal route patrol
             let p1 = route.path[state.segmentIdx];
             let p2 = route.path[state.segmentIdx + state.direction];
             
             if (!p1 || !p2) {
                state.direction *= -1;
                state.segmentIdx = Math.max(0, Math.min(state.segmentIdx + state.direction, route.path.length - 1));
                p1 = route.path[state.segmentIdx];
                p2 = route.path[state.segmentIdx + state.direction] || p1;
             }
             
             targetLat = p1[0] + (p2[0] - p1[0]) * state.fraction;
             targetLng = p1[1] + (p2[1] - p1[1]) * state.fraction;
          } else {
             // Wiggle idle
             targetLat += (Math.random() - 0.5) * 0.0001;
             targetLng += (Math.random() - 0.5) * 0.0001;
          }
          
          // 3. Move shuttle towards Target
          const curLat = next[d.id]?.lat || targetLat;
          const curLng = next[d.id]?.lng || targetLng;
          const diffLat = targetLat - curLat;
          const diffLng = targetLng - curLng;
          const dist = Math.sqrt(diffLat*diffLat + diffLng*diffLng);
          
          const maxSpeed = 0.00003; // Degrees per 50ms tick
          
          if (dist > maxSpeed) {
             next[d.id] = { lat: curLat + (diffLat/dist)*maxSpeed, lng: curLng + (diffLng/dist)*maxSpeed };
          } else {
             next[d.id] = { lat: targetLat, lng: targetLng };
             
             // If we reached the route target, advance the fraction to keep moving along the line
             if (route && route.path.length >= 2) {
                const p1 = route.path[state.segmentIdx];
                const p2 = route.path[state.segmentIdx + state.direction];
                const segDist = Math.sqrt(Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2));
                const fractionSpeed = segDist > 0 ? maxSpeed / segDist : 1;
                
                state.fraction += fractionSpeed;
                if (state.fraction >= 1) {
                  state.fraction = 0;
                  state.segmentIdx += state.direction;
                  if (state.segmentIdx >= route.path.length - 1 || state.segmentIdx <= 0) {
                     if (d.routeIds.length > 1) {
                         const currentIdx = d.routeIds.indexOf(state.routeId);
                         const nextIdx = (currentIdx + 1) % d.routeIds.length;
                         state.routeId = d.routeIds[nextIdx];
                         state.segmentIdx = 0;
                         state.direction = 1;
                     } else {
                         state.direction *= -1;
                     }
                  }
                }
             }
          }
        });
        return next;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [drivers, ROUTES, isAddingStop, newStopCoords]);

  if (bookingsLoading || driversLoading || !bookings || !drivers) {
    return <div className="flex h-full items-center justify-center bg-background"><Loader2 className="animate-spin text-muted" /></div>;
  }

  const unassignedBookings = bookings.filter(b => ROUTES[b.routeId] && !b.driverId && b.status === 'waiting');
  const ongoingBookings = bookings.filter(b => b.status === 'ongoing' && ROUTES[b.routeId]);
  const upcomingBookings = bookings.filter(b => ['accepted', 'waiting', 'ongoing'].includes(b.status) && ROUTES[b.routeId]).slice(0, 5);
  const activeDriver = onlineDrivers[0];
  const selectedBooking = bookings.find(b => b.id === selectedBookingId);



  // Combine stops and shuttles for the map
  const mapMarkers: MapMarkerData[] = [
    ...(activeLayer === 'stops' || activeLayer === 'routes' ? Object.values(STOPS).filter(s => s.id !== editingStopId).map(s => ({...s, isActive: false})) : []),
    ...(isAddingStop && newStopCoords ? [{
      id: 'temp-new-stop',
      type: 'pin' as const,
      name: 'New Stop (Drag to move)',
      lat: newStopCoords.lat,
      lng: newStopCoords.lng,
      isActive: true,
      color: '#F59E0B'
    }] : []),
    ...(activeLayer === 'shuttles' || activeLayer === 'routes' ? onlineDrivers.map(d => ({
      id: d.id,
      type: 'shuttle' as const,
      lat: shuttlePositions[d.id]?.lat || LPU_CENTER[0],
      lng: shuttlePositions[d.id]?.lng || LPU_CENTER[1],
      name: d.vehicleId || 'Shuttle',
      color: ROUTES[d.routeIds[0]]?.color || '#94A3B8'
    })) : [])
  ];

  return (
    <div className="flex w-full h-full text-foreground bg-background transition-colors">
      
      {/* Left Area: Map Workspace */}
      <div className="flex-1 relative overflow-hidden transition-colors">
        <LiveMap 
          markers={mapMarkers} 
          routes={Object.values(ROUTES)}
          activeDrawingRoute={newRouteCoords}
          activeDrawingColor={activeRouteColor}
          center={LPU_CENTER} 
          zoom={15} 
          hideControls={false} 
          onMarkerDragEnd={(marker, latlng) => {
            if (marker.id === 'temp-new-stop') {
              setNewStopCoords(latlng);
            } else if (marker.type === 'stop' && STOPS[marker.id]) {
              // Instantly save drag changes for existing stops
              addStop({ ...STOPS[marker.id], lat: latlng.lat, lng: latlng.lng });
            }
          }}
          onMapClick={(latlng) => {
            if (isDrawingRoute) {
              setNewRouteCoords(prev => [...prev, [latlng.lat, latlng.lng]]);
            }
          }}
        />

        {isAddingStop && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border-color rounded-[16px] shadow-2xl w-[400px] p-6 z-20 animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
               <MapPin size={24} />
               <h3 className="text-lg font-bold text-foreground">Save New Location</h3>
             </div>
             <p className="text-sm text-muted mb-4">Drag the orange pin on the map to perfectly position your new stop.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                if (newStopCoords) {
                  addStop({
                    id: editingStopId || ('s' + Date.now()),
                    type: 'stop',
                    name: data.get('name') as string,
                    desc: data.get('desc') as string,
                    lat: newStopCoords.lat,
                    lng: newStopCoords.lng,
                  });
                }
                setIsAddingStop(false);
                setNewStopCoords(null);
                setEditingStopId(null);
             }} key={editingStopId || 'new'} className="flex flex-col gap-4">
               <input name="name" defaultValue={editingStopId ? STOPS[editingStopId]?.name : ''} placeholder="Stop Name (e.g. Block 18)" autoFocus required className="w-full h-10 bg-background border border-border-color rounded-[8px] px-3 text-[13px] outline-none focus:border-[#F59E0B]" />
               <input name="desc" defaultValue={editingStopId ? STOPS[editingStopId]?.desc : ''} placeholder="Description" required className="w-full h-10 bg-background border border-border-color rounded-[8px] px-3 text-[13px] outline-none focus:border-[#F59E0B]" />
               
               <div className="flex justify-end gap-2 mt-2">
                 <button type="button" onClick={() => { setIsAddingStop(false); setNewStopCoords(null); setEditingStopId(null); }} className="px-4 py-2 text-sm font-medium hover:bg-muted/10 rounded-md">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-bold rounded-md">Confirm Pin</button>
               </div>
             </form>
          </div>
        )}

        {isDrawingRoute && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border-color rounded-[16px] shadow-2xl w-[400px] p-6 z-20 animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center gap-3 mb-4 text-[#2457E6]">
               <Navigation size={24} />
               <h3 className="text-lg font-bold text-foreground">Save New Route</h3>
             </div>
             <p className="text-sm text-muted mb-4">Click anywhere on the map to add points to your route. ({newRouteCoords.length} points added)</p>
             <form onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                if (newRouteCoords.length > 1) {
                  addRoute({
                    id: editingRouteId || ('r' + Date.now()),
                    name: data.get('name') as string,
                    color: activeRouteColor,
                    path: newRouteCoords,
                  });
                }
                setIsDrawingRoute(false);
                setNewRouteCoords([]);
                setEditingRouteId(null);
             }} className="flex flex-col gap-4">
               <input name="name" defaultValue={editingRouteId ? ROUTES[editingRouteId]?.name : ''} placeholder="Route Name (e.g. Express Line)" autoFocus required className="w-full h-10 bg-background border border-border-color rounded-[8px] px-3 text-[13px] outline-none focus:border-[#2457E6]" />
               
               <div className="flex flex-col gap-2">
                 <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Route Color</span>
                 <div className="flex items-center gap-3">
                   {['#3867FF', '#F27A38', '#19A974', '#A855F7', '#EC4899'].map(color => (
                     <button
                       key={color}
                       type="button"
                       onClick={() => setActiveRouteColor(color)}
                       className={cn(
                         "w-8 h-8 rounded-full border-2 transition-all",
                         activeRouteColor === color ? "border-foreground scale-110 shadow-sm" : "border-transparent hover:scale-105"
                       )}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                 </div>
               </div>
               
               <div className="flex justify-end gap-2 mt-4">
                 <button type="button" onClick={() => setNewRouteCoords(prev => prev.slice(0, -1))} className="px-4 py-2 text-sm font-medium hover:bg-muted/10 rounded-md" disabled={newRouteCoords.length === 0}>Undo Point</button>
                 <button type="button" onClick={() => { setIsDrawingRoute(false); setNewRouteCoords([]); setEditingRouteId(null); }} className="px-4 py-2 text-sm font-medium hover:bg-muted/10 rounded-md text-[#E25555]">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-[#2457E6] text-white text-sm font-bold rounded-md disabled:opacity-50" disabled={newRouteCoords.length < 2}>Save</button>
               </div>
             </form>
          </div>
        )}

        <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
          <div className="flex items-center bg-surface/90 backdrop-blur-md border border-border-color rounded-[10px] h-[48px] px-4 shadow-lg w-[320px]">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search campus, stop or booking..." 
              className="bg-transparent text-[14px] font-medium text-foreground placeholder:text-muted outline-none ml-3 w-full"
            />
            <div className="bg-border-color text-muted text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] tracking-widest ml-2">⌘K</div>
          </div>

          <div className="flex bg-surface/90 backdrop-blur-md border border-border-color rounded-[10px] h-[48px] p-1 shadow-lg">
            <button 
              onClick={() => setActiveLayer('routes')}
              className={cn("px-4 h-full rounded-[7px] text-[13px] font-bold flex items-center gap-2 transition-colors", activeLayer === 'routes' ? "bg-[#3867FF] text-white" : "text-muted hover:text-foreground")}
            >
              <MapIcon size={16} /> Routes
            </button>
            <button 
              onClick={() => setActiveLayer('shuttles')}
              className={cn("px-4 h-full rounded-[7px] text-[13px] font-bold flex items-center gap-2 transition-colors", activeLayer === 'shuttles' ? "bg-[#3867FF] text-white" : "text-muted hover:text-foreground")}
            >
               Shuttles
            </button>
            <button 
              onClick={() => setActiveLayer('stops')}
              className={cn("px-4 h-full rounded-[7px] text-[13px] font-bold flex items-center gap-2 transition-colors", activeLayer === 'stops' ? "bg-[#3867FF] text-white" : "text-muted hover:text-foreground")}
            >
               Stops
            </button>
          </div>
        </div>


        {activeLayer === 'routes' && Object.keys(ROUTES).length > 0 && (
          <div className="absolute top-[90px] right-6 z-10 w-[240px] bg-surface/90 backdrop-blur-md border border-border-color rounded-[10px] p-3 shadow-lg flex flex-col gap-2">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Drawn Routes</div>
            <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
              {Object.values(ROUTES).map(route => (
                <div key={route.id} className="flex items-center justify-between bg-background border border-border-color rounded-[6px] p-2 hover:border-muted/30 transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                    <span className="text-[12px] font-medium truncate" title={route.name}>{route.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setIsDrawingRoute(true);
                        setNewRouteCoords(route.path);
                        setActiveRouteColor(route.color);
                        setEditingRouteId(route.id);
                      }}
                      className="text-muted hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Edit Route"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button 
                      onClick={() => removeRoute(route.id)}
                      className="text-muted hover:text-[#E25555] opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Erase Route"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeLayer === 'stops' && Object.keys(STOPS).length > 0 && (
          <div className="absolute top-[90px] right-6 z-10 w-[240px] bg-surface/90 backdrop-blur-md border border-border-color rounded-[10px] p-3 shadow-lg flex flex-col gap-2">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Campus Stops</div>
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
              {Object.values(STOPS).map(stop => (
                <div key={stop.id} className="flex items-center justify-between bg-background border border-border-color rounded-[6px] p-2 hover:border-muted/30 transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MapPin size={14} className="text-[#F59E0B] shrink-0" />
                    <span className="text-[12px] font-medium truncate" title={stop.name}>{stop.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setIsAddingStop(true);
                        setNewStopCoords({ lat: stop.lat, lng: stop.lng });
                        setEditingStopId(stop.id);
                      }}
                      className="text-muted hover:text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Edit Stop"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button 
                      onClick={() => removeStop(stop.id)}
                      className="text-muted hover:text-[#E25555] opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Erase Stop"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
          <button className="w-[44px] h-[44px] bg-surface/90 backdrop-blur-md border border-border-color rounded-[10px] flex items-center justify-center text-foreground shadow-lg hover:bg-border-color transition-colors">
            <Navigation size={20} />
          </button>
          <div className="flex flex-col bg-surface/90 backdrop-blur-md border border-border-color rounded-[10px] shadow-lg mt-2 overflow-hidden">
            <button className="w-[44px] h-[44px] flex items-center justify-center text-foreground hover:bg-border-color transition-colors border-b border-border-color">
              <Plus size={20} />
            </button>
            <button className="w-[44px] h-[44px] flex items-center justify-center text-foreground hover:bg-border-color transition-colors">
              <div className="w-4 h-0.5 bg-foreground rounded-full" />
            </button>
          </div>
        </div>

        {selectedBooking && ROUTES[selectedBooking.routeId] && (() => {
          const routeColor = ROUTES[selectedBooking.routeId]?.color || 'var(--route-blue)';
          const fromStop = STOPS[selectedBooking.fromStopId]?.name || selectedBooking.fromStopId;
          const toStop = STOPS[selectedBooking.toStopId]?.name || selectedBooking.toStopId;
          const routeName = ROUTES[selectedBooking.routeId]?.name || 'Unknown Route';
          const driver = selectedBooking.driverId ? DRIVERS[selectedBooking.driverId] : null;

          return (
            <div className="absolute bottom-12 right-[20%] z-20 w-[380px] bg-surface/95 backdrop-blur-xl border border-border-color rounded-[16px] shadow-2xl p-6 transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[20px] font-bold text-foreground tracking-tight leading-none">{selectedBooking.id}</h3>
                  <div className="flex items-center gap-1.5 bg-background border border-border-color px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: routeColor }} />
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: routeColor }}>{selectedBooking.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedBookingId(null)} className="text-muted hover:text-foreground transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border-color flex items-center justify-center border-2 border-surface">
                    <User size={18} className="text-muted" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-foreground">{selectedBooking.riderName}</span>
                    <span className="text-[12px] font-medium text-muted">{selectedBooking.riderId} · Student</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-[12px] text-muted font-medium"><Calendar size={12}/> 22 Sep 2026</div>
                  <div className="text-[13px] font-bold text-foreground mt-1">{selectedBooking.requestedPickupTime}</div>
                </div>
              </div>

              <div className="relative w-full h-[3px] my-8 rounded-full" style={{ backgroundColor: routeColor }}>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-surface border-[3px] z-10" style={{ borderColor: routeColor }} />
                  <div className="absolute bottom-6 text-[13px] font-bold text-foreground whitespace-nowrap">{fromStop}</div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-surface border-[3px] z-10" style={{ borderColor: routeColor }} />
                  <div className="absolute bottom-6 text-[13px] font-bold text-foreground whitespace-nowrap">{toStop}</div>
                </div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[12px] font-bold" style={{ color: routeColor }}>{routeName}</div>
              </div>

              <div className="flex items-center justify-between mt-8 border-t border-border-color pt-5">
                {driver ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border-color flex items-center justify-center border-2 border-surface overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} alt="driver" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-foreground leading-tight">{driver.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-muted">{driver.vehicle}</span>
                          <span className="text-[11px] font-bold text-[#F59E0B]">★ {driver.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button className="bg-border-color hover:bg-muted/20 text-foreground px-4 h-[36px] rounded-[7px] text-[13px] font-bold transition-colors flex items-center gap-2">
                      View trip <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-[14px] font-bold text-[#E25555]">Driver not assigned</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="w-[420px] bg-background border-l border-border-color flex flex-col z-20 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-colors">
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-[20px] font-bold text-foreground tracking-tight">Campus network</h2>
                <div className="flex items-center gap-1.5 bg-[#19A974]/10 border border-[#19A974]/20 px-2.5 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#19A974] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#19A974]">Live</span>
                </div>
              </div>
              <p className="text-[13px] font-medium text-muted">Real-time shuttle operations across campus</p>
            </div>
          </div>

          {unassignedBookings.length > 0 && (
            <div className="bg-[#E25555]/10 border border-[#E25555]/20 rounded-[12px] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#E25555]/15 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#E25555]/20 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-[#E25555]" />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-[#E25555]">{unassignedBookings.length} trips need drivers</div>
                <div className="text-[13px] font-medium text-muted mt-0.5">Departures in next 60 minutes</div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          )}

          {activeDriver && (() => {
             const routeId = activeDriver.routeIds[0] || '';
             const routeColor = ROUTES[routeId]?.color || '#94A3B8';
             const routeName = ROUTES[routeId]?.name || 'Idle (No Route Assigned)';
             return (
              <div className="flex flex-col gap-4">
                <h3 className="text-[15px] font-bold text-foreground tracking-wide">Active shuttle</h3>
                <div className="bg-surface border border-border-color rounded-[12px] p-5 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-[100px] h-[64px] bg-border-color rounded-[8px] flex items-center justify-center">
                        <BusFront size={28} className="text-muted" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-foreground leading-tight">{activeDriver.vehicleId || 'Shuttle'}</span>
                        <span className="text-[13px] font-medium text-muted mt-1">Tata Starbus</span>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: routeColor }} />
                           <span className="text-[12px] font-bold text-foreground">{routeName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold text-foreground">{activeDriver.name}</span>
                        <span className="text-[12px] font-bold text-[#F59E0B]">★ {activeDriver.rating}</span>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const simState = simulationState.current[activeDriver.id];
                    const route = ROUTES[simState?.routeId || ''];
                    const totalSegments = Math.max(1, (route?.path.length || 2) - 1);
                    const progress = simState ? Math.min(100, Math.max(0, ((simState.segmentIdx + simState.fraction) / totalSegments) * 100)) : 0;
                    
                    return (
                      <div className="relative w-full h-[3px] bg-border-color rounded-full mt-10">
                        <div className="absolute left-0 top-0 bottom-0 rounded-l-full transition-all duration-75" style={{ width: `${progress}%`, backgroundColor: routeColor }} />
                        <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-75" style={{ left: `${progress}%` }}>
                          <div className="w-6 h-4 rounded-[3px] flex items-center justify-center" style={{ backgroundColor: routeColor }}>
                            <BusFront size={10} className="text-white" />
                          </div>
                          <div className="absolute top-4 text-[11px] font-medium text-foreground whitespace-nowrap">{route?.stops?.[0]?.name || 'Start'}</div>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-border-color" />
                          <div className="absolute top-4 text-[11px] font-medium text-muted whitespace-nowrap">{route?.stops?.[(route.stops?.length || 1) - 1]?.name || 'End'}</div>
                          <div className="absolute -top-10 flex flex-col items-end">
                             <span className="text-[10px] font-medium text-muted">ETA</span>
                             <span className="text-[13px] font-bold" style={{ color: routeColor }}>{Math.max(1, Math.round((100 - progress) / 10))} min</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
             );
          })()}

          <div className="flex flex-col gap-4 mt-2">
            <h3 className="text-[15px] font-bold text-foreground tracking-wide">Upcoming journeys</h3>
            <div className="flex flex-col divide-y divide-border-color">
              {upcomingBookings.map((trip) => {
                const rColor = ROUTES[trip.routeId]?.color || 'var(--route-blue)';
                
                let sColor = 'text-foreground';
                let sBg = 'bg-background border-border-color';
                if (trip.status === 'accepted') { sColor = 'text-[#19A974]'; sBg = 'bg-[#19A974]/10 border-[#19A974]/20'; }
                if (trip.status === 'ongoing') { sColor = 'text-[var(--route-blue)]'; sBg = 'bg-[var(--route-blue)]/10 border-[var(--route-blue)]/20'; }
                if (trip.status === 'waiting') { sColor = 'text-[#E25555]'; sBg = 'bg-[#E25555]/10 border-[#E25555]/20'; }

                return (
                  <div 
                    key={trip.id} 
                    onClick={() => setSelectedBookingId(trip.id)}
                    className="py-4 flex items-center justify-between group cursor-pointer hover:bg-surface/50 px-2 -mx-2 rounded-[8px] transition-colors"
                  >
                    <div className="w-[80px]">
                      <div className="text-[14px] font-bold text-foreground tabular-nums">{trip.requestedPickupTime}</div>
                      <div className="text-[12px] font-medium text-muted mt-1">{trip.id}</div>
                    </div>

                    <div className="flex-1 px-4">
                      <div className="relative w-full h-[2px] bg-border-color rounded-full mb-3 mt-1">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rColor }} />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rColor }} />
                      </div>
                      <div className="flex justify-between items-center text-[12px] font-medium">
                        <span className="text-foreground">{STOPS[trip.fromStopId]?.name || trip.fromStopId}</span>
                        <span className="text-muted px-2">→</span>
                        <span className="text-foreground">{STOPS[trip.toStopId]?.name || trip.toStopId}</span>
                      </div>
                    </div>

                    <div className="w-[90px] flex flex-col items-end gap-1.5 pr-2">
                       <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: rColor }}>{ROUTES[trip.routeId]?.name || 'Unknown Route'}</span>
                       <div className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-bold w-fit text-center", sBg, sColor)}>
                         {trip.status}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-color bg-background transition-colors">
          <div className="text-[13px] font-bold text-foreground mb-3 tracking-wide">Quick actions</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsNewBookingOpen(true)} className="flex-1 h-[40px] bg-[#2457E6] hover:bg-[#1A41BA] text-white rounded-[7px] text-[13px] font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Plus size={16} /> Booking
            </button>
            <button onClick={() => setIsAssignmentModalOpen(true)} className="flex-1 h-[40px] bg-border-color hover:bg-muted/20 text-foreground rounded-[7px] text-[13px] font-bold transition-colors flex items-center justify-center gap-2">
              <UserPlus size={16} className="text-muted" /> Assign
            </button>
            <button onClick={() => { setIsDrawingRoute(true); setNewRouteCoords([]); }} className="flex-1 h-[40px] bg-border-color hover:bg-muted/20 text-foreground rounded-[7px] text-[13px] font-bold transition-colors flex items-center justify-center gap-2">
              <Navigation size={16} className="text-muted" /> Draw Route
            </button>
            <button onClick={() => { setIsAddingStop(true); setNewStopCoords({ lat: LPU_CENTER[0], lng: LPU_CENTER[1] }); }} className="flex-1 h-[40px] bg-border-color hover:bg-muted/20 text-foreground rounded-[7px] text-[13px] font-bold transition-colors flex items-center justify-center gap-2">
              <MapIcon size={16} className="text-muted" /> Add Stop
            </button>
          </div>
        </div>
      </div>
      
      {isAssignmentModalOpen && (
        <MasterAssignmentModal onClose={() => setIsAssignmentModalOpen(false)} />
      )}
      {isNewBookingOpen && (
        <NewBookingModal onClose={() => setIsNewBookingOpen(false)} />
      )}
    </div>
  );
}
