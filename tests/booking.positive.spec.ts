import { test, expect } from '../lib/base-test';
import {
  validBooking,
  updatedBooking,
  validCredentials,
} from '../data/bookingData';

test.describe('Positive Tests', () => {

  test('P-01 | GET /ping → 201 health check', async ({ bookingApi  }) => {
    const res = await bookingApi.ping();

    expect(res.status()).toBe(201);
    expect(await res.text()).toContain('Created');
  });

  test('P-02 | POST /booking → creates booking, returns full object', async ({ bookingApi  }) => {
    const res = await bookingApi.createBooking(validBooking);

    expect(res.status()).toBe(200);
    const body = await res.json();

    // Mandatory field checks
    expect(body).toHaveProperty('bookingid');
    expect(typeof body.bookingid).toBe('number');
    expect(body.booking.firstname).toBe(validBooking.firstname);
    expect(body.booking.lastname).toBe(validBooking.lastname);
    expect(body.booking.totalprice).toBe(validBooking.totalprice);
    expect(body.booking.depositpaid).toBe(true);
    expect(body.booking.bookingdates.checkin).toBe(validBooking.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(validBooking.bookingdates.checkout);
    expect(body.booking.additionalneeds).toBe(validBooking.additionalneeds);
  });

  test('P-03 | GET /booking → returns list of booking IDs', async ({ bookingApi  }) => {
    const res = await bookingApi.getBookingIds();

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Each item must have bookingid as a number
    body.slice(0, 5).forEach((item: { bookingid: unknown }) => {
      expect(item).toHaveProperty('bookingid');
      expect(typeof item.bookingid).toBe('number');
    });
  });

  test('P-04 | GET /booking with firstname/lastname filter → returns array', async ({ bookingApi }) => {
    const res = await bookingApi.getBookingIds({
      firstname: validBooking.firstname,
      lastname: validBooking.lastname,
    });

    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test('P-05 | POST /auth → returns valid token', async ({ authApi }) => {
    const res = await authApi.postAuth(validCredentials);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
    expect(body.token).not.toBe('Bad credentials');
  });

  test('P-06 | GET /booking/:id → returns correct booking', async ({ bookingApi  }) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const res = await bookingApi.getBookingById(bookingId);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.firstname).toBe(validBooking.firstname);
    expect(body.lastname).toBe(validBooking.lastname);
    expect(body.totalprice).toBe(validBooking.totalprice);
    expect(body.depositpaid).toBe(true);
    expect(body.bookingdates.checkin).toBe(validBooking.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(validBooking.bookingdates.checkout);
  });

  test('P-07 | PUT /booking/:id → full update with token', async ({ bookingApi, authApi   }) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const token = await authApi.getToken(validCredentials);

    const res = await bookingApi.updateBooking(bookingId, updatedBooking, token);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.firstname).toBe(updatedBooking.firstname);
    expect(body.totalprice).toBe(updatedBooking.totalprice);
  });

  test('P-08 | PATCH /booking/:id → partial update, other fields preserved', async ({ bookingApi, authApi }) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const token = await authApi.getToken(validCredentials);

    const res = await bookingApi.patchBooking(
      bookingId,
      { firstname: 'Patched', additionalneeds: 'Dinner' },
      token,
    );

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.firstname).toBe('Patched');
    expect(body.additionalneeds).toBe('Dinner');
    expect(body.lastname).toBe(validBooking.lastname);
  });

  test('P-09 | DELETE /booking/:id → 201 with valid token', async ({ bookingApi, authApi  }) => {
    const bookingId = await bookingApi.createAndGetId(validBooking);
    const token = await authApi.getToken(validCredentials);

    const res = await bookingApi.deleteBooking(bookingId, token);

    expect(res.status()).toBe(201);
  });

  test('P-10 | GET /booking → Content-Type is application/json', async ({ bookingApi }) => {
    const res = await bookingApi.getBookingIds();

    expect(res.headers()['content-type']).toContain('application/json');
  });

});
