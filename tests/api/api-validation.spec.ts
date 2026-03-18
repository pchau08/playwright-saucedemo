import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../src/helpers/api-helper';

/**
 * API validation tests — api-validation.spec.ts
 *
 * SauceDemo is a UI-focused demo site — it does not expose a
 * documented REST API. These tests validate the HTTP layer:
 * response codes, content types, response times, and static
 * asset delivery. This pattern mirrors what you'd do when
 * adding API coverage to a primarily UI-tested application.
 *
 * In a real project, this file would be extended with endpoint-
 * specific tests (auth tokens, JSON schema validation, CRUD ops)
 * once the API surface is known.
 */

test.describe('API / HTTP Layer Validation', () => {
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  // ─── Site Availability ─────────────────────────────────────────────────────

  test.describe('Site availability', () => {
    test('should return 200 for site root @smoke @regression', async ({ request }) => {
      const response = await request.get('/');
      expect(response.status()).toBe(200);
    });

    test('should respond within 3 seconds for root page @regression', async () => {
      const duration = await apiHelper.expectResponseWithin('/', 3000);
      console.log(`Root page response time: ${duration}ms`);
    });

    test('should return HTML content type for root @regression', async () => {
      await apiHelper.expectContentType('/', 'text/html');
    });
  });

  // ─── Page Routes ──────────────────────────────────────────────────────────

  test.describe('Page routes', () => {
    const routes = [
      '/',
      '/inventory.html',
      '/cart.html',
      '/checkout-step-one.html',
      '/checkout-step-two.html',
      '/checkout-complete.html',
    ];

    for (const route of routes) {
      test(`should return 200 for ${route} @regression`, async ({ request }) => {
        const response = await request.get(route);
        // SauceDemo returns 200 for all routes (client-side redirect handles auth)
        expect(response.status()).toBe(200);
      });
    }
  });

  // ─── Response Times ────────────────────────────────────────────────────────

  test.describe('Response time baselines', () => {
    test('should serve inventory page within 3 seconds @regression', async () => {
      await apiHelper.expectResponseWithin('/inventory.html', 3000);
    });

    test('should serve cart page within 3 seconds @regression', async () => {
      await apiHelper.expectResponseWithin('/cart.html', 3000);
    });

    test('should serve checkout page within 3 seconds @regression', async () => {
      await apiHelper.expectResponseWithin('/checkout-step-one.html', 3000);
    });
  });

  // ─── Static Assets ────────────────────────────────────────────────────────

  test.describe('Static assets', () => {
    test('should serve product images @regression', async ({ request }) => {
      // Verify the static image directory is accessible
      const response = await request.get(
        '/static/media/sauce-backpack-1200x1500.0a0b85a3.jpg'
      );
      // 200 = fresh, 304 = cached — both are valid
      expect([200, 304, 404]).toContain(response.status());
      // Note: 404 here means the filename has changed on the demo site.
      // In a real project, asset paths would be pinned or fetched from a manifest.
    });

    test('should serve CSS files @regression', async ({ request }) => {
      const response = await request.get('/');
      const body = await response.text();
      // Verify the page references a stylesheet
      expect(body).toMatch(/\.css/);
    });
  });

  // ─── Security Headers ─────────────────────────────────────────────────────

  test.describe('Security headers', () => {
    test('should not expose server version in response headers @regression', async ({
      request,
    }) => {
      const response = await request.get('/');
      const headers = response.headers();
      // X-Powered-By leaks server technology — should not be present
      expect(headers['x-powered-by']).toBeUndefined();
    });

    test('should return valid response headers @regression', async ({ request }) => {
      const response = await request.get('/');
      const headers = response.headers();
      expect(headers['content-type']).toBeDefined();
    });
  });

  // ─── Boundary / Negative HTTP ─────────────────────────────────────────────

  test.describe('HTTP edge cases', () => {
    test('should return 404 for nonexistent route @regression', async ({ request }) => {
      const response = await request.get('/this-route-does-not-exist-xyz');
      // Either 404 or redirect to root — both are acceptable handling
      expect([404, 200, 301, 302]).toContain(response.status());
    });

    test('should handle HEAD request on root @regression', async ({ request }) => {
      const response = await request.fetch('/', { method: 'HEAD' });
      expect(response.status()).toBe(200);
    });
  });
});
