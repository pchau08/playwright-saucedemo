import { APIRequestContext, expect } from '@playwright/test';

/**
 * ApiHelper
 *
 * Wraps Playwright's APIRequestContext with convenience methods
 * for common assertions and response handling.
 *
 * SauceDemo is primarily a UI testing target — it doesn't expose
 * a documented REST API. This helper is structured to validate
 * the HTTP layer (status codes, headers, response times) and can
 * be extended if the application adds API endpoints.
 */
export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  /**
   * Verify the site root is reachable and returns expected status.
   */
  async expectSiteReachable(): Promise<void> {
    const response = await this.request.get('/');
    expect(response.status()).toBe(200);
  }

  /**
   * Verify a given path returns the expected HTTP status code.
   */
  async expectStatus(path: string, expectedStatus: number): Promise<void> {
    const response = await this.request.get(path);
    expect(response.status()).toBe(expectedStatus);
  }

  /**
   * Verify that authenticated pages redirect unauthenticated requests.
   * SauceDemo uses client-side routing, so protected pages return 200
   * with JS that redirects — this checks the initial HTTP response.
   */
  async expectPageAccessible(path: string): Promise<void> {
    const start = Date.now();
    const response = await this.request.get(path);
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    // Response time baseline — flag if pages start taking > 3s
    expect(duration).toBeLessThan(3000);
  }

  /**
   * Verify response content-type contains the expected media type.
   */
  async expectContentType(path: string, contentType: string): Promise<void> {
    const response = await this.request.get(path);
    const header = response.headers()['content-type'] ?? '';
    expect(header).toContain(contentType);
  }

  /**
   * Measure response time for a path and assert it's within threshold.
   */
  async expectResponseWithin(path: string, thresholdMs: number): Promise<number> {
    const start = Date.now();
    await this.request.get(path);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(thresholdMs);
    return duration;
  }

  /**
   * Assert that a static asset (image, CSS, JS) is served correctly.
   */
  async expectAssetServed(assetPath: string): Promise<void> {
    const response = await this.request.get(assetPath);
    expect([200, 304]).toContain(response.status());
  }
}
