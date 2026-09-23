import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { RouteLine } from '@/shared/components/ui/RouteLine';
import { Calendar, Clock, MapPin, BusFront, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type Trip = {
  id: string;
  date: string;
  time: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  from: string;
  to: string;
  driver: { name: string; rating: string; avatar: string };
  vehicle: string;
  color: string;
};

const MOCK_TRIPS: Trip[] = [
  {
    id: 'SH-98321',
    date: 'Today',
    time: '09:30 AM',
    status: 'upcoming',
    from: 'Hostel Block A',
    to: 'Academic Block',
    driver: { name: 'Aman Singh', rating: '4.8', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman' },
    vehicle: 'SH-04 (Tata Starbus)',
    color: '#3867FF'
  },
  {
    id: 'SH-98204',
    date: 'Yesterday, 21 Sep',
    time: '04:15 PM',
    status: 'completed',
    from: 'Library',
    to: 'Hostel Block A',
    driver: { name: 'Rahul Pal', rating: '4.6', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
    vehicle: 'SH-02 (Swaraj Mazda)',
    color: '#F27A38'
  },
  {
    id: 'SH-97882',
    date: '20 Sep 2026',
    time: '08:45 AM',
    status: 'completed',
    from: 'Main Gate',
    to: 'Academic Block',
    driver: { name: 'Aman Singh', rating: '4.8', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman' },
    vehicle: 'SH-04 (Tata Starbus)',
    color: '#3867FF'
  }
];

export function MyTripsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredTrips = MOCK_TRIPS.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted mt-2">View your upcoming rides and past journey history.</p>
        </div>
        <div className="flex bg-muted/10 p-1 rounded-[10px] border border-border-color">
          {(['all', 'upcoming', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-[6px] text-[13px] font-bold capitalize transition-colors",
                filter === f ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-12">
        {filteredTrips.map(trip => (
          <div key={trip.id} className="bg-surface border border-border-color rounded-[16px] overflow-hidden flex flex-col md:flex-row transition-all hover:border-brand-blue/50 hover:shadow-sm">
            
            {/* Left Side: Route and Times */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border-color bg-muted/5 flex flex-col justify-between gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted" />
                  <span className="text-[14px] font-bold">{trip.date} • {trip.time}</span>
                </div>
                {trip.status === 'upcoming' ? (
                  <span className="bg-[#3867FF]/10 text-[#3867FF] px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
                ) : (
                  <span className="bg-[#19A974]/10 text-[#19A974] px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">Completed</span>
                )}
              </div>

              <div className="flex gap-4 items-stretch relative min-h-[80px]">
                {/* Visual Route Line */}
                <div className="w-[12px] flex flex-col items-center py-1 relative z-10">
                   <div className="w-3 h-3 rounded-full bg-background border-2 shrink-0" style={{ borderColor: trip.color }} />
                   <div className="flex-1 w-[2px] border-l-2 border-dashed my-1" style={{ borderColor: trip.color, opacity: 0.3 }} />
                   <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: trip.color }} />
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

              {trip.status === 'upcoming' && (
                <Button variant="outline" className="w-full mt-4 text-[#E25555] border-[#E25555]/30 hover:bg-[#E25555]/10 hover:border-[#E25555]">
                  Cancel Ride
                </Button>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
