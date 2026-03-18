import { test, expect } from '../../src/fixtures/base.fixture';
import { USERS } from '../../src/test-data/users';
import { PRODUCTS } from '../../src/test-data/products';

/**
 * Product catalog tests — product-sorting.spec.ts
 *
 * Validates sorting, product display, and catalog integrity.
 */

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.loginPage.navigate();
    await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
    await pages.inventoryPage.expectOnInventoryPage();
  });

  // ─── Inventory Display ─────────────────────────────────────────────────────

  test.describe('Inventory display', () => {
    test('should display 6 products on inventory page @smoke @regression', async ({ pages }) => {
      await pages.inventoryPage.expectItemCount(6);
    });

    test('should display all expected product names @regression', async ({ pages }) => {
      const names = await pages.inventoryPage.getProductNames();
      expect(names).toContain(PRODUCTS.backpack.name);
      expect(names).toContain(PRODUCTS.bikeLight.name);
      expect(names).toContain(PRODUCTS.boltTShirt.name);
      expect(names).toContain(PRODUCTS.fleeceJacket.name);
      expect(names).toContain(PRODUCTS.onesie.name);
      expect(names).toContain(PRODUCTS.redTShirt.name);
    });

    test('should display correct price for each product @regression', async ({ pages }) => {
      const backpackInfo = await pages.inventoryPage.getProductInfo(PRODUCTS.backpack.name);
      expect(backpackInfo.price).toBe(PRODUCTS.backpack.price);

      const jacketInfo = await pages.inventoryPage.getProductInfo(PRODUCTS.fleeceJacket.name);
      expect(jacketInfo.price).toBe(PRODUCTS.fleeceJacket.price);
    });

    test('should display add to cart buttons for all products @regression', async ({ pages }) => {
      const addButtons = pages.inventoryPage.page.locator('button[data-test^="add-to-cart"]');
      await expect(addButtons).toHaveCount(6);
    });

    test('should default sort to Name (A to Z) @regression', async ({ pages }) => {
      const selected = await pages.inventoryPage.getSelectedSortOption();
      expect(selected).toBe('az');
    });
  });

  // ─── Sorting ───────────────────────────────────────────────────────────────

  test.describe('Sorting', () => {
    test('should sort products Name A to Z @smoke @regression', async ({ pages }) => {
      await pages.inventoryPage.sortBy('az');
      await pages.inventoryPage.expectSortedAscByName();
    });

    test('should sort products Name Z to A @regression', async ({ pages }) => {
      await pages.inventoryPage.sortBy('za');
      await pages.inventoryPage.expectSortedDescByName();
    });

    test('should sort products Price low to high @regression', async ({ pages }) => {
      await pages.inventoryPage.sortBy('lohi');
      await pages.inventoryPage.expectSortedAscByPrice();
    });

    test('should sort products Price high to low @regression', async ({ pages }) => {
      await pages.inventoryPage.sortBy('hilo');
      await pages.inventoryPage.expectSortedDescByPrice();
    });

    test('should correctly identify cheapest product when sorted low to high @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.sortBy('lohi');
      const prices = await pages.inventoryPage.getProductPrices();
      expect(prices[0]).toBe(7.99); // Onesie is cheapest
    });

    test('should correctly identify most expensive product when sorted high to low @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.sortBy('hilo');
      const prices = await pages.inventoryPage.getProductPrices();
      expect(prices[0]).toBe(49.99); // Fleece jacket is most expensive
    });

    test('should persist sort selection after switching options @regression', async ({ pages }) => {
      await pages.inventoryPage.sortBy('hilo');
      await pages.inventoryPage.sortBy('lohi');
      const selected = await pages.inventoryPage.getSelectedSortOption();
      expect(selected).toBe('lohi');
    });

    test('should display all 6 products after each sort change @regression', async ({ pages }) => {
      for (const sort of ['az', 'za', 'lohi', 'hilo'] as const) {
        await pages.inventoryPage.sortBy(sort);
        await pages.inventoryPage.expectItemCount(6);
      }
    });
  });

  // ─── Product Detail ────────────────────────────────────────────────────────

  test.describe('Product detail navigation', () => {
    test('should navigate to product detail page @regression', async ({ pages }) => {
      await pages.inventoryPage.clickProductByName(PRODUCTS.backpack.name);
      await expect(pages.inventoryPage.page).toHaveURL(/inventory-item\.html/);
    });

    test('should display correct product information on detail page @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.clickProductByName(PRODUCTS.backpack.name);
      const page = pages.inventoryPage.page;
      await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(
        PRODUCTS.backpack.name
      );
      await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(
        `$${PRODUCTS.backpack.price}`
      );
    });

    test('should navigate back from product detail to inventory @regression', async ({ pages }) => {
      await pages.inventoryPage.clickProductByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.page.locator('[data-test="back-to-products"]').click();
      await pages.inventoryPage.expectOnInventoryPage();
    });
  });

  // ─── Cart Badge ────────────────────────────────────────────────────────────

  test.describe('Cart badge updates', () => {
    test('should show cart badge with count after adding item @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.expectCartBadgeCount(1);
    });

    test('should increment badge count for each item added @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.bikeLight.name);
      await pages.inventoryPage.expectCartBadgeCount(2);
    });

    test('should remove badge when last item removed @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.removeFromCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.expectCartBadgeCount(0);
    });

    test('should show correct badge count after adding all items @regression', async ({ pages }) => {
      await pages.inventoryPage.addAllItemsToCart();
      await pages.inventoryPage.expectCartBadgeCount(6);
    });
  });
});
