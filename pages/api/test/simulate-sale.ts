/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Get session from the authenticated user
    const { accessToken, storeHash } = await getSession(req);
    
    if (!accessToken || !storeHash) {
      return res.status(401).json({ message: 'Unauthorized - missing session data' });
    }

    const bc = bigcommerceClient(accessToken, storeHash);

    // First, verify the product exists
    try {
      await bc.get(`/catalog/products/${productId}`);
    } catch (error) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create a simulated order payload
    const simulatedOrder = {
      data: {
        id: `test_${Date.now()}`, // Generate a unique test ID
        status: 'completed'
      }
    };

    // Create simulated order products payload
    const orderDetails = [{
      product_id: productId,
      quantity: quantity
    }];

    // Get all products that are bundles
    const { data: allProducts } = await bc.get('/catalog/products');
    const bundleProducts = [];

    // Find all bundles and their details
    for (const product of allProducts) {
      const { data: metafields } = await bc.get(`/catalog/products/${product.id}/metafields`);
      const isBundle = metafields.find(f => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';

      if (isBundle) {
        const linkedField = metafields.find(f => f.key === 'linked_product_ids' && f.namespace === 'bundle');
        const productQuantitiesField = metafields.find(f => f.key === 'product_quantities' && f.namespace === 'bundle');

        if (linkedField && productQuantitiesField) {
          bundleProducts.push({
            id: product.id,
            linkedProductIds: JSON.parse(linkedField.value),
            productQuantities: JSON.parse(productQuantitiesField.value)
          });
        }
      }
    }

    // Process the simulated order
    for (const item of orderDetails) {
      const productId = item.product_id;
      const orderedQuantity = item.quantity;

      console.log(`🔍 Processing simulated sale of product ${productId}...`);

      // Check if the ordered item is a bundle
      const { data: itemMetafields } = await bc.get(`/catalog/products/${productId}/metafields`);
      const isBundle = itemMetafields.find(f => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';

      if (isBundle) {
        // Handle bundle purchase
        console.log(`📦 Product ${productId} is a bundle`);
        const linkedField = itemMetafields.find(f => f.key === 'linked_product_ids' && f.namespace === 'bundle');
        const productQuantitiesField = itemMetafields.find(f => f.key === 'product_quantities' && f.namespace === 'bundle');

        if (linkedField && productQuantitiesField) {
          const linkedProductIds = JSON.parse(linkedField.value);
          const productQuantities = JSON.parse(productQuantitiesField.value);

          // Update stock for each product in the bundle
          for (const linkedId of linkedProductIds) {
            const quantity = productQuantities[linkedId] || 1;
            const totalQuantity = orderedQuantity * quantity;

            const { data: linkedProduct } = await bc.get(`/catalog/products/${linkedId}`);
            const newStock = Math.max(0, linkedProduct.inventory_level - totalQuantity);

            console.log(`📉 Reducing stock for bundled product ${linkedId}: ${linkedProduct.inventory_level} → ${newStock}`);
            await bc.put(`/catalog/products/${linkedId}`, {
              inventory_level: newStock
            });
          }
        }
      } else {
        // Handle individual product purchase - only update affected bundles
        console.log(`📦 Product ${productId} is an individual item`);

        // Manually reduce the stock since this is a simulation
        const { data: product } = await bc.get(`/catalog/products/${productId}`);
        const newStock = Math.max(0, product.inventory_level - orderedQuantity);

        console.log(`📉 Reducing stock for product ${productId}: ${product.inventory_level} → ${newStock}`);
        await bc.put(`/catalog/products/${productId}`, {
          inventory_level: newStock
        });

        // Find and update all bundles that contain this product
        const affectedBundles = bundleProducts.filter(bundle =>
          bundle.linkedProductIds.includes(productId)
        );

        console.log(`🔍 Found ${affectedBundles.length} bundles containing product ${productId}`);

        for (const bundle of affectedBundles) {
          // Calculate the new maximum possible bundle quantity based on all constituent products
          let minPossibleBundles = Infinity;

          for (const linkedId of bundle.linkedProductIds) {
            const { data: linkedProduct } = await bc.get(`/catalog/products/${linkedId}`);
            const quantityNeeded = bundle.productQuantities[linkedId] || 1;
            const possibleBundles = Math.floor(linkedProduct.inventory_level / quantityNeeded);
            minPossibleBundles = Math.min(minPossibleBundles, possibleBundles);
          }

          console.log(`📊 Updating bundle ${bundle.id} stock to ${minPossibleBundles}`);
          await bc.put(`/catalog/products/${bundle.id}`, {
            inventory_level: minPossibleBundles
          });
        }
      }
    }

    res.status(200).json({
      message: 'Sale simulated successfully',
      details: {
        productId,
        quantity,
        simulatedOrderId: simulatedOrder.data.id
      }
    });
  } catch (error: any) {
    console.error('Error simulating sale:', error);
    res.status(500).json({ message: 'Error simulating sale', error: error.message });
  }
}
