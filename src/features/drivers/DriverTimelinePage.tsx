import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDrivers, fetchBookings } from '@/shared/api/client';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import type { Driver, Booking } from '@/domain/types';
import { cn } from '@/shared/utils/cn';
import { LogIn, LogOut, Coffee, X, Plus } from 'lucide-react';
import { AddDriverModal } from './AddDriverModal';

// Helper to generate hours from 6 AM to 10 PM
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

type CustomSchedule = { id: string; driverId: string; type: 'duty' | 'break'; startHour: number; duration: number; };

import { useMapStore } from '@/shared/store/mapStore';
export function DriverTimelinePage() {
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  });

  const [customSchedules, setCustomSchedules] = useState<CustomSchedule[]>([
    { id: '1', driverId: 'd1', type: 'duty', startHour: 6, duration: 8 },
    { id: '2', driverId: 'd2', type: 'duty', startHour: 8, duration: 8 },
  ]);
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, driverId: string, hour: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  if (driversLoading || bookingsLoading) return <div className="p-8">Loading timeline...</div>;

  const handleAddSchedule = (type: 'duty' | 'break', duration: number = 2) => {
    if (!contextMenu) return;
    setCustomSchedules(prev => [...prev, {
      id: Math.random().toString(),
      driverId: contextMenu.driverId,
      type,
      startHour: contextMenu.hour,
      duration
    }]);
    setContextMenu(null);
  };

  const handleRemoveSchedule = (id: string) => {
    setCustomSchedules(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-full relative" onClick={() => contextMenu && setContextMenu(null)}>
      <div className="p-8 pb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Schedules</h1>
          <p className="text-muted mt-1">Manage duty cycles, breaks, and overlapping trips.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAddModal(true)} className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
            <Plus size={16} /> Add Shuttle
          </Button>
          <Button variant="outline">&lt; Previous</Button>
          <Button variant="secondary">Today</Button>
          <Button variant="outline">Next &gt;</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-border rounded-lg bg-surface shadow-sm overflow-hidden min-w-[1000px]">
          
          {/* Timeline Header */}
          <div className="flex border-b border-border bg-muted/5 sticky top-0 z-10">
            <div className="w-64 shrink-0 p-4 font-semibold text-muted border-r border-border bg-surface">
              Driver
            </div>
            <div className="flex-1 flex">
              {HOURS.map((hour) => (
                <div key={hour} className="flex-1 min-w-[60px] p-2 text-xs font-medium text-muted text-center border-r border-border last:border-r-0 tabular-nums">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="flex flex-col divide-y divide-border relative">
            {drivers?.map((driver) => (
              <TimelineRow 
                key={driver.id} 
                driver={driver} 
                bookings={bookings || []}
                schedules={customSchedules.filter(s => s.driverId === driver.id)}
                onContextMenu={(x, y, hour) => setContextMenu({ x, y, driverId: driver.id, hour })}
                onRemoveSchedule={handleRemoveSchedule}
              />
            ))}
          </div>
        </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed z-50 bg-surface border border-border-color rounded-[8px] shadow-xl py-1 flex flex-col w-[160px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-border-color mb-1">
            {contextMenu.hour}:00
          </div>
          <button onClick={() => handleAddSchedule('duty', 8)} className="px-3 py-1.5 text-left text-[13px] hover:bg-muted/10 flex items-center gap-2">
            <LogIn size={14} className="text-[#3867FF]" /> Start Duty
          </button>
          <button onClick={() => handleAddSchedule('duty', 4)} className="px-3 py-1.5 text-left text-[13px] hover:bg-muted/10 flex items-center gap-2">
            <LogOut size={14} className="text-[#E25555]" /> End Duty
          </button>
          <button onClick={() => handleAddSchedule('break', 1)} className="px-3 py-1.5 text-left text-[13px] hover:bg-muted/10 flex items-center gap-2">
            <Coffee size={14} className="text-[#F59E0B]" /> Add Break
          </button>
        </div>
      )}
      
      {showAddModal && <AddDriverModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function TimelineRow({ 
  driver, 
  bookings, 
  schedules,
  onContextMenu,
  onRemoveSchedule 
}: { 
  driver: Driver; 
  bookings: Booking[]; 
  schedules: CustomSchedule[];
  onContextMenu: (x: number, y: number, hour: number) => void;
  onRemoveSchedule: (id: string) => void;
}) {
  const driverBookings = bookings.filter(b => b.driverId === driver.id);
  const ROUTES = useMapStore(state => state.routes);
  const STOPS = useMapStore(state => state.stops);
  const [selectedTrip, setSelectedTrip] = useState<Booking | null>(null);

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hourWidth = rect.width / 16;
    const clickedHour = 6 + Math.floor(x / hourWidth);
    onContextMenu(e.clientX, e.clientY, clickedHour);
  };

  return (
    <div className="flex group hover:bg-muted/5 transition-colors h-[72px]">
      <div className="w-64 shrink-0 p-4 border-r border-border bg-surface flex flex-col justify-center gap-1 z-10 sticky left-0 group-hover:bg-muted/5 transition-colors">
        <div className="font-medium text-foreground">{driver.name}</div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={driver.status === 'online' ? 'success' : driver.status === 'on_break' ? 'warning' : 'default'}>
            {(driver.status || 'offline').replace('_', ' ')}
          </Badge>
          <span className="text-muted">{driver.vehicleId || 'Unknown'}</span>
        </div>
      </div>
      <div 
        className="flex-1 flex relative bg-[linear-gradient(90deg,transparent_calc(100%-1px),var(--border)_calc(100%-1px))] bg-[length:calc(100%/17)_100%] cursor-crosshair"
        onClick={handleGridClick}
      >
        
        {/* Render Scheduled Blocks (Duties, Breaks) */}
        {schedules.map(schedule => (
          <ScheduleBlock 
            key={schedule.id}
            startHour={schedule.startHour}
            duration={schedule.duration}
            type={schedule.type}
            label={schedule.type === 'duty' ? 'Duty' : 'Break'}
            onRemove={() => onRemoveSchedule(schedule.id)}
          />
        ))}

        {/* Dynamic Booking Blocks overlaying duties */}
        {driverBookings.map(booking => {
          const [h, m] = booking.requestedPickupTime.split(':').map(Number);
          const startHour = h + (m / 60);
          
          return (
            <ScheduleBlock 
              key={booking.id}
              startHour={startHour} 
              duration={0.75}
              type="trip" 
              label={`Trip ${booking.id}`} 
              color={{ bg: ROUTES[booking.routeId]?.color || 'var(--route-blue)', text: '#fff' }} 
              onClick={() => setSelectedTrip(booking)}
            />
          );
        })}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-surface border border-border-color rounded-[12px] w-[320px] p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-[16px]">Trip Details</h3>
              <button onClick={() => setSelectedTrip(null)} className="text-muted hover:text-foreground">✕</button>
            </div>
            <div className="text-[13px] flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-muted">Booking ID:</span>
                <span className="font-bold">{selectedTrip.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Rider:</span>
                <span className="font-bold">{selectedTrip.riderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Route:</span>
                <span className="font-bold" style={{ color: ROUTES[selectedTrip.routeId]?.color || 'var(--route-blue)' }}>{ROUTES[selectedTrip.routeId]?.name || 'Unknown Route'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">From:</span>
                <span className="font-bold">{STOPS[selectedTrip.fromStopId]?.name || selectedTrip.fromStopId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">To:</span>
                <span className="font-bold">{STOPS[selectedTrip.toStopId]?.name || selectedTrip.toStopId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Pickup Time:</span>
                <span className="font-bold">{selectedTrip.requestedPickupTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                <span className="font-bold uppercase tracking-wider text-[11px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full">{selectedTrip.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleBlock({ startHour, duration, type, label, color, onClick, onRemove }: { 
  startHour: number, 
  duration: number, 
  type: 'trip' | 'duty' | 'break',
  label: string,
  color?: { bg: string, text: string },
  onClick?: () => void,
  onRemove?: () => void
}) {
  const leftPct = Math.max(0, ((startHour - 6) / 16) * 100);
  const widthPct = (duration / 16) * 100;

  const baseColors = {
    duty: 'bg-muted/10 text-muted border border-border-color/50',
    break: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 border-dashed',
    trip: color || 'bg-brand-blue text-white shadow-sm'
  };

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-3 text-xs font-medium",
        "transition-all hover:brightness-110 group/block",
        onClick && "cursor-pointer",
        type === 'trip' ? 'h-[32px] z-20 shadow-sm' : 'h-[48px] z-10',
        type !== 'trip' && baseColors[type]
      )}
      style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: type === 'trip' ? color?.bg : undefined, color: type === 'trip' ? color?.text : undefined }}
      title={label}
    >
      <span className="truncate flex-1">{label}</span>
      {onRemove && type !== 'trip' && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-2 text-current opacity-0 group-hover/block:opacity-100 transition-opacity hover:text-foreground"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
