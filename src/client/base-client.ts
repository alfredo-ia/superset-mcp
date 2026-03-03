import axios, { AxiosInstance } from "axios";
import { SupersetConfig, CsrfTokenResponse } from "../types/index.js";
import { getErrorMessage } from "../utils/error.js";

/**
 * Base Superset API client that handles session cookie authentication and CSRF tokens.
 */
export class BaseSuperset {
  protected api: AxiosInstance;
  protected config: SupersetConfig;
  protected isAuthenticated = false;
  protected csrfToken?: string;

  constructor(config: SupersetConfig) {
    this.config = config;
    if (config.sessionCookie?.trim()) {
      this.config.sessionCookie = this.normalizeSessionCookie(config.sessionCookie);
    }
    if (config.csrfToken?.trim()) {
      this.config.csrfToken = this.normalizeCsrfToken(config.csrfToken);
      this.csrfToken = this.config.csrfToken;
    }

    this.api = axios.create({
      baseURL: config.baseUrl,
      timeout: 120000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      transformResponse: [(data, headers) => {
        const contentType = headers["content-type"] || "";

        if (contentType.includes("application/json")) {
          try {
            return JSON.parse(data);
          } catch {
            return data;
          }
        }

        return data;
      }],
    });

    this.setupInterceptors();
  }

  private normalizeSessionCookie(rawCookie: string): string {
    const cookie = rawCookie.trim();
    if (!cookie) {
      throw new Error("Session cookie is empty");
    }
    if (cookie.includes("=") || cookie.includes(";")) {
      return cookie;
    }
    return `session=${cookie}`;
  }

  private normalizeCsrfToken(rawToken: string): string {
    const token = rawToken.trim();
    if (!token) {
      throw new Error("CSRF token is empty");
    }
    return token;
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use((config) => {
      if (this.config.sessionCookie) {
        config.headers.Cookie = this.config.sessionCookie;
      }
      if (this.csrfToken) {
        config.headers["X-CSRFToken"] = this.csrfToken;
      }
      config.headers.Referer = this.config.baseUrl;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.clearAuthState();
        }

        return Promise.reject(error);
      },
    );
  }

  private clearAuthState(): void {
    this.isAuthenticated = false;
    this.csrfToken = undefined;
  }

  /**
   * Session-only authentication. Requires SUPERSET_SESSION_COOKIE.
   */
  async authenticate(): Promise<void> {
    if (this.isAuthenticated) {
      return;
    }

    if (!this.config.sessionCookie) {
      throw new Error("SUPERSET_SESSION_COOKIE required");
    }

    this.config.sessionCookie = this.normalizeSessionCookie(this.config.sessionCookie);
    this.isAuthenticated = true;

    if (this.config.csrfToken) {
      this.csrfToken = this.normalizeCsrfToken(this.config.csrfToken);
    }
  }

  private async getCsrfToken(): Promise<CsrfTokenResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.api.get("/api/v1/security/csrf_token/");
      const token = response.data.result;
      const sessionCookie =
        response.headers["set-cookie"]?.find((cookie: string) => cookie.startsWith("session="))?.split(";")[0] ||
        this.config.sessionCookie ||
        "";

      this.csrfToken = token;
      return { token, sessionCookie };
    } catch (error) {
      throw new Error(`Failed to get CSRF token: ${getErrorMessage(error)}`);
    }
  }

  protected async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }
  }

  private async ensureCsrfToken(): Promise<CsrfTokenResponse> {
    if (this.csrfToken && this.config.sessionCookie) {
      return { token: this.csrfToken, sessionCookie: this.config.sessionCookie };
    }

    return await this.getCsrfToken();
  }

  protected async makeProtectedRequest(config: any): Promise<any> {
    await this.ensureAuthenticated();
    const { token, sessionCookie } = await this.ensureCsrfToken();

    const protectedApi = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 120000,
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
        Referer: this.config.baseUrl,
        ...config.headers,
      },
      withCredentials: true,
    });

    if (sessionCookie) {
      protectedApi.defaults.headers.common.Cookie = sessionCookie;
    } else if (this.config.sessionCookie) {
      protectedApi.defaults.headers.common.Cookie = this.config.sessionCookie;
    }

    protectedApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.clearAuthState();
        }

        return Promise.reject(error);
      },
    );

    return protectedApi.request(config);
  }
}
