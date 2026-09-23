import { Map as MapIcon, Navigation, Bus, Clock, MoreVertical, Plus, Filter, Search } from 'lucide-react';

const ROUTES = [
  { id: 'r1', name: 'Blue Line', color: 'bg-[#3867FF]', stops: 5, shuttles: 4, frequency: '10 min', status: 'Active' },
  { id: 'r2', name: 'Orange Line', color: 'bg-[#F27A38]', stops: 4, shuttles: 3, frequency: '15 min', status: 'Active' },
  { id: 'r3', name: 'Green Line', color: 'bg-[#19A974]', stops: 6, shuttles: 5, frequency: '12 min', status: 'Active' },
  { id: 'r4', name: 'Violet Line', color: 'bg-[#8067E8]', stops: 4, shuttles: 2, frequency: '20 min', status: 'Active' },
  { id: 'r5', name: 'Pink Line', color: 'bg-[#D65A91]', stops: 3, shuttles: 1, frequency: '30 min', status: 'Reduced' },
  { id: 'r6', name: 'Teal Line', color: 'bg-[#19A7A8]', stops: 5, shuttles: 0, frequency: '-', status: 'Inactive' },
];

export function RoutesPage() {
  return (
    <div className="flex flex-col w-full h-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border-color shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Route Management</h1>
          <p className="text-[14px] text-muted mt-1">Manage transit lines, stops, and schedules.</p>
        </div>
        <button className="h-[40px] bg-[#2457E6] hover:bg-[#1A41BA] text-white px-5 rounded-[8px] text-[14px] font-bold transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Route
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-border-color shrink-0 flex items-center justify-between bg-surface/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-background border border-border-color rounded-[8px] h-[36px] px-3 w-[280px]">
            <Search size={16} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search routes..." 
              className="bg-transparent text-[13px] font-medium text-foreground placeholder:text-muted outline-none ml-2 w-full"
            />
          </div>
          <button className="h-[36px] border border-border-color bg-background hover:bg-border-color text-foreground px-4 rounded-[8px] text-[13px] font-bold transition-colors flex items-center gap-2">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="border border-border-color rounded-[12px] bg-surface overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-color bg-background/50">
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Route Details</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Stops</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Active Shuttles</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {ROUTES.map((route) => (
                <tr key={route.id} className="hover:bg-background/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${route.color} flex items-center justify-center shadow-sm`}>
                        <MapIcon size={14} className="text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-foreground">{route.name}</span>
                        <span className="text-[12px] text-muted uppercase tracking-wider mt-0.5">{route.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                      <Navigation size={14} className="text-muted" />
                      {route.stops} stops
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                      <Bus size={14} className="text-muted" />
                      {route.shuttles} vehicles
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                      <Clock size={14} className="text-muted" />
                      {route.frequency}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                      route.status === 'Active' ? 'bg-[#19A974]/10 border-[#19A974]/20 text-[#19A974]' :
                      route.status === 'Reduced' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]' :
                      'bg-border-color text-muted'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
