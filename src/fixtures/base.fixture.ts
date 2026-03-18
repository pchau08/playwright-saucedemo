import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import { USERS } from '../test-data/users';

/**
 * PageObjects groups all POM instances for a given Page.
 * Injected via the `pages` fixture so tests never construct pages directly.
 */
export type PageObjects = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  checkoutCompletePage: CheckoutCompletePage;
};

type Fixtures = {
  pages: PageObjects;
  authenticatedPage: Page; // Page already logged in as standard_user
};

export const test = base.extend<Fixtures>({
  pages: async ({ page }, use) => {
    await use({
      loginPage: new LoginPage(page),
      inventoryPage: new InventoryPage(page),
      cartPage: new CartPage(page),
      checkoutPage: new CheckoutPage(page),
      checkoutCompletePage: new CheckoutCompletePage(page),
    });
  },

  /**
   * authenticatedPage — logs in before the test body runs.
   * Use this fixture for any test that doesn't care about the login step itself.
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await page.waitForURL('**/inventory.html');
    await use(page);
  },
});

export { expect } from '@playwright/test';
