/**
 * Bundle Logic Utilities
 * Contains the core business logic for bundle inventory management
 */

export interface BundleProduct {
  id: number;
  linkedProductIds: number[];
  productQuantities: Record<number, number>;
}

export interface Product {
  id: number;
  inventory_level: number;
  name?: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
}

/**
 * Calculate the maximum possible bundle quantity based on constituent product stock
 */
export function calculateBundleStock(
  bundle: BundleProduct,
  products: Product[]
): number {
  let minPossibleBundles = Infinity;

  for (const linkedId of bundle.linkedProductIds) {
    const product = products.find(p => p.id === linkedId);
    if (!product) {
      return 0; // If any constituent product is missing, bundle can't be made
    }

    const quantityNeeded = bundle.productQuantities[linkedId] || 1;
    const possibleBundles = Math.floor(product.inventory_level / quantityNeeded);
    minPossibleBundles = Math.min(minPossibleBundles, possibleBundles);
  }

  return minPossibleBundles === Infinity ? 0 : minPossibleBundles;
}

/**
 * Calculate stock updates when a bundle is sold
 */
export function calculateBundleSaleUpdates(
  bundle: BundleProduct,
  quantitySold: number,
  products: Product[]
): Product[] {
  const updates: Product[] = [];

  for (const linkedId of bundle.linkedProductIds) {
    const product = products.find(p => p.id === linkedId);
    if (!product) continue;

    const quantityNeeded = bundle.productQuantities[linkedId] || 1;
    const totalQuantityToReduce = quantitySold * quantityNeeded;
    const newStock = Math.max(0, product.inventory_level - totalQuantityToReduce);

    updates.push({
      ...product,
      inventory_level: newStock
    });
  }

  return updates;
}

/**
 * Calculate which bundles are affected when an individual product is sold
 */
export function findAffectedBundles(
  productId: number,
  bundles: BundleProduct[]
): BundleProduct[] {
  return bundles.filter(bundle =>
    bundle.linkedProductIds.includes(productId)
  );
}

/**
 * Calculate bundle stock updates when constituent products are sold individually
 */
export function calculateBundleUpdatesAfterIndividualSale(
  soldProductId: number,
  quantitySold: number,
  bundles: BundleProduct[],
  products: Product[]
): { bundleId: number; newStock: number }[] {
  const affectedBundles = findAffectedBundles(soldProductId, bundles);
  const updates: { bundleId: number; newStock: number }[] = [];

  // First, update the sold product's stock
  const updatedProducts = products.map(product => {
    if (product.id === soldProductId) {
      return {
        ...product,
        inventory_level: Math.max(0, product.inventory_level - quantitySold)
      };
    }

    return product;
  });

  // Then calculate new bundle stocks
  for (const bundle of affectedBundles) {
    const newStock = calculateBundleStock(bundle, updatedProducts);
    updates.push({
      bundleId: bundle.id,
      newStock
    });
  }

  return updates;
}

/**
 * Validate bundle configuration
 */
export function validateBundle(bundle: BundleProduct): string[] {
  const errors: string[] = [];

  if (!bundle.linkedProductIds || bundle.linkedProductIds.length === 0) {
    errors.push('Bundle must contain at least one product');
  }

  if (bundle.linkedProductIds.includes(bundle.id)) {
    errors.push('Bundle cannot contain itself');
  }

  for (const productId of bundle.linkedProductIds) {
    const quantity = bundle.productQuantities[productId];
    if (!quantity || quantity < 1) {
      errors.push(`Invalid quantity for product ${productId}: must be at least 1`);
    }
  }

  return errors;
}

/**
 * Calculate initial bundle stock when creating a new bundle
 */
export function calculateInitialBundleStock(
  linkedProductIds: number[],
  productQuantities: Record<number, number>,
  products: Product[]
): number {
  const bundle: BundleProduct = {
    id: 0, // Temporary ID for calculation
    linkedProductIds,
    productQuantities
  };

  return calculateBundleStock(bundle, products);
}
