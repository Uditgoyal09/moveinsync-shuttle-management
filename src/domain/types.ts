export type Role = 'Admin' | 'Rider';

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  active: boolean;
  stops: Stop[];
  driverIds: string[];
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  capacity: number;
  active: boolean;
}

export type DriverStatus = 'online' | 'offline' | 'on_break';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleId: string;
  routeIds: string[];
  status: DriverStatus;
  rating: number;
}

export type BookingStatus =
  | 'requested'
  | 'waiting'
  | 'accepted'
  | 'ongoing'
  | 'completed'
  | 'dropped'
  | 'declined'
  | 'cancelled'
  | 'no_show';

export interface BookingEvent {
  id: string;
  bookingId: string;
  type: string;
  message: string;
  timestamp: string;
  actor: string;
}

export interface Booking {
  id: string;
  riderId: string;
  riderName: string;
  routeId: string;
  fromStopId: string;
  toStopId: string;
  date: string;
  requestedPickupTime: string;
  pickupTime: string | null;
  plannedDropTime: string | null;
  actualDropTime: string | null;
  status: BookingStatus;
  driverId: string | null;
  vehicleId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  history: BookingEvent[];
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
