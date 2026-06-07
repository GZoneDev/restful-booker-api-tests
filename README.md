# Restful Booker API Test Suite

Automated API test project for the [Restful Booker API](https://restful-booker.herokuapp.com) and the [DNE Calculator SOAP API](http://www.dneonline.com/calculator.asmx?WSDL).

---

## Tools Used

| Tool | Purpose |
|------|---------|
| **[Playwright](https://playwright.dev/)** (`@playwright/test`) | REST & SOAP functional API testing |
| **[Artillery](https://www.artillery.io/)** | Load / stress testing (REST & SOAP) |
| **TypeScript** | Type safety in test code |

### Why Playwright for API testing?

Playwright's `APIRequestContext` provides a clean, promise-based HTTP client built into the test framework. Benefits:
- No extra HTTP library needed (no axios/supertest)
- Native TypeScript support
- Rich assertion library (`expect`)
- Beautiful HTML reports out of the box
- Same tool can test REST *and* raw SOAP (sends arbitrary HTTP)
- Parallel test execution by default

### Why Artillery for load testing?

- YAML-based scenario definition — easy to read and review in Git
- Supports HTTP (REST) and raw body (SOAP) scenarios
- Built-in metrics: latency percentiles (p50, p95, p99), RPS, error rates
- Generates HTML reports
- Widely adopted in the industry

---

## Project Structure

```
restful-booker-api-tests/
├── api/ # ADD API POM
├── lib/
│   ├── base-test.ts #Register API POM
├── tests/
│   ├── booking.spec.ts       # REST API tests (positive, negative, E2E)
│   └── soap.spec.ts          # SOAP API tests
├── reports/
│   └── LOAD_TEST_RESULTS.md  # Load test results summary
├── BUG_REPORT.md             # Bug report & observations
├── playwright.config.ts      # Playwright configuration
└── package.json
```

---

## ▶️ How to Run Functional Tests

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Install dependencies

```bash
npm install
npx playwright install
npm install --save-dev dotenv
```

### 2. Run all tests

```bash
npm test
```

### 3. Run with HTML report

```bash
npm run test:report
npx playwright show-report reports/html
```

### 4. Run tests with UI mode

```bash
npm run test:ui
```

## 📋 Covered Scenarios

### ✅ Positive Tests (REST)

| ID | Endpoint | Description |
|----|----------|-------------|
| P-01 | `GET /ping` | Health check returns 201 |
| P-02 | `POST /booking` | Creates booking, validates all fields |
| P-03 | `GET /booking` | Returns list of IDs, validates structure |
| P-04 | `GET /booking` | Filter by firstname/lastname |
| P-05 | `POST /auth` | Valid credentials return a token |
| P-06 | `GET /booking/:id` | Retrieves correct booking by ID |
| P-07 | `PUT /booking/:id` | Full update with token |
| P-08 | `PATCH /booking/:id` | Partial update with token, fields preserved |
| P-09 | `DELETE /booking/:id` | Delete with token returns 201 |
| P-10 | `GET /booking` | Content-Type header is application/json |

### ❌ Negative Tests (REST)

| ID | Endpoint | Description |
|----|----------|-------------|
| N-01 | `GET /booking/:id` | Non-existing ID → 404 |
| N-02 | `POST /auth` | Wrong credentials → "Bad credentials" |
| N-03 | `DELETE /booking/:id` | No auth → 403 |
| N-04 | `PUT /booking/:id` | No auth → 403 |
| N-05 | `PATCH /booking/:id` | Invalid token → 403 |
| N-06 | `POST /booking` | Missing required fields → 400/500 |
| N-07 | `GET /booking/:id` | Non-numeric ID → 400/404 |

### 🔁 E2E Flow

```
ping → create booking → get booking → auth → PUT → PATCH → DELETE → verify 404
```

### 🧾 SOAP Tests

| ID | Operation | Description |
|----|-----------|-------------|
| S-01 | Add | 10 + 5 = 15 ✅ |
| S-02 | Subtract | 20 - 8 = 12 ✅ |
| S-03 | Multiply | 7 × 6 = 42 ✅ |
| S-04 | Divide | 100 ÷ 4 = 25 ✅ |
| S-05 | Add (negative) | Malformed envelope → SOAP Fault or 400/500 ❌ |

---

## ⚠️ Known Limitations

1. **Shared test server** – `https://restful-booker.herokuapp.com` is public and shared. Booking IDs created by other users may appear in list responses.
2. **No cleanup fixture** – Tests create bookings but rely on auth-delete; if a test fails mid-way, orphan bookings may remain.
3. **Heroku cold start** – First request after inactivity may take 10–15 s; the first test may occasionally time out.
4. **SOAP service availability** – `dneonline.com` is a third-party public service with no SLA; occasional downtime is possible.
5. **Artillery HTML report** – `artillery report` requires the `@artillery/plugin-publish-metrics` to be installed separately for cloud dashboards.
6. **BUG-001** – `POST /auth` always returns 200, even on invalid credentials (see `BUG_REPORT.md`).
7. **BUG-002** – `POST /booking` with missing fields returns 500 instead of 400.
8. **BUG-003** – `DELETE /booking/:id` returns 201 Created (semantically incorrect).

---

## 💡 What I Would Improve With More Time

1. **Test data factory** – A helper to generate unique booking data per test run (using `faker`) to avoid conflicts on the shared server.
2. **Global setup/teardown** – Use Playwright's `globalSetup` to obtain an auth token once and share it across all tests that need it, rather than re-authenticating in each test.
3. **Schema validation** – Integrate `ajv` or `zod` to validate response schemas against a defined contract (JSON Schema / OpenAPI spec).
4. **CI/CD pipeline** – Add a `.github/workflows/tests.yml` to run the suite on every PR and publish the Playwright HTML report as a GitHub Pages artifact.
5. **Artillery Cloud** – Use Artillery Cloud for real-time dashboards and historical comparison of load test runs.
6. **Contract testing** – Add Pact (consumer-driven contract tests) to lock the API contract and detect breaking changes early.
7. **More negative cases** – Date format validation, very large payloads, SQL injection attempts in string fields.
8. **Environment config** – Move base URLs and credentials to `.env` files (never hardcode in test files in production).
