import type { BookingPayload } from '../api/booking.api';

export const validBooking: BookingPayload = {
  firstname: 'Jane',
  lastname: 'Doe',
  totalprice: 250,
  depositpaid: true,
  bookingdates: {
    checkin: '2025-09-01',
    checkout: '2025-09-07',
  },
  additionalneeds: 'Breakfast',
};

export const updatedBooking: BookingPayload = {
  ...validBooking,
  firstname: 'UpdatedName',
  totalprice: 999,
};

export const e2eBooking: BookingPayload = {
  firstname: 'E2EUser',
  lastname: 'TestFlow',
  totalprice: 500,
  depositpaid: false,
  bookingdates: {
    checkin: '2025-11-01',
    checkout: '2025-11-10',
  },
  additionalneeds: 'Late checkout',
};

export const incompleteBooking = {
  firstname: 'Only',
};

export const invalidDateBooking = {
  ...validBooking,
  bookingdates: {
    checkin: '01-09-2025',   // wrong format, should be YYYY-MM-DD
    checkout: '07-09-2025',
  },
};

export const validCredentials = {
  username: 'admin',
  password: 'password123',
};

export const invalidCredentials = {
  username: 'wronguser',
  password: 'wrongpass',
};

export const nonExistingId = 999_999_999;
export const nonNumericId  = 'not-a-number';
export const invalidToken  = 'totallyinvalidtoken';

export const loadTestConfig = {
  concurrentUsers: 20,
  durationMs: 60_000,
  thresholds: {
    errorRate: 0.01,  // < 1% errors
    p95Ms: 1_500,     // p95 < 1.5s
    p99Ms: 3_000,     // p99 < 3s
  },
};
