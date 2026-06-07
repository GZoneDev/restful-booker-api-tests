import { test, expect } from '../lib/base-test';
import {
  validBooking,
  incompleteBooking,
  invalidCredentials,
  nonExistingId,
  nonNumericId,
  invalidToken,
} from '../data/bookingData';

test.describe('Negative Tests', () => {

  test('N-01 | GET /booking/:id with non-existing ID → 404', async ({ bookingApi }) => {
    const res = await bookingApi.getBookingById(nonExistingId);

    expect([404, 400]).toContain(res.status());
  });

  test('N-02 | POST /auth with wrong credentials → "Bad credentials"', async ({ authApi }) => {
    const res = await authApi.postAuth(invalidCredentials);

    // API always returns 200 — body carries the error (documented in BUG_REPORT.md)
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('N-03 | DELETE /booking/:id without auth → 403', async ({ bookingApi}) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const res = await bookingApi.deleteBookingNoAuth(bookingId);

    expect(res.status()).toBe(403);
  });

  test('N-04 | PUT /booking/:id without auth → 403', async ({ bookingApi }) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const res = await bookingApi.updateBookingNoAuth(bookingId, {
      ...validBooking,
      firstname: 'Hacker',
    });

    expect(res.status()).toBe(403);
  });

  test('N-05 | PATCH /booking/:id with invalid token → 403', async ({ bookingApi }) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const res = await bookingApi.patchBookingWithToken(
      bookingId,
      { firstname: 'Evil' },
      invalidToken,
    );

    expect(res.status()).toBe(403);
  });

  test('N-06 | POST /booking with missing required fields → 400 or 500', async ({ bookingApi }) => {
    const res = await bookingApi.createBooking(incompleteBooking);

    expect([400, 422, 500]).toContain(res.status());
  });

  test('N-07 | GET /booking/:id with non-numeric ID → 400 or 404', async ({ bookingApi }) => {
    const res = await bookingApi.getBookingById(nonNumericId);

    expect([400, 404]).toContain(res.status());
  });

});
