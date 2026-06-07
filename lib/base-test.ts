import { test as base } from "@playwright/test";
import { AuthApi } from "../api/auth.api";
import { BookingApi } from "../api/booking.api";
import { SoapCalculatorApi } from "../api/soap-calculator.api";

type Apis = {
  bookingApi: BookingApi;
  authApi: AuthApi;
  soapApi: SoapCalculatorApi;
};

export const test = base.extend<Apis>({

  bookingApi: async ({ request }, use) => {
    await use(new BookingApi(request));
  },

  authApi: async ({ request }, use) => {
    await use(new AuthApi(request));
  },

  soapApi: async ({ request }, use) => {
    await use(new SoapCalculatorApi(request));
  },
});

export { expect } from "@playwright/test";