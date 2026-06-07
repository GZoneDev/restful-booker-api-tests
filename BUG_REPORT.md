# Bug Report & API Observations

## Summary

During test development against the **Restful Booker API** (`https://restful-booker.herokuapp.com`),
the following unexpected or noteworthy behaviors were observed.

---

## 🐞 BUG-001 – POST /auth returns HTTP 200 even on invalid credentials

| Field       | Value |
|-------------|-------|
| Endpoint    | `POST /auth` |
| Severity    | Medium |
| Status      | Confirmed |

**Expected behavior:** When invalid credentials are supplied, the API should return HTTP `401 Unauthorized`.

**Actual behavior:** The API always returns HTTP `200 OK`, but the response body contains:
```json
{ "reason": "Bad credentials" }
```
instead of a token.

**Impact:** Clients must inspect the response body to detect auth failure; relying on the status code alone leads to false positives.

**Test reference:** `N-02`

---

## 🐞 BUG-002 – POST /booking accepts incomplete payloads and returns HTTP 500

| Field       | Value |
|-------------|-------|
| Endpoint    | `POST /booking` |
| Severity    | Medium |
| Status      | Confirmed |

**Expected behavior:** When mandatory fields (`lastname`, `totalprice`, `depositpaid`, `bookingdates`) are missing,
the API should return `400 Bad Request` with an error description.

**Actual behavior:** The API returns `500 Internal Server Error` with no body or a generic error message.

**Impact:** Poor developer experience; impossible to distinguish client error from server error.

**Test reference:** `N-06`

---

## 🐞 BUG-003 – DELETE /booking returns 201 Created instead of 200 OK or 204 No Content

| Field       | Value |
|-------------|-------|
| Endpoint    | `DELETE /booking/:id` |
| Severity    | Low |
| Status      | Confirmed (design decision or known quirk) |

**Expected behavior:** A successful DELETE should return `200 OK` (with body) or `204 No Content`.

**Actual behavior:** Returns `201 Created` with body `"Deleted"`.

**Impact:** Confusing semantics — `201 Created` means a resource was *created*, not *deleted*.

**Test reference:** `P-09`, `E2E step 7`

---

## 🐞 BUG-004 – GET /booking/:id for a deleted booking may return 404 inconsistently

| Field       | Value |
|-------------|-------|
| Endpoint    | `GET /booking/:id` |
| Severity    | Low |
| Status      | Observed |

**Expected behavior:** After a successful delete, a GET for the same ID should consistently return `404`.

**Actual behavior:** Occasionally returns `404`, but on a shared/stateful test server the booking may be
re-created by other test runs, causing intermittent failures.

**Impact:** E2E test flakiness in shared environments.

**Mitigation:** Use unique booking data per test run; the test suite already does this.

---

## 📋 Observations

- The API has **no rate limiting** — load tests can run without throttling issues.
- `PUT /booking/:id` requires *all* fields to be present; partial PUT returns `400`.
- `Basic Auth` header (`Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`) works in addition to the Cookie token.
- Date format for `bookingdates` must be `YYYY-MM-DD`; other formats may cause `500`.
