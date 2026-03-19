import { Page, Locator, expect } from '@playwright/test';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * CheckoutPage covers both checkout step one (/checkout-step-one.html)
 * and checkout step two (/checkout-step-two.html).
 *
 * Step one = customer info form
 * Step two = order summary / confirmation before final submit
 */
export class CheckoutPage {
  readonly page: Page;

  // Step one
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly errorContainer: Locator;

  // Step two
  private readonly finishButton: Locator;
  private readonly cancelButtonStepTwo: Locator;
  private readonly summaryItems: Locator;
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step one locators
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorContainer = page.locator('[data-test="error"]');

    // Step two locators
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButtonStepTwo = page.locator('[data-test="cancel"]');
    this.summaryItems = page.locator('[data-test="inventory-item"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigateToStepOne(): Promise<void> {
    await this.page.goto('/checkout-step-one.html');
  }

  async navigateToStepTwo(): Promise<void> {
    await this.page.goto('/checkout-step-two.html');
  }

  // ─── Step One Actions ──────────────────────────────────────────────────────

  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async fillAndContinue(info: CheckoutInfo): Promise<void> {
    await this.fillCheckoutInfo(info);
    await this.clickContinue();
    await this.page.waitForURL('**/checkout-step-two.html');
  }

  async cancelFromStepOne(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForURL('**/cart.html');
  }

  async submitEmptyForm(): Promise<void> {
    await this.continueButton.click();
  }

  // ─── Step Two Actions ─────────────────────────────────────────────────────

  async clickFinish(): Promise<void> {
    await this.finishButton.click();
    await this.page.waitForURL('**/checkout-complete.html');
  }

  async cancelFromStepTwo(): Promise<void> {
    await this.cancelButtonStepTwo.click();
    await this.page.waitForURL('**/inventory.html');
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getSubtotal(): Promise<number> {
    const text = (await this.subtotalLabel.textContent()) ?? '';
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getTax(): Promise<number> {
    const text = (await this.taxLabel.textContent()) ?? '';
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getTotal(): Promise<number> {
    const text = (await this.totalLabel.textContent()) ?? '';
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getSummaryItemNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorContainer.textContent()) ?? '';
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectOnStepOne(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.firstNameInput).toBeVisible();
  }

  async expectOnStepTwo(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.finishButton).toBeVisible();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorContainer).toBeVisible();
    await expect(this.errorContainer).toContainText(message);
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorContainer).toBeVisible();
  }

  async expectSubtotalMatchesItems(): Promise<void> {
    // Verify subtotal = sum of item prices in the summary
    const itemPrices = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    const expectedSubtotal = itemPrices
      .map((p) => parseFloat(p.replace('$', '')))
      .reduce((sum, price) => sum + price, 0);

    const displayedSubtotal = await this.getSubtotal();
    expect(displayedSubtotal).toBeCloseTo(expectedSubtotal, 2);
  }

  async expectTotalEqualsTaxPlusSubtotal(): Promise<void> {
    const subtotal = await this.getSubtotal();
    const tax = await this.getTax();
    const total = await this.getTotal();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  }
}
