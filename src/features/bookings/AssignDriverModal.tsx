import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDrivers, updateBooking } from '@/shared/api/client';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { Booking } from '@/domain/types';

interface AssignDriverModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export function AssignDriverModal({ booking, onClose }: AssignDriverModalProps) {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({ 
    queryKey: ['drivers'], 
    queryFn: fetchDrivers 
  });

  const mutation = useMutation({
    mutationFn: (driverId: string) => updateBooking(booking!.id, { driverId, status: 'accepted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
    },
  });

  if (!booking) return null;

  const filteredDrivers = drivers?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.vehicleId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border-color rounded-[16px] w-[440px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-border-color flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-foreground">Assign Driver</h2>
            <p className="text-[13px] text-muted mt-0.5">Booking {booking.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/10 text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-border-color bg-background/50">
          <div className="flex items-center bg-surface border border-border-color rounded-[8px] h-[36px] px-3">
            <Search size={16} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or vehicle..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-foreground placeholder:text-muted outline-none ml-2 w-full"
            />
          </div>
        </div>

        <div className="flex-1 max-h-[400px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-muted" /></div>
          ) : filteredDrivers?.length === 0 ? (
            <div className="text-center py-8 text-[13px] text-muted font-medium">No drivers found</div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredDrivers?.map(driver => (
                <button
                  key={driver.id}
                  onClick={() => mutation.mutate(driver.id)}
                  disabled={mutation.isPending}
                  className="flex items-center justify-between p-3 rounded-[8px] hover:bg-muted/10 text-left transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-border-color flex items-center justify-center border-2 border-surface overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} alt={driver.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-foreground">{driver.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] font-medium text-muted">{driver.vehicleId}</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", driver.status === 'online' ? 'bg-[#19A974]' : 'bg-muted')} />
                        <span className="text-[11px] font-medium capitalize text-muted">{driver.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  {mutation.isPending && mutation.variables === driver.id ? (
                    <Loader2 size={16} className="animate-spin text-brand-blue" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-border-color flex items-center justify-center group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors">
                      <Check size={12} className="text-transparent group-hover:text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
