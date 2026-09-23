import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '@/shared/api/client';
import { X, Loader2, MapPin, Calendar, User } from 'lucide-react';

interface NewBookingModalProps {
  onClose: () => void;
}
import { useMapStore } from '@/shared/store/mapStore';
export function NewBookingModal({ onClose }: NewBookingModalProps) {
  const queryClient = useQueryClient();
  const STOPS = useMapStore(state => state.stops);
  const ROUTES = useMapStore(state => state.routes);
  const firstRouteId = Object.keys(ROUTES)[0] || '';
  const firstStopId = Object.keys(STOPS)[0] || '';
  const secondStopId = Object.keys(STOPS)[1] || firstStopId;

  const [formData, setFormData] = useState({
    riderName: '',
    riderId: '',
    fromStopId: firstStopId,
    toStopId: secondStopId,
    routeId: firstRouteId,
    requestedPickupTime: '12:00'
  });

  const mutation = useMutation({
    mutationFn: () => createBooking({
      id: `B-${Math.floor(Math.random() * 9000) + 1000}`,
      ...formData,
      status: 'waiting',
      driverId: null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border-color rounded-[16px] w-[500px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-border-color flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-foreground">New Booking</h2>
            <p className="text-[13px] text-muted mt-0.5">Schedule a shuttle ride</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/10 text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-muted uppercase tracking-wider">Rider Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input required type="text" value={formData.riderName} onChange={e => setFormData(p => ({...p, riderName: e.target.value}))} className="w-full bg-background border border-border-color rounded-[8px] h-[40px] pl-10 pr-3 text-[13px] text-foreground focus:border-brand-blue outline-none transition-colors" placeholder="e.g. Rahul Sharma" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-muted uppercase tracking-wider">Student ID</label>
              <input required type="text" value={formData.riderId} onChange={e => setFormData(p => ({...p, riderId: e.target.value}))} className="w-full bg-background border border-border-color rounded-[8px] h-[40px] px-3 text-[13px] text-foreground focus:border-brand-blue outline-none transition-colors" placeholder="e.g. R-1029" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-muted uppercase tracking-wider">From Stop</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <select value={formData.fromStopId} onChange={e => setFormData(p => ({...p, fromStopId: e.target.value}))} className="w-full bg-background border border-border-color rounded-[8px] h-[40px] pl-10 pr-3 text-[13px] text-foreground focus:border-brand-blue outline-none transition-colors appearance-none">
                  {Object.values(STOPS).map(stop => (
                    <option key={stop.id} value={stop.id}>{stop.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-muted uppercase tracking-wider">To Stop</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <select value={formData.toStopId} onChange={e => setFormData(p => ({...p, toStopId: e.target.value}))} className="w-full bg-background border border-border-color rounded-[8px] h-[40px] pl-10 pr-3 text-[13px] text-foreground focus:border-brand-blue outline-none transition-colors appearance-none">
                  {Object.values(STOPS).map(stop => (
                    <option key={stop.id} value={stop.id}>{stop.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-muted uppercase tracking-wider">Pickup Time</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input required type="time" value={formData.requestedPickupTime} onChange={e => setFormData(p => ({...p, requestedPickupTime: e.target.value}))} className="w-full bg-background border border-border-color rounded-[8px] h-[40px] pl-10 pr-3 text-[13px] text-foreground focus:border-brand-blue outline-none transition-colors" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-muted uppercase tracking-wider">Route Network</label>
              <select value={formData.routeId} onChange={e => setFormData(p => ({...p, routeId: e.target.value}))} className="w-full bg-background border border-border-color rounded-[8px] h-[40px] px-3 text-[13px] text-foreground focus:border-brand-blue outline-none transition-colors appearance-none">
                {Object.values(ROUTES).map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 h-[40px] text-[13px] font-bold text-foreground bg-border-color hover:bg-muted/20 rounded-[8px] transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isPending || !firstRouteId} className="px-5 h-[40px] text-[13px] font-bold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-[8px] transition-colors flex items-center gap-2">
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Create Booking'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
