/**
 * SauceDemo inventory — static reference data used in test assertions.
 * Prices and names reflect the current state of the demo site.
 */

export interface Product {
  name: string;
  description: string;
  price: number;
  imageAlt: string;
}

export const PRODUCTS: Record<string, Product> = {
  backpack: {
    name: 'Sauce Labs Backpack',
    description: 'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.',
    price: 29.99,
    imageAlt: 'Sauce Labs Backpack',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    description: "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
    price: 9.99,
    imageAlt: 'Sauce Labs Bike Light',
  },
  boltTShirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    description: 'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.',
    price: 15.99,
    imageAlt: 'Sauce Labs Bolt T-Shirt',
  },
  fleeceJacket: {
    name: 'Sauce Labs Fleece Jacket',
    description: "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
    price: 49.99,
    imageAlt: 'Sauce Labs Fleece Jacket',
  },
  onesie: {
    name: 'Sauce Labs Onesie',
    description: "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
    price: 7.99,
    imageAlt: 'Sauce Labs Onesie',
  },
  redTShirt: {
    name: 'Test.allTheThings() T-Shirt (Red)',
    description: 'This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.',
    price: 15.99,
    imageAlt: 'Test.allTheThings() T-Shirt (Red)',
  },
};

export const ALL_PRODUCT_NAMES = Object.values(PRODUCTS).map((p) => p.name);
export const ALL_PRODUCT_PRICES = Object.values(PRODUCTS).map((p) => p.price);

export const SORTED_BY_PRICE_ASC = [...Object.values(PRODUCTS)].sort(
  (a, b) => a.price - b.price
);

export const SORTED_BY_PRICE_DESC = [...Object.values(PRODUCTS)].sort(
  (a, b) => b.price - a.price
);

export const SORTED_BY_NAME_ASC = [...Object.values(PRODUCTS)].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const SORTED_BY_NAME_DESC = [...Object.values(PRODUCTS)].sort((a, b) =>
  b.name.localeCompare(a.name)
);

export const CHEAPEST_PRODUCT = SORTED_BY_PRICE_ASC[0];
export const MOST_EXPENSIVE_PRODUCT = SORTED_BY_PRICE_DESC[0];

export const CHECKOUT_INFO = {
  valid: {
    firstName: 'Jane',
    lastName: 'Tester',
    postalCode: '94107',
  },
  missingFirstName: {
    firstName: '',
    lastName: 'Tester',
    postalCode: '94107',
  },
  missingLastName: {
    firstName: 'Jane',
    lastName: '',
    postalCode: '94107',
  },
  missingPostalCode: {
    firstName: 'Jane',
    lastName: 'Tester',
    postalCode: '',
  },
};
