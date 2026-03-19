import { Page, Locator, expect } from '@playwright/test';

/**
 * CheckoutCompletePage covers the order confirmation screen (/checkout-complete.html).
 */
export class CheckoutCompletePage {
  readonly page: Page;

  private readonly pageTitle: Locator;
  private readonly completeHeader: Locator;
  private readonly completeText: Locator;
  private readonly ponyExpressImage: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.ponyExpressImage = page.locator('[data-test="pony-express"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/checkout-complete.html');
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
    await this.page.waitForURL('**/inventory.html');
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getConfirmationHeader(): Promise<string> {
    return (await this.completeHeader.textContent()) ?? '';
  }

  async getConfirmationText(): Promise<string> {
    return (await this.completeText.textContent()) ?? '';
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toContainText('Your order has been dispatched');
    await expect(this.ponyExpressImage).toBeVisible();
    await expect(this.backHomeButton).toBeVisible();
  }

  async expectOnCompletePage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Complete!');
  }
}
