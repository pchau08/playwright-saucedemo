import { Page, Locator, expect } from '@playwright/test';

export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export class CartPage {
  readonly page: Page;

  private readonly pageTitle: Locator;
  private readonly cartItems: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/cart.html');
    await this.page.waitForLoadState('domcontentloaded');
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

  async removeItemByName(productName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('button').click();
  }

  async getCartItems(): Promise<CartItem[]> {
    await this.page.waitForLoadState('domcontentloaded');
    const items: CartItem[] = [];
    const count = await this.cartItems.count();

    for (let i = 0; i < count; i++) {
      const item = this.cartItems.nth(i);
      const name = (await item.locator('.inventory_item_name').textContent()) ?? '';
      const description = (await item.locator('.inventory_item_desc').textContent()) ?? '';
      const priceText = (await item.locator('.inventory_item_price').textContent()) ?? '0';
      const quantityText = (await item.locator('.cart_quantity').textContent()) ?? '1';

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
    await this.page.waitForLoadState('domcontentloaded');
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    await this.page.waitForLoadState('domcontentloaded');
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async expectOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.pageTitle).toBeVisible();
  }

  async expectItemInCart(productName: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
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
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.cartItems).toHaveCount(0);
  }

  async expectCartItemCount(count: number): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectItemPrice(productName: string, expectedPrice: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await expect(item.locator('.inventory_item_price')).toHaveText(expectedPrice);
  }

  async expectItemQuantity(productName: string, quantity: number): Promise<void> {
    const item = this.cartItems.filter({ hasText: productName });
    await expect(item.locator('.cart_quantity')).toHaveText(String(quantity));
  }
}
