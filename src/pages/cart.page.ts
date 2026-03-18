import { Page, Locator, expect } from '@playwright/test';

export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

/**
 * CartPage covers the shopping cart screen (/cart.html).
 */
export class CartPage {
  readonly page: Page;

  private readonly pageTitle: Locator;
  private readonly cartItems: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="cart-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/cart.html');
    await expect(this.pageTitle).toBeVisible();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.page.waitForURL('**/inventory.html');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForURL('**/checkout-step-one.html');
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async removeItemByName(productName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('button[data-test^="remove"]').click();
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const count = await this.cartItems.count();

    for (let i = 0; i < count; i++) {
      const item = this.cartItems.nth(i);
      const name = (await item.locator('[data-test="inventory-item-name"]').textContent()) ?? '';
      const description = (await item.locator('[data-test="inventory-item-desc"]').textContent()) ?? '';
      const priceText = (await item.locator('[data-test="inventory-item-price"]').textContent()) ?? '0';
      const quantityText = (await item.locator('[data-test="item-quantity"]').textContent()) ?? '1';

      items.push({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(priceText.replace('$', '')),
        quantity: parseInt(quantityText, 10),
      });
    }

    return items;
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  async expectItemInCart(productName: string): Promise<void> {
    await expect(
      this.cartItems.filter({ hasText: productName })
    ).toBeVisible();
  }

  async expectItemNotInCart(productName: string): Promise<void> {
    await expect(
      this.cartItems.filter({ hasText: productName })
    ).not.toBeVisible();
  }

  async expectCartEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  async expectCartItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectItemPrice(productName: string, expectedPrice: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await expect(item.locator('[data-test="inventory-item-price"]')).toHaveText(expectedPrice);
  }

  async expectItemQuantity(productName: string, quantity: number): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await expect(item.locator('[data-test="item-quantity"]')).toHaveText(String(quantity));
  }
}
