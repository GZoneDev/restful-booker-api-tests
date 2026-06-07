import { test, expect } from '../lib/base-test';
import { loadTestConfig } from '../data/bookingData';

const { concurrentUsers, durationMs, thresholds } = loadTestConfig;

test('Load test — 20 concurrent users, 1 min', async ({ bookingApi }) => {
  const results: number[] = [];
  const errors: number[] = [];
  const deadline = Date.now() + durationMs;

  async function virtualUser() {
    while (Date.now() < deadline) {
      const t = Date.now();
      try {
        const res = await bookingApi.getBookingIds();
        if (res.ok()) results.push(Date.now() - t);
        else errors.push(res.status());
      } catch {
        errors.push(0);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrentUsers }, virtualUser));

  results.sort((a, b) => a - b);
  const p50 = results[Math.floor(results.length * 0.5)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const p99 = results[Math.floor(results.length * 0.99)];
  const rps = Math.round(results.length / (durationMs / 1000));

  console.log(`Total requests : ${results.length}`);
  console.log(`Errors         : ${errors.length}`);
  console.log(`RPS            : ${rps}`);
  console.log(`p50            : ${p50}ms`);
  console.log(`p95            : ${p95}ms`);
  console.log(`p99            : ${p99}ms`);

  expect(errors.length / results.length).toBeLessThan(thresholds.errorRate);
  expect(p95).toBeLessThan(thresholds.p95Ms);
  expect(p99).toBeLessThan(thresholds.p99Ms);
});
