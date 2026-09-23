import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { RouteLine } from '@/shared/components/ui/RouteLine';
import { MapPin, Navigation, Clock, User, Star, Map as MapIcon, ChevronRight, BusFront, AlertTriangle, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useNavigate } from 'react-router-dom';

import { LiveMap } from '@/shared/components/ui/LiveMap';
import type { MapMarkerData } from '@/shared/components/ui/LiveMap';

import { useMapStore } from '@/shared/store/mapStore';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBooking, fetchDrivers } from '@/shared/api/client';
import { useTripStore, type Trip } from '@/stores/tripStore';

export function RiderBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addTrip, cancelTrip } = useTripStore();
  const [step, setStep] = useState<'location' | 'shuttles' | 'confirmed'>('location');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [customFrom, setCustomFrom] = useState<{lat: number, lng: number} | null>(null);
  const [customTo, setCustomTo] = useState<{lat: number, lng: number} | null>(null);
  const [bookedTrip, setBookedTrip] = useState<Trip | null>(null);
  const [isCancellingRide, setIsCancellingRide] = useState(false);

  const STOPS = useMapStore(state => state.stops);
  const ROUTES = useMapStore(state => state.routes);
  const [customFromName, setCustomFromName] = useState('My Custom Pickup');
  const [customToName, setCustomToName] = useState('My Custom Drop-off');
  
  const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers, refetchInterval: 5000 });
  const routeIds = Object.keys(ROUTES);
  const onlineDrivers = drivers ? drivers.filter(d => d.status === 'online').map((d, index) => {
    const isMultiRoute = index % 3 === 0 && routeIds.length > 1;
    let assignedIds = isMultiRoute ? routeIds : (routeIds.length > 0 ? [routeIds[index % routeIds.length]] : []);
    
    let validRouteIds = (d.routeIds && d.routeIds.length > 0) ? d.routeIds.filter(id => ROUTES[id]) : assignedIds;
    if (validRouteIds.length === 0 && assignedIds.length > 0) validRouteIds = assignedIds;
    
    return { ...d, routeIds: validRouteIds };
  }) : [];
  
  // Helper to get coordinates for routing
  const getCoordinates = (id: string, customData: {lat: number, lng: number} | null) => {
    if (id === 'custom-from' || id === 'custom-to') return customData;
    if (STOPS[id]) return { lat: STOPS[id].lat, lng: STOPS[id].lng };
    return null;
  };

  const fromCoords = getCoordinates(from, customFrom);
  const toCoords = getCoordinates(to, customTo);

  const mutation = useMutation({
    mutationFn: async ({ routeId, driver }: { routeId: string; driver: (typeof onlineDrivers)[0] }) => {
      const generatedId = `SH-${Math.floor(10000 + Math.random() * 90000)}`;
      const routeInfo = ROUTES[routeId];
      const fromName = from === 'custom-from' ? customFromName : (STOPS[from]?.name || from);
      const toName = to === 'custom-to' ? customToName : (STOPS[to]?.name || to);
      const pickupTime = new Date(Date.now() + 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await createBooking({
        id: generatedId,
        riderName: 'Guest Rider',
        riderId: 'rider_guest',
        fromStopId: from,
        toStopId: to,
        routeId,
        requestedPickupTime: pickupTime,
        status: 'waiting',
        driverId: driver.id,
        vehicleId: driver.vehicleId,
      });

      const newTrip: Trip = {
        id: generatedId,
        date: 'Today',
        time: pickupTime,
        status: 'upcoming',
        from: fromName,
        to: toName,
        driver: {
          name: driver.name,
          rating: String(driver.rating),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`
        },
        vehicle: driver.vehicleId || 'SH-04 (Tata Starbus)',
        color: routeInfo?.color || '#3867FF'
      };

      return newTrip;
    },
    onSuccess: (newTrip) => {
      setBookedTrip(newTrip);
      addTrip(newTrip);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setStep('confirmed');
    }
  });

  const handleCancelCurrentRide = async () => {
    if (!bookedTrip) return;
    setIsCancellingRide(true);
    try {
      await cancelTrip(bookedTrip.id);
      setBookedTrip(prev => prev ? { ...prev, status: 'cancelled' } : null);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } finally {
      setIsCancellingRide(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      
      {/* Left Sidebar Form */}
      <div className="w-[480px] bg-surface border-r border-border-color shrink-0 flex flex-col z-10 shadow-[10px_0_30px_rgba(0,0,0,0.05)] relative">
        <div className="p-8 border-b border-border-color">
          <h1 className="text-3xl font-bold tracking-tight">Where to?</h1>
          <p className="text-muted mt-1">Book your campus transit instantly.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          
          {step === 'location' && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="relative flex flex-col gap-4 bg-muted/5 p-4 rounded-[12px] border border-border-color">
                <div className="absolute left-[31px] top-[44px] bottom-[44px] w-[2px] bg-border-color border-dashed border-l" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#19A974] shrink-0 border-2 border-surface" />
                  <select 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="flex-1 h-12 bg-background border border-border-color rounded-[8px] px-4 text-[14px] font-semibold outline-none focus:border-[#2457E6] transition-colors"
                  >
                    <option value="" disabled>Choose pickup location</option>
                    {customFrom && <option value="custom-from">Pinned Location</option>}
                    {Object.entries(STOPS).map(([id, info]) => (
                      <option key={`from-${id}`} value={id}>{info.name}</option>
                    ))}
                  </select>
                </div>
                {from === 'custom-from' && customFrom && (
                  <div className="pl-[30px]">
                    <input 
                      type="text"
                      value={customFromName}
                      onChange={(e) => setCustomFromName(e.target.value)}
                      placeholder="Name your custom pickup..."
                      className="w-full h-10 bg-background border border-border-color rounded-[8px] px-3 text-[13px] outline-none focus:border-[#19A974] transition-colors"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-3.5 h-3.5 bg-[#3867FF] shrink-0 border-2 border-surface" />
                  <select 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1 h-12 bg-background border border-border-color rounded-[8px] px-4 text-[14px] font-semibold outline-none focus:border-[#2457E6] transition-colors"
                  >
                    <option value="" disabled>Choose destination</option>
                    {customTo && <option value="custom-to">Pinned Location</option>}
                    {Object.entries(STOPS).map(([id, info]) => (
                      <option key={`to-${id}`} value={id}>{info.name}</option>
                    ))}
                  </select>
                </div>
                {to === 'custom-to' && customTo && (
                  <div className="pl-[30px]">
                    <input 
                      type="text"
                      value={customToName}
                      onChange={(e) => setCustomToName(e.target.value)}
                      placeholder="Name your custom destination..."
                      className="w-full h-10 bg-background border border-border-color rounded-[8px] px-3 text-[13px] outline-none focus:border-[#3867FF] transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-muted/5 p-4 rounded-[12px] border border-border-color">
                <Clock size={20} className="text-muted" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold">Leave Now</span>
                  <span className="text-[12px] text-muted">Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'shuttles' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <button 
                onClick={() => setStep('location')} 
                className="self-start text-[14px] font-bold text-muted hover:text-foreground flex items-center gap-2 mb-2 transition-colors"
              >
                &larr; Change route
              </button>

              <h3 className="text-[18px] font-bold tracking-tight mb-2">Available Shuttles</h3>

              {onlineDrivers.filter(d => d.routeIds?.[0] && ROUTES[d.routeIds[0]]).length === 0 ? (
                <div className="text-center py-10 bg-muted/5 border border-border-color rounded-[16px]">
                  <div className="w-16 h-16 bg-muted/10 text-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BusFront size={32} />
                  </div>
                  <h4 className="text-foreground font-bold mb-1">No shuttles available</h4>
                  <p className="text-muted text-[14px]">There are currently no active drivers on the road. Please check back later.</p>
                </div>
              ) : (
                onlineDrivers.filter(d => d.routeIds?.[0] && ROUTES[d.routeIds[0]]).map((driver) => {
                  const route = ROUTES[driver.routeIds[0]];
                  
                  // For active drivers, wait is minimal
                  const arrivalMins = Math.floor(Math.random() * 3) + 1;
                  const arrivalTime = new Date(Date.now() + arrivalMins * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  return (
                    <div 
                      key={driver.id}
                      className="bg-background border-2 border-border-color rounded-[16px] p-5 flex flex-col gap-4 transition-all hover:border-[#2457E6]/40 hover:shadow-md"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${route.color}1A` }}>
                            <BusFront size={24} style={{ color: route.color }} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-foreground">{driver.vehicleId || 'Shuttle'}</span>
                            <span className="text-[12px] font-medium text-muted">{route.name} &bull; Arrives in {arrivalMins} mins</span>
                          </div>
                        </div>
                        <div className="text-[18px] font-bold tabular-nums">{arrivalTime}</div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-border-color">
                        <div className="flex items-center gap-2">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} className="w-6 h-6 rounded-full bg-border-color" alt="driver" />
                          <span className="text-[13px] font-medium text-muted">{driver.name}</span>
                          <span className="text-[12px] font-bold text-[#F59E0B] flex items-center">★ {driver.rating}</span>
                        </div>
                        <div className="text-[13px] font-bold text-[#19A974]">
                          Available Now
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-2 h-12 text-[15px] font-bold hover:opacity-90 flex items-center justify-center gap-2" 
                        style={{ backgroundColor: route.color }} 
                        onClick={() => mutation.mutate({ routeId: route.id, driver })}
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? 'Booking...' : 'Book Ride'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {step === 'confirmed' && (
            <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-500 items-center justify-center h-full text-center mt-[-20px]">
              {bookedTrip?.status === 'cancelled' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-[#E25555]/10 text-[#E25555] flex items-center justify-center mb-1">
                    <XCircle size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#E25555]">Ride Cancelled</h2>
                    <p className="text-muted mt-1 text-[14px]">Your ride {bookedTrip.id} has been cancelled successfully.</p>
                  </div>
                  <Button 
                    className="w-full h-12 text-[15px] font-bold mt-4 rounded-[10px]" 
                    onClick={() => { setStep('location'); setFrom(''); setTo(''); setBookedTrip(null); }}
                  >
                    Book Another Ride
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-[#19A974]/10 text-[#19A974] flex items-center justify-center mb-1">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Ride Confirmed!</h2>
                    <p className="text-muted mt-1 text-[14px]">Your driver is on the way to {bookedTrip?.from || STOPS[from]?.name}.</p>
                  </div>
                  
                  <div className="bg-muted/5 border border-border-color rounded-[16px] p-5 w-full flex flex-col gap-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Booking ID</span>
                      <span className="font-mono font-bold text-[14px] text-foreground">{bookedTrip?.id || 'SH-98321'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Vehicle</span>
                      <span className="font-bold text-[14px] text-foreground">{bookedTrip?.vehicle || 'SH-04 (Tata Starbus)'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-muted uppercase tracking-wider">PIN Code</span>
                      <span className="font-bold text-[16px] tracking-widest text-[#2457E6]">4092</span>
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-2.5 mt-2">
                    <Button 
                      className="w-full h-12 text-[15px] font-bold rounded-[10px]" 
                      onClick={() => { setStep('location'); setFrom(''); setTo(''); setBookedTrip(null); }}
                    >
                      Done
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/rider/trips')}
                        className="flex-1 h-11 text-[13px] font-bold rounded-[8px]"
                      >
                        View in My Trips
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelCurrentRide}
                        disabled={isCancellingRide}
                        className="flex-1 h-11 text-[13px] font-bold text-[#E25555] border-[#E25555]/30 hover:bg-[#E25555]/10 hover:border-[#E25555] rounded-[8px]"
                      >
                        {isCancellingRide ? 'Cancelling...' : 'Cancel Ride'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {step === 'location' && (
          <div className="p-8 pt-4 bg-surface border-t border-border-color shrink-0">
            <button 
              className={cn(
                "relative w-full h-14 text-[16px] font-bold rounded-[10px] overflow-hidden transition-all duration-300",
                (!from || !to || from === to) 
                  ? "bg-muted/10 text-muted cursor-not-allowed" 
                  : "bg-[#2457E6] text-white hover:bg-[#1C46BA] shadow-[0_8px_20px_rgba(36,87,230,0.3)] hover:shadow-[0_12px_25px_rgba(36,87,230,0.4)] hover:-translate-y-0.5"
              )}
              disabled={!from || !to || from === to}
              onClick={() => setStep('shuttles')}
            >
              {(!from || !to || from === to) ? 'Select Locations' : 'Find Shuttles'}
              {from && to && from !== to && (
                <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right Map Area */}
      <div className="flex-1 relative">
        <LiveMap 
          routes={Object.values(ROUTES)}
          markers={[
            ...Object.values(STOPS).map(s => ({
              ...s,
              isActive: s.id === from || s.id === to,
              color: s.id === from ? '#19A974' : (s.id === to ? '#3867FF' : undefined)
            })),
            ...(customFrom && from === 'custom-from' ? [{
              id: 'custom-from',
              type: 'pin' as const,
              name: customFromName || 'Pinned Pickup',
              lat: customFrom.lat,
              lng: customFrom.lng,
              isActive: true,
              color: '#19A974'
            }] : []),
            ...(customTo && to === 'custom-to' ? [{
              id: 'custom-to',
              type: 'pin' as const,
              name: customToName || 'Pinned Drop-off',
              lat: customTo.lat,
              lng: customTo.lng,
              isActive: true,
              color: '#3867FF'
            }] : [])
          ]} 
          center={[31.2560, 75.7051]} 
          zoom={15} 
          onMarkerClick={(marker) => {
            if (!from) {
              setFrom(marker.id);
            } else if (!to && marker.id !== from) {
              setTo(marker.id);
            } else if (from && to) {
              setFrom(marker.id);
              setTo('');
            }
          }}
          onMapClick={(latlng) => {
            if (!from || (from && to)) {
              setCustomFrom(latlng);
              setFrom('custom-from');
              setTo('');
            } else if (!to) {
              setCustomTo(latlng);
              setTo('custom-to');
            }
          }}
          onMarkerDragEnd={(marker, newLatLng) => {
            if (marker.id === 'custom-from') setCustomFrom(newLatLng);
            if (marker.id === 'custom-to') setCustomTo(newLatLng);
          }}
        />

        {/* Floating elements on map */}
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-surface/90 backdrop-blur-md p-2 rounded-[12px] border border-border-color shadow-lg">
           <div className="w-8 h-8 rounded-[8px] bg-brand-blue/10 flex items-center justify-center text-brand-blue">
             <MapIcon size={16} />
           </div>
           <div className="pr-3 pl-1">
             <div className="text-[12px] font-bold leading-tight">Live Map</div>
             <div className="text-[10px] font-medium text-muted">Auto-updating</div>
           </div>
        </div>
      </div>

    </div>
  );
}
