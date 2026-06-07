import { APIRequestContext, expect } from '@playwright/test';
import { AppRoutes } from '../constant/endpoints.constant';
import { testConfig } from '../configs/config';

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  reason?: string;
}

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async postAuth(credentials: Credentials) {
    return this.request.post(`${testConfig.baseUrl}${AppRoutes.authApi}`, { data: credentials });
  }

  async getToken(credentials: Credentials): Promise<string> {
    const res = await this.postAuth(credentials);

    expect(res.status(), 'Auth request should return 200').toBe(200);

    const body: AuthResponse = await res.json();

    expect(body, 'Response should contain token field').toHaveProperty('token');
    expect(body.token, 'Token should not be "Bad credentials"').not.toBe('Bad credentials');
    expect(body.token!.length, 'Token should be non-empty').toBeGreaterThan(0);

    return body.token!;
  }

  async getAuthBody(credentials: Credentials): Promise<AuthResponse> {
    const res = await this.postAuth(credentials);
    return res.json();
  }
}
