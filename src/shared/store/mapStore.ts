import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MapMarkerData } from '@/shared/components/ui/LiveMap';

type StopData = MapMarkerData & { desc: string };

export type RouteData = {
  id: string;
  name: string;
  color: string;
  path: [number, number][];
};

interface MapState {
  stops: Record<string, StopData>;
  routes: Record<string, RouteData>;
  addStop: (stop: StopData) => void;
  removeStop: (id: string) => void;
  addRoute: (route: RouteData) => void;
  removeRoute: (id: string) => void;
}

const INITIAL_STOPS: Record<string, StopData> = {
  'Library': { id: 'Library', lat: 31.2560, lng: 75.7051, name: 'Main Library', desc: 'Central Library Campus' },
  'Hostel': { id: 'Hostel', lat: 31.2530, lng: 75.7081, name: 'BH-1', desc: 'Boys Hostel 1' },
  'Gate': { id: 'Gate', lat: 31.2580, lng: 75.7021, name: 'Main Gate', desc: 'University Entry' },
};

const INITIAL_ROUTES: Record<string, RouteData> = {
  'r1': {
    id: 'r1',
    name: 'Campus Loop A',
    color: '#8B5CF6',
    path: [
      [31.2560, 75.7051],
      [31.2530, 75.7081],
      [31.2580, 75.7021],
      [31.2560, 75.7051],
    ]
  }
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      stops: INITIAL_STOPS,
      routes: INITIAL_ROUTES,
      addStop: (stop) => set((state) => ({ stops: { ...state.stops, [stop.id]: stop } })),
      removeStop: (id) => set((state) => {
        const newStops = { ...state.stops };
        delete newStops[id];
        return { stops: newStops };
      }),
      addRoute: (route) => set((state) => ({ routes: { ...state.routes, [route.id]: route } })),
      removeRoute: (id) => set((state) => {
        const newRoutes = { ...state.routes };
        delete newRoutes[id];
        return { routes: newRoutes };
      })
    }),
    {
      name: 'shuttle-map-storage',
    }
  )
);
