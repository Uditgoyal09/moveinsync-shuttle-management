import type { Booking, Driver } from '@/domain/types';

export async function fetchBookings(): Promise<Booking[]> {
  const response = await fetch('/api/bookings');
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
}

export async function fetchDrivers(): Promise<Driver[]> {
  const response = await fetch('/api/drivers');
  if (!response.ok) {
    throw new Error('Failed to fetch drivers');
  }
  return response.json();
}

export async function createDriver(data: Partial<Driver>): Promise<Driver> {
  const response = await fetch('/api/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create driver');
  return response.json();
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update booking');
  }
  return response.json();
}

export async function createBooking(data: Partial<Booking>): Promise<Booking> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create booking');
  }
  return response.json();
}
