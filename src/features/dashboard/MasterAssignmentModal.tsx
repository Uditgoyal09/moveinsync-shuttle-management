import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings } from '@/shared/api/client';
import { X, Loader2 } from 'lucide-react';
import { AssignDriverModal } from '@/features/bookings/AssignDriverModal';

interface MasterAssignmentModalProps {
  onClose: () => void;
}

export function MasterAssignmentModal({ onClose }: MasterAssignmentModalProps) {
  const { data: bookings, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  if (isLoading || !bookings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  const unassigned = bookings.filter(b => !b.driverId && b.status === 'waiting');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border-color rounded-[16px] w-[500px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-border-color flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-foreground">Assignment Center</h2>
            <p className="text-[13px] text-[#E25555] font-bold mt-0.5">{unassigned.length} trips need drivers</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/10 text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 max-h-[400px] overflow-y-auto p-2">
          {unassigned.length === 0 ? (
            <div className="text-center py-12 text-[14px] text-muted font-bold">All trips are assigned!</div>
          ) : (
            <div className="flex flex-col gap-1">
              {unassigned.map(trip => (
                <div key={trip.id} className="p-4 border border-border-color rounded-[8px] flex items-center justify-between hover:bg-background/50 transition-colors">
                  <div>
                    <div className="text-[14px] font-bold text-foreground">{trip.id}</div>
                    <div className="text-[12px] text-muted mt-1">{trip.requestedPickupTime}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedBooking(trip)}
                    className="text-[12px] font-bold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 px-3 py-1.5 rounded-[6px] transition-colors"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <AssignDriverModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}
