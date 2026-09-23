import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchBookings } from '@/shared/api/client';
import { useMapStore } from '@/shared/store/mapStore';
import { Loader2 } from 'lucide-react';
import type { Booking } from '@/domain/types';

export function AnalyticsPage() {
  const { data: bookings, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
  const ROUTES = useMapStore(state => state.routes);

  if (isLoading || !bookings) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const demandMap: Record<string, number> = {};
  // Initialize hours 6 to 18
  for (let i = 6; i <= 18; i++) {
    demandMap[`${i.toString().padStart(2, '0')}:00`] = 0;
  }

  const routeMap: Record<string, number> = {};

  bookings.forEach(b => {
    const hour = b.requestedPickupTime.split(':')[0];
    const hourKey = `${hour}:00`;
    if (demandMap[hourKey] !== undefined) demandMap[hourKey]++;
    else demandMap[hourKey] = 1;

    if (!routeMap[b.routeId]) routeMap[b.routeId] = 0;
    routeMap[b.routeId]++;
  });

  const DEMAND_DATA = Object.entries(demandMap).sort((a, b) => a[0].localeCompare(b[0])).map(([time, count]) => ({ time, bookings: count }));
  
  const ROUTE_DATA = Object.entries(routeMap).map(([id, count]) => {
    const route = ROUTES[id];
    return { name: route?.name || 'Unknown Route', count, color: route?.color || 'var(--primary)' };
  }).sort((a, b) => b.count - a.count);

  const totalTrips = bookings.length;

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demand Analytics</h1>
        <p className="text-muted mt-1">Monitor campus shuttle usage, peak hours, and route capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="text-sm font-medium text-muted">Total Trips Today</div>
          <div className="text-4xl font-bold mt-2">{totalTrips}</div>
          <div className="text-xs text-green-600 mt-2 font-medium">↑ Real-time tracking</div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="text-sm font-medium text-muted">Peak Demand Hours</div>
          <div className="text-xl font-bold mt-2">
            {DEMAND_DATA.length > 0 ? DEMAND_DATA.reduce((prev, current) => (prev.bookings > current.bookings) ? prev : current).time : '--:--'}
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm bg-blue-50/50 border-blue-100">
          <div className="text-sm font-medium text-blue-800">Operational Insight</div>
          <div className="text-sm text-blue-900 mt-2">
            <strong>09:00–10:00:</strong> 85 bookings projected. 3 drivers available. Average vehicle capacity: 24.
            <br/><br/>
            <strong>Potential shortage:</strong> 1 vehicle needed on Blue Line.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand by Hour Chart */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold">Demand by Hour</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMAND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.1 }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route Usage Chart */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold">Route Usage (Today)</h2>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {ROUTE_DATA.length === 0 && (
              <div className="text-muted text-sm italic">No route data available.</div>
            )}
            {ROUTE_DATA.map((route) => (
              <div key={route.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{route.name}</span>
                  <span className="text-muted tabular-nums">{route.count} trips</span>
                </div>
                <div className="h-2 w-full bg-muted/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${Math.max(5, (route.count / Math.max(1, ROUTE_DATA[0]?.count || 1)) * 100)}%`, 
                      backgroundColor: route.color 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
