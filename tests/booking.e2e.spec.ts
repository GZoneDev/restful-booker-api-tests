import { test, expect } from '../lib/base-test';
import { e2eBooking, validCredentials } from '../data/bookingData';

test.describe('E2E Flow', () => {

  test('Full booking lifecycle: ping → create → get → auth → PUT → PATCH → DELETE → verify', async ({ bookingApi, authApi   }) => {
    // ── Step 1: Health check ────────────────────────────────────────────────
    const ping = await bookingApi.ping();
    expect(ping.status(), 'Health check should return 201').toBe(201);
    console.log('✔ Health check passed');

    // ── Step 2: Create booking ──────────────────────────────────────────────
    const createRes = await bookingApi.createBooking(e2eBooking);
    expect(createRes.status(), 'Create booking should return 200').toBe(200);

    const createBody = await createRes.json();
    const bookingId: number = createBody.bookingid;
    expect(bookingId, 'Booking ID should be defined').toBeDefined();
    console.log(`✔ Booking created: ID=${bookingId}`);

    // ── Step 3: Get booking ─────────────────────────────────────────────────
    const getRes = await bookingApi.getBookingById(bookingId);
    expect(getRes.status(), 'GET booking should return 200').toBe(200);

    const getBody = await getRes.json();
    expect(getBody.firstname).toBe(e2eBooking.firstname);
    expect(getBody.lastname).toBe(e2eBooking.lastname);
    console.log('✔ Booking retrieved correctly');

    // ── Step 4: Authenticate ────────────────────────────────────────────────
    const token = await authApi.getToken(validCredentials);
    console.log(`✔ Token obtained: ${token}`);

    // ── Step 5: Full update (PUT) ───────────────────────────────────────────
    const putPayload = { ...e2eBooking, firstname: 'E2EUpdated', totalprice: 777 };
    const putRes = await bookingApi.updateBooking(bookingId, putPayload, token);
    expect(putRes.status(), 'PUT should return 200').toBe(200);

    const putBody = await putRes.json();
    expect(putBody.firstname).toBe('E2EUpdated');
    expect(putBody.totalprice).toBe(777);
    console.log('✔ Full update (PUT) successful');

    // ── Step 6: Partial update (PATCH) ──────────────────────────────────────
    const patchRes = await bookingApi.patchBooking(
      bookingId,
      { additionalneeds: 'Spa access' },
      token,
    );
    expect(patchRes.status(), 'PATCH should return 200').toBe(200);

    const patchBody = await patchRes.json();
    expect(patchBody.additionalneeds).toBe('Spa access');
    expect(patchBody.firstname).toBe('E2EUpdated'); // must be unchanged from PUT
    console.log('✔ Partial update (PATCH) successful');

    // ── Step 7: Delete booking ──────────────────────────────────────────────
    const deleteRes = await bookingApi.deleteBooking(bookingId, token);
    expect(deleteRes.status(), 'DELETE should return 201').toBe(201);
    console.log('✔ Booking deleted');

    // ── Step 8: Verify deleted → 404 ───────────────────────────────────────
    const verifyRes = await bookingApi.getBookingById(bookingId);
    expect(verifyRes.status(), 'Deleted booking should return 404').toBe(404);
    console.log('✔ Verified: booking no longer exists (404)');
  });

});
