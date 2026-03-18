import { test, expect } from '../../src/fixtures/base.fixture';
import { USERS } from '../../src/test-data/users';
import { PRODUCTS, CHECKOUT_INFO } from '../../src/test-data/products';

/**
 * Checkout flow tests — checkout-flow.spec.ts
 *
 * Covers the full purchase journey from product selection through
 * order confirmation, plus negative cases and form validation.
 */

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.loginPage.navigate();
    await pages.loginPage.login(USERS.standard.username, USERS.standard.password);
    await pages.inventoryPage.expectOnInventoryPage();
  });

  // ─── Full Happy Path ───────────────────────────────────────────────────────

  test.describe('Complete purchase flow', () => {
    test('should complete checkout with a single item @smoke @regression', async ({ pages }) => {
      // Step 1: Add item
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();

      // Step 2: Verify cart
      await pages.cartPage.expectItemInCart(PRODUCTS.backpack.name);
      await pages.cartPage.proceedToCheckout();

      // Step 3: Fill checkout info
      await pages.checkoutPage.expectOnStepOne();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);

      // Step 4: Verify order summary
      await pages.checkoutPage.expectOnStepTwo();
      await pages.checkoutPage.expectSubtotalMatchesItems();
      await pages.checkoutPage.expectTotalEqualsTaxPlusSubtotal();

      // Step 5: Complete order
      await pages.checkoutPage.clickFinish();
      await pages.checkoutCompletePage.expectOrderConfirmed();
    });

    test('should complete checkout with multiple items @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.bikeLight.name);
      await pages.inventoryPage.addToCartByName(PRODUCTS.boltTShirt.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectCartItemCount(3);
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.expectOnStepTwo();

      const summaryItems = await pages.checkoutPage.getSummaryItemNames();
      expect(summaryItems).toHaveLength(3);
      expect(summaryItems).toContain(PRODUCTS.backpack.name);

      await pages.checkoutPage.clickFinish();
      await pages.checkoutCompletePage.expectOrderConfirmed();
    });

    test('should complete checkout with all 6 items @regression', async ({ pages }) => {
      await pages.inventoryPage.addAllItemsToCart();
      await pages.inventoryPage.goToCart();
      await pages.cartPage.expectCartItemCount(6);
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.expectTotalEqualsTaxPlusSubtotal();
      await pages.checkoutPage.clickFinish();
      await pages.checkoutCompletePage.expectOrderConfirmed();
    });
  });

  // ─── Order Summary Validation ─────────────────────────────────────────────

  test.describe('Order summary', () => {
    test.beforeEach(async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.fleeceJacket.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
    });

    test('should display correct item subtotal @regression', async ({ pages }) => {
      const subtotal = await pages.checkoutPage.getSubtotal();
      expect(subtotal).toBeCloseTo(PRODUCTS.fleeceJacket.price, 2);
    });

    test('should calculate tax correctly @regression', async ({ pages }) => {
      const subtotal = await pages.checkoutPage.getSubtotal();
      const tax = await pages.checkoutPage.getTax();
      // SauceDemo uses an 8% tax rate
      expect(tax).toBeCloseTo(subtotal * 0.08, 2);
    });

    test('should calculate total as subtotal plus tax @regression', async ({ pages }) => {
      await pages.checkoutPage.expectTotalEqualsTaxPlusSubtotal();
    });

    test('should display correct items in order summary @regression', async ({ pages }) => {
      const items = await pages.checkoutPage.getSummaryItemNames();
      expect(items).toContain(PRODUCTS.fleeceJacket.name);
    });

    test('should match subtotal to item prices @regression', async ({ pages }) => {
      await pages.checkoutPage.expectSubtotalMatchesItems();
    });
  });

  // ─── Checkout Form Validation ─────────────────────────────────────────────

  test.describe('Checkout form validation', () => {
    test.beforeEach(async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
    });

    test('should show error when first name is missing @regression', async ({ pages }) => {
      await pages.checkoutPage.fillCheckoutInfo(CHECKOUT_INFO.missingFirstName);
      await pages.checkoutPage.clickContinue();
      await pages.checkoutPage.expectErrorMessage('First Name is required');
    });

    test('should show error when last name is missing @regression', async ({ pages }) => {
      await pages.checkoutPage.fillCheckoutInfo(CHECKOUT_INFO.missingLastName);
      await pages.checkoutPage.clickContinue();
      await pages.checkoutPage.expectErrorMessage('Last Name is required');
    });

    test('should show error when postal code is missing @regression', async ({ pages }) => {
      await pages.checkoutPage.fillCheckoutInfo(CHECKOUT_INFO.missingPostalCode);
      await pages.checkoutPage.clickContinue();
      await pages.checkoutPage.expectErrorMessage('Postal Code is required');
    });

    test('should show error when all fields are empty @regression', async ({ pages }) => {
      await pages.checkoutPage.submitEmptyForm();
      await pages.checkoutPage.expectErrorVisible();
    });

    test('should not proceed to step 2 when form is invalid @regression', async ({ pages }) => {
      await pages.checkoutPage.submitEmptyForm();
      await pages.checkoutPage.expectOnStepOne();
    });
  });

  // ─── Cancel Behavior ──────────────────────────────────────────────────────

  test.describe('Cancel and back navigation', () => {
    test('should cancel from checkout step one back to cart @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.cancelFromStepOne();
      await pages.cartPage.expectOnCartPage();
    });

    test('should retain cart items after cancelling from step one @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.cancelFromStepOne();
      await pages.cartPage.expectItemInCart(PRODUCTS.backpack.name);
    });

    test('should cancel from step two back to inventory @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.cancelFromStepTwo();
      await pages.inventoryPage.expectOnInventoryPage();
    });
  });

  // ─── Post-Order ────────────────────────────────────────────────────────────

  test.describe('Post-order behavior', () => {
    test('should show thank you confirmation page after order @smoke @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.clickFinish();
      await pages.checkoutCompletePage.expectOnCompletePage();
    });

    test('should navigate back to products from confirmation page @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.clickFinish();
      await pages.checkoutCompletePage.backToProducts();
      await pages.inventoryPage.expectOnInventoryPage();
    });

    test('should display pony express image on confirmation page @regression', async ({
      pages,
    }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.clickFinish();
      const header = await pages.checkoutCompletePage.getConfirmationHeader();
      expect(header).toBe('Thank you for your order!');
    });

    test('should clear cart after order completion @regression', async ({ pages }) => {
      await pages.inventoryPage.addToCartByName(PRODUCTS.backpack.name);
      await pages.inventoryPage.goToCart();
      await pages.cartPage.proceedToCheckout();
      await pages.checkoutPage.fillAndContinue(CHECKOUT_INFO.valid);
      await pages.checkoutPage.clickFinish();
      await pages.checkoutCompletePage.backToProducts();
      await pages.inventoryPage.expectCartBadgeCount(0);
    });
  });
});
