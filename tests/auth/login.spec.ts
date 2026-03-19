import { test, expect } from '../../src/fixtures/base.fixture';
import { USERS, INVALID_CREDENTIALS, ERROR_MESSAGES } from '../../src/test-data/users';

/**
 * Auth tests — login.spec.ts
 *
 * Covers the full range of authentication scenarios:
 * happy paths, invalid credentials, account states, and edge cases.
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.loginPage.navigate();
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  test.describe('Successful login', () => {
    test('should login with standard_user credentials @smoke @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
      await pages.inventoryPage.expectOnInventoryPage();
    });

    test('should login with problem_user credentials @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.problem.username, USERS.problem.password);
      await pages.inventoryPage.expectOnInventoryPage();
    });

    test('should login with performance_glitch_user credentials @regression', async ({ pages }) => {
      // This account intentionally introduces a ~5s delay — increase timeout for this test
      test.setTimeout(15_000);
      await pages.loginPage.login(
        USERS.performanceGlitch.username,
        USERS.performanceGlitch.password
      );
      await pages.inventoryPage.expectOnInventoryPage();
    });

    test('should redirect to inventory page after login @smoke @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
      await expect(pages.loginPage.page).toHaveURL(/inventory\.html/);
    });
  });

  // ─── Locked Out User ───────────────────────────────────────────────────────

  test.describe('Locked out user', () => {
    test('should show locked out error for locked_out_user @smoke @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
      await pages.loginPage.expectErrorMessage(ERROR_MESSAGES.lockedOut);
    });

    test('should remain on login page when locked out @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
      await pages.loginPage.expectOnLoginPage();
    });
  });

  // ─── Invalid Credentials ──────────────────────────────────────────────────

  test.describe('Invalid credentials', () => {
    test('should show error for wrong password @smoke @regression', async ({ pages }) => {
      const { username, password } = INVALID_CREDENTIALS.wrongPassword;
      await pages.loginPage.login(username, password);
      await pages.loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
    });

    test('should show error for nonexistent username @regression', async ({ pages }) => {
      const { username, password } = INVALID_CREDENTIALS.wrongUsername;
      await pages.loginPage.login(username, password);
      await pages.loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
    });

    test('should show username required error when submitting empty form @regression', async ({
      pages,
    }) => {
      await pages.loginPage.submitEmptyForm();
      await pages.loginPage.expectErrorMessage(ERROR_MESSAGES.emptyUsername);
    });

    test('should show password required error when only username is provided @regression', async ({
      pages,
    }) => {
      await pages.loginPage.fillUsername(USERS.standard.username);
      await pages.loginPage.clickLogin();
      await pages.loginPage.expectErrorMessage(ERROR_MESSAGES.emptyPassword);
    });

    test('should show username required error when only password is provided @regression', async ({
      pages,
    }) => {
      await pages.loginPage.fillPassword(USERS.standard.password);
      await pages.loginPage.clickLogin();
      await pages.loginPage.expectErrorMessage(ERROR_MESSAGES.emptyUsername);
    });
  });

  // ─── Error UI Behavior ────────────────────────────────────────────────────

  test.describe('Error message UI', () => {
    test('should display error with X close button @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
      await pages.loginPage.expectErrorVisible();
      await pages.loginPage.dismissError();
      await pages.loginPage.expectErrorNotVisible();
    });

    test('should highlight username and password fields on invalid login @regression', async ({
      pages,
    }) => {
      const { username, password } = INVALID_CREDENTIALS.wrongPassword;
      await pages.loginPage.login(username, password);
      await pages.loginPage.expectUsernameFieldHighlighted();
      await pages.loginPage.expectPasswordFieldHighlighted();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  test.describe('Edge cases', () => {
    test('should reject SQL injection in username field @regression', async ({ pages }) => {
      const { username, password } = INVALID_CREDENTIALS.sqlInjection;
      await pages.loginPage.login(username, password);
      await pages.loginPage.expectErrorVisible();
      await pages.inventoryPage.page.waitForURL(/\/$/, { timeout: 2000 }).catch(() => {
        // Expected — should not navigate away from login
      });
      await pages.loginPage.expectOnLoginPage();
    });

    test('should not navigate away on XSS attempt in username @regression', async ({ pages }) => {
      const { username, password } = INVALID_CREDENTIALS.xssAttempt;
      await pages.loginPage.login(username, password);
      await pages.loginPage.expectOnLoginPage();
    });

    test('should handle very long username and password gracefully @regression', async ({
      pages,
    }) => {
      const { username, password } = INVALID_CREDENTIALS.longString;
      await pages.loginPage.login(username, password);
      // Should show an error, not crash or hang
      await pages.loginPage.expectErrorVisible();
    });

    test('should reject whitespace-only credentials @regression', async ({ pages }) => {
      const { username, password } = INVALID_CREDENTIALS.whitespaceOnly;
      await pages.loginPage.login(username, password);
      await pages.loginPage.expectErrorVisible();
    });

    test('should allow re-login after failed attempt @regression', async ({ pages }) => {
      // First attempt fails
      await pages.loginPage.login(INVALID_CREDENTIALS.wrongPassword.username, INVALID_CREDENTIALS.wrongPassword.password);
      await pages.loginPage.expectErrorVisible();

      // Second attempt with correct creds should succeed
      await pages.loginPage.clearAndLogin(USERS.standard.username, USERS.standard.password);
      await pages.inventoryPage.expectOnInventoryPage();
    });
  });

  // ─── Session / Navigation ─────────────────────────────────────────────────

  test.describe('Session behavior', () => {
    test('should redirect to login if accessing inventory without auth @regression', async ({
      pages,
    }) => {
      // Navigate directly without logging in — SauceDemo redirects back to root
      await pages.loginPage.page.goto('/inventory.html');
      await expect(pages.loginPage.page).toHaveURL('/');
    });

    test('should stay logged in on page refresh @regression', async ({ pages }) => {
      await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
      await pages.inventoryPage.expectOnInventoryPage();
      await pages.inventoryPage.page.reload();
      await pages.inventoryPage.expectOnInventoryPage();
    });

    test('should log out successfully @regression', async ({ pages, authenticatedPage }) => {
      const inventoryPage = (await import('../../src/pages/inventory.page')).InventoryPage;
      const inv = new inventoryPage(authenticatedPage);
      await inv.logout();
      await expect(authenticatedPage).toHaveURL('/');
    });
  });
});
