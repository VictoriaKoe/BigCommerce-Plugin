/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    console.log('✅ Webhook received:', JSON.stringify(req.body, null, 2));

    const order = req.body.data;
    const storeHash = req.body.store_id; // BigCommerce sends store_id in webhook payload

    if (!order || !storeHash) {
      console.error('❌ Missing order or storeHash in webhook payload');

      return res.status(400).json({ message: 'Missing required information' });
    }

    // Get the access token for this store from the database
    const accessToken = await db.getStoreToken(storeHash);

    if (!accessToken) {
      console.error(`❌ No access token found for store ${storeHash}`);

      return res.status(401).json({ message: 'Store not authorized' });
    }

    const bc = bigcommerceClient(accessToken, storeHash);
    const orderId = order.id;

    console.log(`📦 Fetching products for order ID ${orderId} via V2...`);

    // Fetch order products using V2 API manually
    const orderProductsRes = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}/products`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!orderProductsRes.ok) {
      throw new Error(`Failed to fetch order products: ${orderProductsRes.status}`);
    }

    const orderDetails = await orderProductsRes.json();

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

    // Process each ordered item
    for (const item of orderDetails) {
      const productId = item.product_id;
      const orderedQuantity = item.quantity;

      console.log(`🔍 Processing ordered product ${productId}...`);

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

    console.log('✅ Inventory updates completed.');
    res.status(200).json({ message: 'Stock levels updated successfully' });
  } catch (err: any) {
    console.error('[Webhook] ❌ Error processing order:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
