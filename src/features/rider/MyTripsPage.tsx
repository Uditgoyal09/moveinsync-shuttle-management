import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Clock, BusFront, Star, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTripStore, type Trip } from '@/stores/tripStore';

export function MyTripsPage() {
  const { trips, cancelTrip } = useTripStore();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [confirmCancelTrip, setConfirmCancelTrip] = useState<Trip | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const filteredTrips = trips.filter(t => filter === 'all' ? true : t.status === filter);

  const handleConfirmCancel = async () => {
    if (!confirmCancelTrip) return;
    setIsCancelling(true);
    try {
      await cancelTrip(confirmCancelTrip.id);
      setToastMessage(`Ride ${confirmCancelTrip.id} has been cancelled successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsCancelling(false);
      setConfirmCancelTrip(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-4 right-8 z-50 flex items-center gap-3 bg-surface border border-[#19A974]/40 shadow-xl rounded-[12px] p-4 text-[14px] font-semibold text-foreground animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={18} className="text-[#19A974] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-muted hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted mt-2">View your upcoming rides and past journey history.</p>
        </div>
        <div className="flex bg-muted/10 p-1 rounded-[10px] border border-border-color self-start sm:self-auto">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-[6px] text-[13px] font-bold capitalize transition-colors",
                filter === f ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Trip List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-12">
        {filteredTrips.length === 0 ? (
          <div className="bg-surface border border-border-color rounded-[16px] p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-muted/10 rounded-full flex items-center justify-center mb-3 text-muted">
              <BusFront size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground">No {filter !== 'all' ? filter : ''} rides found</h3>
            <p className="text-muted text-sm mt-1 max-w-sm">
              {filter === 'cancelled'
                ? "You haven't cancelled any rides."
                : filter === 'upcoming'
                ? 'No upcoming rides scheduled at the moment.'
                : 'Your ride bookings and history will show up here.'}
            </p>
          </div>
        ) : (
          filteredTrips.map(trip => (
            <div 
              key={trip.id} 
              className={cn(
                "bg-surface border border-border-color rounded-[16px] overflow-hidden flex flex-col md:flex-row transition-all hover:border-brand-blue/50 hover:shadow-sm",
                trip.status === 'cancelled' && "opacity-85 border-dashed"
              )}
            >
              
              {/* Left Side: Route and Times */}
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border-color bg-muted/5 flex flex-col justify-between gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted" />
                    <span className="text-[14px] font-bold">{trip.date} • {trip.time}</span>
                  </div>
                  {trip.status === 'upcoming' && (
                    <span className="bg-[#3867FF]/10 text-[#3867FF] px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">
                      Upcoming
                    </span>
                  )}
                  {trip.status === 'completed' && (
                    <span className="bg-[#19A974]/10 text-[#19A974] px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">
                      Completed
                    </span>
                  )}
                  {trip.status === 'cancelled' && (
                    <span className="bg-[#E25555]/10 text-[#E25555] px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">
                      Cancelled
                    </span>
                  )}
                </div>

                <div className="flex gap-4 items-stretch relative min-h-[80px]">
                  {/* Visual Route Line */}
                  <div className="w-[12px] flex flex-col items-center py-1 relative z-10">
                    <div 
                      className="w-3 h-3 rounded-full bg-background border-2 shrink-0" 
                      style={{ borderColor: trip.status === 'cancelled' ? '#E25555' : trip.color }} 
                    />
                    <div 
                      className="flex-1 w-[2px] border-l-2 border-dashed my-1" 
                      style={{ borderColor: trip.status === 'cancelled' ? '#E25555' : trip.color, opacity: 0.3 }} 
                    />
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: trip.status === 'cancelled' ? '#E25555' : trip.color }} 
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between py-0.5 flex-1 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-muted font-bold tracking-wide uppercase">Pickup</span>
                      <span className="text-[16px] font-bold text-foreground leading-tight">{trip.from}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-muted font-bold tracking-wide uppercase">Dropoff</span>
                      <span className="text-[16px] font-bold text-foreground leading-tight">{trip.to}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Driver and Actions */}
              <div className="w-full md:w-[280px] p-6 flex flex-col justify-between shrink-0 bg-surface">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Trip ID</span>
                    <span className="font-mono font-bold text-[13px]">{trip.id}</span>
                  </div>
                  
                  <div className="h-px w-full bg-border-color" />

                  <div className="flex items-center gap-3">
                    <img src={trip.driver.avatar} className="w-10 h-10 rounded-full bg-muted/20 border border-border-color" alt={trip.driver.name} />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold text-foreground leading-tight">{trip.driver.name}</span>
                        <ShieldCheck size={14} className="text-[#19A974]" />
                      </div>
                      <span className="text-[11px] font-medium text-muted mt-0.5 flex items-center gap-1">
                        <Star size={10} className="text-[#F59E0B]" fill="#F59E0B" /> {trip.driver.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted">
                    <BusFront size={14} />
                    <span className="text-[12px] font-semibold">{trip.vehicle}</span>
                  </div>
                </div>

                {/* Cancel Ride Action & Status Feedback */}
                {trip.status === 'upcoming' && (
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmCancelTrip(trip)}
                    className="w-full mt-4 text-[#E25555] border-[#E25555]/30 hover:bg-[#E25555]/10 hover:border-[#E25555] font-bold cursor-pointer transition-colors"
                  >
                    Cancel Ride
                  </Button>
                )}

                {trip.status === 'cancelled' && (
                  <div className="w-full mt-4 py-2 px-3 text-center text-[12px] font-bold text-[#E25555] bg-[#E25555]/10 rounded-[8px] border border-[#E25555]/20 flex items-center justify-center gap-1.5">
                    <XCircle size={14} /> Ride Cancelled
                  </div>
                )}

                {trip.status === 'completed' && (
                  <div className="w-full mt-4 py-2 px-3 text-center text-[12px] font-bold text-[#19A974] bg-[#19A974]/10 rounded-[8px] border border-[#19A974]/20 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} /> Journey Completed
                  </div>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmCancelTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border-color rounded-[20px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#E25555]/10 text-[#E25555] flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-xl font-bold text-foreground">Cancel this ride?</h3>
            <p className="text-muted text-[14px] mt-2">
              Are you sure you want to cancel ride <span className="font-mono font-bold text-foreground">{confirmCancelTrip.id}</span> from{' '}
              <strong className="text-foreground">{confirmCancelTrip.from}</strong> to{' '}
              <strong className="text-foreground">{confirmCancelTrip.to}</strong>?
            </p>

            <div className="bg-muted/5 border border-border-color rounded-[10px] p-3 my-4 flex items-center justify-between text-xs">
              <span className="text-muted">Departure:</span>
              <span className="font-semibold text-foreground">{confirmCancelTrip.date} at {confirmCancelTrip.time}</span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmCancelTrip(null)}
                disabled={isCancelling}
                className="flex-1 h-11 rounded-[8px] border border-border-color bg-background hover:bg-muted/10 text-foreground font-bold text-[14px] transition-colors"
              >
                Keep Ride
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 h-11 rounded-[8px] bg-[#E25555] hover:bg-[#C94242] text-white font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Ride'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
