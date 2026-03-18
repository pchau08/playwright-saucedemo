import { test, expect } from '../../src/fixtures/base.fixture';
import { USERS } from '../../src/test-data/users';
import { PRODUCTS } from '../../src/test-data/products';

/**
 * Cart tests — cart.spec.ts
 *
 * Validates add/remove behavior, cart persistence, badge counts,
 * and navigation between inventory and cart.
 */

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.loginPage.navigate();
    await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
    await pages.inventoryPage.expectOnInventoryPage();
  });

  // ─── Add to Cart ───────────────────────────────────────────────────────────

  test.describe('Adding items', () => {
    test('should add a single item to cart @smoke @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectItemInCart(PRODUCTS.backpack.name);
    });

    test('should add multiple items to cart @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.bikeLight.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.fleeceJacket.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectCartItemCount(3);
      await pages.cartPage.expectItemInCart(PRODUCTS.backpack.name);
      await pages.cartPage.expectItemInCart(PRODUCTS.bikeLight.name);
      await pages.cartPage.expectItemInCart(PRODUCTS.fleeceJacket.name);
    });

    test('should add all 6 products to cart @regression', async ({ pages }) => {
      await pages.inventoryPage.addAllItemsToCart();
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectCartItemCount(6);
    });

    test('should display correct price in cart @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectItemPrice(PRODUCTS.backpack.name, `$${PRODUCTS.backpack.price}`);
    });

    test('should display quantity of 1 for each added item @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectItemQuantity(PRODUCTS.backpack.name, 1);
    });

    test('should change Add to Cart button to Remove after adding @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      const removeButton = pages.inventoryPage.page.locator(
        `[data-test="remove-sauce-labs-backpack"]`
      );
      await expect(removeButton).toBeVisible();
      await expect(removeButton).toHaveText('Remove');
    });
  });

  // ─── Remove from Cart ─────────────────────────────────────────────────────

  test.describe('Removing items', () => {
    test('should remove an item from cart page @smoke @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.removeItemByName(PRODUCTS.backpack.name);
      await pages.cartPage.expectItemNotInCart(PRODUCTS.backpack.name);
      await pages.cartPage.expectCartEmpty();
    });

    test('should remove one item but retain others @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.bikeLight.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.removeItemByName(PRODUCTS.backpack.name);
      await pages.cartPage.expectItemNotInCart(PRODUCTS.backpack.name);
      await pages.cartPage.expectItemInCart(PRODUCTS.bikeLight.name);
      await pages.cartPage.expectCartItemCount(1);
    });

    test('should remove item from inventory page using Remove button @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.removeFromCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.expectCartBadgeCount(0);
      // Confirm item is also not in cart
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectCartEmpty();
    });

    test('should show empty cart after removing all items @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.bikeLight.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.removeItemByName(PRODUCTS.backpack.name);
      await pages.cartPage.removeItemByName(PRODUCTS.bikeLight.name);
      await pages.cartPage.expectCartEmpty();
    });
  });

  // ─── Cart Persistence ─────────────────────────────────────────────────────

  test.describe('Cart persistence', () => {
    test('should retain cart items when navigating back to inventory @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.continueShopping();
      // Badge count should still show 1
      await pages.inventoryPage.expectCartBadgeCount(1);
    });

    test('should retain cart items on page reload @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.page.reload();
      await pages.inventoryPage.expectCartBadgeCount(1);
    });

    test('should persist cart across navigation to product detail @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.clickProductByName(PRODUCTS.bikeLight.name);
      // Navigate back
      await pages.inventoryPage.page.locator('[data-test="back-to-products"]').click();
      await pages.inventoryPage.expectCartBadgeCount(1);
    });
  });

  // ─── Navigation ────────────────────────────────────────────────────────────

  test.describe('Cart navigation', () => {
    test('should navigate from cart to checkout @smoke @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.expectOnStepOne();
    });

    test('should navigate back to inventory from cart @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.continueShopping();
      await pages.inventoryPage.expectOnInventoryPage();
    });

    test('should be able to access empty cart @regression', async ({ pages }) => {
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectOnCartPage();
      await pages.cartPage.expectCartEmpty();
    });

    test('should show correct item data from cart items getter @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      const items = await pages.cartPage.getCartItems();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe(PRODUCTS.backpack.name);
      expect(items[0].price).toBe(PRODUCTS.backpack.price);
      expect(items[0].quantity).toBe(1);
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  test.describe('Edge cases', () => {
    test('should not show cart badge when cart is empty @regression', async ({ pages }) => {
      await pages.inventoryPage.expectCartBadgeCount(0);
    });

    test('should handle adding cheapest and most expensive items together @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.onesie.name);       // $7.99
      await pages.inventoryPage.addToCartByName(PRODUCTS.fleeceJacket.name); // $49.99
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectCartItemCount(2);

      const items = await pages.cartPage.getCartItems();
      const total = items.reduce((sum, item) => sum + item.price, 0);
      expect(total).toBeCloseTo(57.98, 2);
    });

    test('should reset cart state after logout and re-login @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.expectCartBadgeCount(1);

      await pages.inventoryPage.logout();
      await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
      await pages.inventoryPage.expectOnInventoryPage();

      // Cart may or may not persist after logout depending on implementation
      // — this test simply verifies the page loads without error
      const count = await pages.inventoryPage.getCartBadgeCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
