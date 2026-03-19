import { Page, Locator, expect } from '@playwright/test';

export type SortOption =
  | 'az'   // Name (A to Z)
  | 'za'   // Name (Z to A)
  | 'lohi' // Price (low to high)
  | 'hilo'; // Price (high to low)

export interface ProductInfo {
  name: string;
  description: string;
  price: number;
}

/**
 * InventoryPage covers the main product listing screen (/inventory.html).
 * Provides sorting, filtering, add-to-cart, and navigation helpers.
 */
export class InventoryPage {
  readonly page: Page;

  private readonly pageTitle: Locator;
  private readonly inventoryList: Locator;
  private readonly inventoryItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly resetSidebarLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetSidebarLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/inventory.html');
    await expect(this.inventoryList).toBeVisible();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL('**/cart.html');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.page.waitForSelector('[data-test="logout-sidebar-link"]', { state: 'visible' });
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
    await this.page.waitForURL('/');
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetSidebarLink.click();
  }

  // ─── Product Interactions ──────────────────────────────────────────────────

  async addToCartByName(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName });
    const addButton = item.locator('button[data-test^="add-to-cart"]');
    await addButton.click();
  }

  async removeFromCartByName(productName: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: productName });
    const removeButton = item.locator('button[data-test^="remove"]');
    await removeButton.click();
  }

  async clickProductByName(productName: string): Promise<void> {
    await this.inventoryItems
      .filter({ hasText: productName })
      .locator('[data-test="inventory-item-name"]')
      .click();
  }

  async addAllItemsToCart(): Promise<void> {
    const addButtons = this.page.locator('button[data-test^="add-to-cart"]');
    const count = await addButtons.count();
    for (let i = 0; i < count; i++) {
      await addButtons.nth(i).click();
    }
  }

  // ─── Sorting ───────────────────────────────────────────────────────────────

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }

  async getProductInfo(productName: string): Promise<ProductInfo> {
    const item = this.inventoryItems.filter({ hasText: productName });
    const name = await item.locator('[data-test="inventory-item-name"]').textContent() ?? '';
    const description = await item.locator('[data-test="inventory-item-desc"]').textContent() ?? '';
    const priceText = await item.locator('[data-test="inventory-item-price"]').textContent() ?? '0';
    return {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(priceText.replace('$', '')),
    };
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectOnInventoryPage(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.pageTitle).toHaveText('Products');
  }

  async expectCartBadgeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async expectCartBadgeVisible(): Promise<void> {
    await expect(this.cartBadge).toBeVisible();
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.inventoryItems).toHaveCount(count);
  }

  async expectProductVisible(productName: string): Promise<void> {
    await expect(
      this.inventoryItems.filter({ hasText: productName })
    ).toBeVisible();
  }

  async expectSortedAscByName(): Promise<void> {
    const names = await this.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  }

  async expectSortedDescByName(): Promise<void> {
    const names = await this.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  }

  async expectSortedAscByPrice(): Promise<void> {
    const prices = await this.getProductPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  }

  async expectSortedDescByPrice(): Promise<void> {
    const prices = await this.getProductPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getCartBadgeCount(): Promise<number> {
    const visible = await this.cartBadge.isVisible();
    if (!visible) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text ?? '0', 10);
  }

  async getSelectedSortOption(): Promise<string> {
    return this.sortDropdown.inputValue();
  }
}
