import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookings, updateBooking } from '@/shared/api/client';
import { Search, Filter, Plus, Calendar, User, Bus, MoreVertical, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { AssignDriverModal } from './AssignDriverModal';
import { NewBookingModal } from './NewBookingModal';
import type { Booking } from '@/domain/types';

import { useMapStore } from '@/shared/store/mapStore';

// Removed hardcoded STOP_NAMES and ROUTE_NAMES

const STATUS_COLORS: Record<string, { bg: string, text: string }> = {
  waiting: { bg: 'bg-[#E25555]/10 border-[#E25555]/20', text: 'text-[#E25555]' },
  accepted: { bg: 'bg-[#19A974]/10 border-[#19A974]/20', text: 'text-[#19A974]' },
  ongoing: { bg: 'bg-[var(--route-blue)]/10 border-[var(--route-blue)]/20', text: 'text-[var(--route-blue)]' },
  completed: { bg: 'bg-border-color', text: 'text-muted' },
};

export function BookingsPage() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const STOPS = useMapStore(state => state.stops);
  const ROUTES = useMapStore(state => state.routes);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateBooking(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  });

  if (isLoading || !bookings) {
    return <div className="flex h-full items-center justify-center bg-background"><Loader2 className="animate-spin text-muted" /></div>;
  }

  const validBookings = bookings.filter(b => ROUTES[b.routeId]);
  const filteredBookings = filterStatus === 'all' 
    ? validBookings 
    : validBookings.filter(b => b.status === filterStatus);

  return (
    <div className="flex flex-col w-full h-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border-color shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Bookings History</h1>
          <p className="text-[14px] text-muted mt-1">Manage and assign all campus shuttle trips.</p>
        </div>
        <button onClick={() => setIsNewBookingOpen(true)} className="h-[40px] bg-[#2457E6] hover:bg-[#1A41BA] text-white px-5 rounded-[8px] text-[14px] font-bold transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-border-color shrink-0 flex items-center justify-between bg-surface/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-background border border-border-color rounded-[8px] h-[36px] px-3 w-[280px]">
            <Search size={16} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by ID or Rider..." 
              className="bg-transparent text-[13px] font-medium text-foreground placeholder:text-muted outline-none ml-2 w-full"
            />
          </div>
          <button className="h-[36px] border border-border-color bg-background hover:bg-border-color text-foreground px-4 rounded-[8px] text-[13px] font-bold transition-colors flex items-center gap-2">
            <Filter size={14} /> More filters
          </button>
        </div>

        <div className="flex bg-border-color rounded-[8px] p-1">
          {['all', 'waiting', 'accepted', 'ongoing', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-4 h-[28px] rounded-[6px] text-[12px] font-bold capitalize transition-colors",
                filterStatus === s 
                  ? "bg-surface text-foreground shadow-sm" 
                  : "text-muted hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="border border-border-color rounded-[12px] bg-surface overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-color bg-background/50">
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Rider</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Journey</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Driver/Vehicle</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-2">
                        <Bus size={32} className="text-muted" />
                      </div>
                      <div className="text-[16px] font-bold text-foreground">No bookings found</div>
                      <div className="text-[14px] text-muted max-w-sm">There are currently no active bookings matching your filters. Bookings will appear here once riders request them.</div>
                    </div>
                  </td>
                </tr>
              )}
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-background/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-bold text-foreground">{booking.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border-color flex items-center justify-center">
                        <User size={14} className="text-muted" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-foreground">{booking.riderName}</div>
                        <div className="text-[12px] text-muted mt-0.5">{booking.riderId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-[13px] font-medium text-foreground">{STOPS[booking.fromStopId]?.name || booking.fromStopId}</div>
                      <ArrowRight size={14} className="text-muted" />
                      <div className="text-[13px] font-medium text-foreground">{STOPS[booking.toStopId]?.name || booking.toStopId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-bold text-foreground">{ROUTES[booking.routeId]?.name || 'Unknown Route'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted" />
                      <span className="text-[13px] font-bold text-foreground">{booking.requestedPickupTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.driverId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center">
                           <Bus size={12} className="text-brand-blue" />
                        </div>
                        <span className="text-[13px] font-bold text-foreground">{booking.driverId}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAssigningBooking(booking)}
                        className="text-[12px] font-bold text-brand-blue hover:underline bg-brand-blue/10 px-2 py-1 rounded-[4px]"
                      >
                        Assign Driver
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border",
                      STATUS_COLORS[booking.status]?.bg,
                      STATUS_COLORS[booking.status]?.text
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative flex justify-end">
                      <button onClick={() => {
                        const next = booking.status === 'ongoing' ? 'completed' : booking.status === 'accepted' ? 'ongoing' : null;
                        if (next) statusMutation.mutate({ id: booking.id, status: next });
                      }} className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" title="Advance Status">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignDriverModal 
        booking={assigningBooking} 
        onClose={() => setAssigningBooking(null)} 
      />
      
      {isNewBookingOpen && (
        <NewBookingModal onClose={() => setIsNewBookingOpen(false)} />
      )}
    </div>
  );
}
