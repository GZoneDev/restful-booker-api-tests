import { APIRequestContext, APIResponse } from '@playwright/test';
import { AppRoutes } from '../constant/endpoints.constant';
import { testConfig } from '../configs/config';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingResponse extends BookingPayload {}

export interface CreateBookingResponse {
  bookingid: number;
  booking: BookingResponse;
}

export interface BookingIdItem {
  bookingid: number;
}

export interface BookingFilterParams {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

export class BookingApi {
  constructor(private request: APIRequestContext) {}

  private getUrl(): string {
    return `${testConfig.baseUrl}${AppRoutes.bookingApi}`;
  }

  async ping(): Promise<APIResponse> {
    return this.request.get(`${testConfig.baseUrl}${AppRoutes.pingApi}`);
  }

  // ─── Booking CRUD ────────────────────────────────────────────────────────────
  async getBookingIds(params?: BookingFilterParams): Promise<APIResponse> {
    return this.request.get(this.getUrl(), { params });
  }

  /** GET /booking/:id */
  async getBookingById(id: number | string): Promise<APIResponse> {
    return this.request.get(`${this.getUrl()}/${id}`);
  }

  /** POST /booking */
  async createBooking(payload: BookingPayload | Record<string, unknown>): Promise<APIResponse> {
    return this.request.post(this.getUrl(), { data: payload });
  }

  /** PUT /booking/:id — full update, requires auth token */
  async updateBooking(id: number, payload: BookingPayload, token: string): Promise<APIResponse> {
    return this.request.put(`${this.getUrl()}/${id}`, {
      data: payload,
      headers: this.authHeader(token),
    });
  }

  /** PUT /booking/:id — without auth header (for negative tests) */
  async updateBookingNoAuth(id: number, payload: BookingPayload): Promise<APIResponse> {
    return this.request.put(`${this.getUrl()}/${id}`, { data: payload });
  }

  /** PATCH /booking/:id — partial update, requires auth token */
  async patchBooking(
    id: number,
    payload: Partial<BookingPayload>,
    token: string,
  ): Promise<APIResponse> {
    return this.request.patch(`${this.getUrl()}/${id}`, {
      data: payload,
      headers: this.authHeader(token),
    });
  }

  /** PATCH /booking/:id — without auth header (for negative tests) */
  async patchBookingNoAuth(id: number, payload: Partial<BookingPayload>): Promise<APIResponse> {
    return this.request.patch(`${this.getUrl()}/${id}`, { data: payload });
  }

  /** PATCH /booking/:id — with a custom (possibly invalid) token */
  async patchBookingWithToken(
    id: number,
    payload: Partial<BookingPayload>,
    token: string,
  ): Promise<APIResponse> {
    return this.request.patch(`${this.getUrl()}/${id}`, {
      data: payload,
      headers: { Cookie: `token=${token}` },
    });
  }

  /** DELETE /booking/:id — requires auth token */
  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`${this.getUrl()}/${id}`, {
      headers: this.authHeader(token),
    });
  }

  /** DELETE /booking/:id — without auth header (for negative tests) */
  async deleteBookingNoAuth(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.getUrl()}/${id}`);
  }

  // ─── Composed helpers ─────────────────────────────────────────────────────
  async createAndGetId(payload: BookingPayload): Promise<number> {
    const res = await this.createBooking(payload);
    const body: CreateBookingResponse = await res.json();
    return body.bookingid;
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private authHeader(token: string): Record<string, string> {
    return { Cookie: `token=${token}` };
  }
}
