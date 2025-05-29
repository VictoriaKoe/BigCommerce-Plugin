import {
  BundleProduct,
  calculateBundleSaleUpdates,
  calculateBundleStock,
  calculateBundleUpdatesAfterIndividualSale,
  calculateInitialBundleStock,
  findAffectedBundles,
  Product,
  validateBundle
} from '@lib/bundle-logic';

describe('Bundle Logic', () => {
  // Test data
  const mockProducts: Product[] = [
    { id: 1, inventory_level: 10, name: 'Product A' },
    { id: 2, inventory_level: 20, name: 'Product B' },
    { id: 3, inventory_level: 15, name: 'Product C' },
    { id: 4, inventory_level: 5, name: 'Product D' },
  ];

  const mockBundle: BundleProduct = {
    id: 100,
    linkedProductIds: [1, 2, 3],
    productQuantities: { 1: 2, 2: 1, 3: 3 } // Bundle needs 2xA, 1xB, 3xC
  };

  const mockBundles: BundleProduct[] = [
    mockBundle,
    {
      id: 101,
      linkedProductIds: [1, 4],
      productQuantities: { 1: 1, 4: 2 } // Bundle needs 1xA, 2xD
    }
  ];

  describe('calculateBundleStock', () => {
    it('should calculate correct bundle stock based on limiting product', () => {
      // Product A: 10/2 = 5 bundles possible
      // Product B: 20/1 = 20 bundles possible  
      // Product C: 15/3 = 5 bundles possible
      // Limiting factor is A and C = 5 bundles
      const result = calculateBundleStock(mockBundle, mockProducts);
      expect(result).toBe(5);
    });

    it('should return 0 when any constituent product is missing', () => {
      const bundleWithMissingProduct: BundleProduct = {
        id: 102,
        linkedProductIds: [1, 2, 999], // Product 999 doesn't exist
        productQuantities: { 1: 1, 2: 1, 999: 1 }
      };

      const result = calculateBundleStock(bundleWithMissingProduct, mockProducts);
      expect(result).toBe(0);
    });

    it('should return 0 when any constituent product has 0 stock', () => {
      const productsWithZeroStock = [
        ...mockProducts,
        { id: 5, inventory_level: 0, name: 'Product E' }
      ];

      const bundleWithZeroStockProduct: BundleProduct = {
        id: 103,
        linkedProductIds: [1, 5],
        productQuantities: { 1: 1, 5: 1 }
      };

      const result = calculateBundleStock(bundleWithZeroStockProduct, productsWithZeroStock);
      expect(result).toBe(0);
    });

    it('should handle bundles with single product', () => {
      const singleProductBundle: BundleProduct = {
        id: 104,
        linkedProductIds: [1],
        productQuantities: { 1: 3 }
      };

      // Product A has 10 stock, needs 3 per bundle = 3 bundles possible
      const result = calculateBundleStock(singleProductBundle, mockProducts);
      expect(result).toBe(3);
    });
  });

  describe('calculateBundleSaleUpdates', () => {
    it('should calculate correct stock reductions when bundle is sold', () => {
      const quantitySold = 2;
      const updates = calculateBundleSaleUpdates(mockBundle, quantitySold, mockProducts);

      expect(updates).toHaveLength(3);

      // Product A: 10 - (2 bundles * 2 needed) = 6
      const productAUpdate = updates.find(u => u.id === 1);
      expect(productAUpdate?.inventory_level).toBe(6);

      // Product B: 20 - (2 bundles * 1 needed) = 18
      const productBUpdate = updates.find(u => u.id === 2);
      expect(productBUpdate?.inventory_level).toBe(18);

      // Product C: 15 - (2 bundles * 3 needed) = 9
      const productCUpdate = updates.find(u => u.id === 3);
      expect(productCUpdate?.inventory_level).toBe(9);
    });

    it('should not reduce stock below 0', () => {
      const quantitySold = 10; // More than available
      const updates = calculateBundleSaleUpdates(mockBundle, quantitySold, mockProducts);

      // All products should have 0 stock (not negative)
      updates.forEach(update => {
        expect(update.inventory_level).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle missing products gracefully', () => {
      const bundleWithMissingProduct: BundleProduct = {
        id: 105,
        linkedProductIds: [1, 999],
        productQuantities: { 1: 1, 999: 1 }
      };

      const updates = calculateBundleSaleUpdates(bundleWithMissingProduct, 1, mockProducts);

      // Should only update existing products
      expect(updates).toHaveLength(1);
      expect(updates[0].id).toBe(1);
    });
  });

  describe('findAffectedBundles', () => {
    it('should find all bundles containing a specific product', () => {
      const affectedBundles = findAffectedBundles(1, mockBundles);

      // Product 1 is in both bundles
      expect(affectedBundles).toHaveLength(2);
      expect(affectedBundles.map(b => b.id)).toEqual([100, 101]);
    });

    it('should find bundles containing a product used in only one bundle', () => {
      const affectedBundles = findAffectedBundles(3, mockBundles);

      // Product 3 is only in bundle 100
      expect(affectedBundles).toHaveLength(1);
      expect(affectedBundles[0].id).toBe(100);
    });

    it('should return empty array when product is not in any bundle', () => {
      const affectedBundles = findAffectedBundles(999, mockBundles);
      expect(affectedBundles).toHaveLength(0);
    });
  });

  describe('calculateBundleUpdatesAfterIndividualSale', () => {
    it('should update bundle stocks when constituent product is sold individually', () => {
      // Sell 2 units of Product A (id: 1)
      const updates = calculateBundleUpdatesAfterIndividualSale(1, 2, mockBundles, mockProducts);

      expect(updates).toHaveLength(2); // Both bundles affected

      // Bundle 100: After selling 2 units of Product A (10->8)
      // Product A: 8/2 = 4 bundles, Product B: 20/1 = 20, Product C: 15/3 = 5
      // Limiting factor: Product A = 4 bundles
      const bundle100Update = updates.find(u => u.bundleId === 100);
      expect(bundle100Update?.newStock).toBe(4);

      // Bundle 101: After selling 2 units of Product A (10->8)
      // Product A: 8/1 = 8 bundles, Product D: 5/2 = 2 bundles
      // Limiting factor: Product D = 2 bundles
      const bundle101Update = updates.find(u => u.bundleId === 101);
      expect(bundle101Update?.newStock).toBe(2);
    });

    it('should handle selling more than available stock', () => {
      // Sell 15 units of Product A (more than the 10 available)
      const updates = calculateBundleUpdatesAfterIndividualSale(1, 15, mockBundles, mockProducts);

      // Both bundles should have 0 stock since Product A is depleted
      updates.forEach(update => {
        expect(update.newStock).toBe(0);
      });
    });

    it('should return empty array when product is not in any bundle', () => {
      const updates = calculateBundleUpdatesAfterIndividualSale(999, 5, mockBundles, mockProducts);
      expect(updates).toHaveLength(0);
    });
  });

  describe('validateBundle', () => {
    it('should return no errors for valid bundle', () => {
      const errors = validateBundle(mockBundle);
      expect(errors).toHaveLength(0);
    });

    it('should return error for bundle with no products', () => {
      const invalidBundle: BundleProduct = {
        id: 106,
        linkedProductIds: [],
        productQuantities: {}
      };

      const errors = validateBundle(invalidBundle);
      expect(errors).toContain('Bundle must contain at least one product');
    });

    it('should return error for bundle containing itself', () => {
      const selfReferencingBundle: BundleProduct = {
        id: 107,
        linkedProductIds: [1, 107],
        productQuantities: { 1: 1, 107: 1 }
      };

      const errors = validateBundle(selfReferencingBundle);
      expect(errors).toContain('Bundle cannot contain itself');
    });

    it('should return error for invalid quantities', () => {
      const invalidQuantityBundle: BundleProduct = {
        id: 108,
        linkedProductIds: [1, 2],
        productQuantities: { 1: 0, 2: -1 } // Invalid quantities
      };

      const errors = validateBundle(invalidQuantityBundle);
      expect(errors).toContain('Invalid quantity for product 1: must be at least 1');
      expect(errors).toContain('Invalid quantity for product 2: must be at least 1');
    });

    it('should return error for missing quantity definitions', () => {
      const missingQuantityBundle: BundleProduct = {
        id: 109,
        linkedProductIds: [1, 2],
        productQuantities: { 1: 2 } // Missing quantity for product 2
      };

      const errors = validateBundle(missingQuantityBundle);
      expect(errors).toContain('Invalid quantity for product 2: must be at least 1');
    });
  });

  describe('calculateInitialBundleStock', () => {
    it('should calculate correct initial stock for new bundle', () => {
      const linkedProductIds = [1, 2];
      const productQuantities = { 1: 2, 2: 3 };

      // Product A: 10/2 = 5 bundles, Product B: 20/3 = 6 bundles
      // Limiting factor: Product A = 5 bundles
      const initialStock = calculateInitialBundleStock(
        linkedProductIds,
        productQuantities,
        mockProducts
      );

      expect(initialStock).toBe(5);
    });

    it('should return 0 for bundle with missing products', () => {
      const linkedProductIds = [1, 999];
      const productQuantities = { 1: 1, 999: 1 };

      const initialStock = calculateInitialBundleStock(
        linkedProductIds,
        productQuantities,
        mockProducts
      );

      expect(initialStock).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty product list', () => {
      const result = calculateBundleStock(mockBundle, []);
      expect(result).toBe(0);
    });

    it('should handle bundle with default quantities (1)', () => {
      const bundleWithDefaults: BundleProduct = {
        id: 110,
        linkedProductIds: [1, 2],
        productQuantities: {} // No quantities specified, should default to 1
      };

      // Since productQuantities is empty, quantityNeeded defaults to 1
      // Product A: 10/1 = 10, Product B: 20/1 = 20, limiting factor = 10
      const result = calculateBundleStock(bundleWithDefaults, mockProducts);
      expect(result).toBe(10);
    });

    it('should handle fractional bundle calculations correctly', () => {
      const bundle: BundleProduct = {
        id: 111,
        linkedProductIds: [4],
        productQuantities: { 4: 3 }
      };

      // Product D has 5 stock, needs 3 per bundle = 1 bundle possible (5/3 = 1.67, floored to 1)
      const result = calculateBundleStock(bundle, mockProducts);
      expect(result).toBe(1);
    });
  });
});
