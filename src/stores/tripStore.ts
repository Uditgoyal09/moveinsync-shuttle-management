import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateBooking } from '@/shared/api/client';

export type Trip = {
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

export const INITIAL_TRIPS: Trip[] = [
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

interface TripState {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  cancelTrip: (tripId: string) => Promise<void>;
  resetTrips: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: INITIAL_TRIPS,
      addTrip: (trip) => {
        set((state) => {
          // If a trip with this ID already exists, do not duplicate
          if (state.trips.some((t) => t.id === trip.id)) {
            return state;
          }
          // Remove any stale duplicate upcoming trips created in the same minute
          const cleaned = state.trips.filter((t) => t.id !== trip.id);
          return {
            trips: [trip, ...cleaned]
          };
        });
      },
      cancelTrip: async (tripId: string) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId ? { ...t, status: 'cancelled' } : t
          )
        }));
        try {
          await updateBooking(tripId, { status: 'cancelled' });
        } catch {
          // If it's a client mock trip that doesn't exist on server, silent catch
        }
      },
      resetTrips: () => set({ trips: INITIAL_TRIPS })
    }),
    {
      name: 'campusride-rider-trips',
    }
  )
);
