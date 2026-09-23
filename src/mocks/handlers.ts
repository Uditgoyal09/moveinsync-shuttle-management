import { http, HttpResponse, delay } from 'msw';
import { bookings as initialBookings, routes, drivers as initialDrivers, vehicles } from './seed';
import type { Booking, Driver } from '@/domain/types';

let bookings = [...initialBookings];
let drivers = [...initialDrivers];

export const handlers = [
  // Routes
  http.get('/api/routes', async () => {
    await delay(300);
    return HttpResponse.json(routes);
  }),

  // Drivers
  http.get('/api/drivers', async () => {
    await delay(300);
    return HttpResponse.json(drivers);
  }),

  http.post('/api/drivers', async ({ request }) => {
    await delay(300);
    const data = await request.json() as Partial<Driver>;
    const newDriver: Driver = {
      id: 'd-' + Date.now(),
      name: data.name || 'New Driver',
      vehicleId: data.vehicleId || 'Unknown Vehicle',
      status: 'online',
      rating: 5.0,
      routeIds: [],
      ...data,
    };
    drivers = [...drivers, newDriver];
    return HttpResponse.json(newDriver);
  }),

  // Bookings
  http.get('/api/bookings', async () => {
    await delay(400);
    return HttpResponse.json(bookings);
  }),

  http.post('/api/bookings', async ({ request }) => {
    await delay(400);
    const data = await request.json() as Partial<Booking>;
    const newBooking: Booking = {
      id: 'B-' + Date.now(),
      riderId: data.riderId || 'STU123',
      riderName: 'New Rider',
      routeId: data.routeId || '',
      fromStopId: data.fromStopId || '',
      toStopId: data.toStopId || '',
      date: new Date().toISOString(),
      requestedPickupTime: data.requestedPickupTime || '09:00',
      pickupTime: null,
      plannedDropTime: null,
      actualDropTime: null,
      status: 'waiting',
      driverId: null,
      vehicleId: null,
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    bookings = [newBooking, ...bookings];
    return HttpResponse.json(newBooking);
  }),

  http.patch('/api/bookings/:id', async ({ request, params }) => {
    await delay(400);
    const data = await request.json() as Partial<Booking>;
    const index = bookings.findIndex(b => b.id === params.id);
    if (index > -1) {
      bookings[index] = { ...bookings[index], ...data, updatedAt: new Date().toISOString() };
      return HttpResponse.json(bookings[index]);
    }
    return new HttpResponse('Not found', { status: 404 });
  })
];
