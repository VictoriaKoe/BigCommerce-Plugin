import type { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient } from '../../../lib/auth';
import { 
  parseLinkedProduct, 
  recalculateBundlesFromKeys 
} from '../../../lib/bundle-calculator';
import db from '../../../lib/db';
import { 
  calculateOrderDeltas, 
  getOrderHistory, 
  storeOrderHistory 
} from '../../../lib/order-history';
import { 
  checkWebhookDuplicate,
  cleanupExpiredWebhooks 
} from '../../../lib/webhook-deduplication';

// Utility to get bundle info for a product
async function getProductBundleInfo(productId: number, bc: any) {
  const { data: metafields } = await bc.get(`/catalog/products/${productId}/metafields`);
  const isBundle = metafields.find((f: any) => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';
  const linkedField = metafields.find((f: any) => f.key === 'linked_product_ids' && f.namespace === 'bundle');
  const linkedProductIds = linkedField ? JSON.parse(linkedField.value) : [];
  
  return { isBundle, linkedProductIds };
}

// Utility to get bundle info for a variant
async function getVariantBundleInfo(productId: number, variantId: number, bc: any) {
  const { data: metafields } = await bc.get(`/catalog/products/${productId}/variants/${variantId}/metafields`);
  const isBundle = metafields.find((f: any) => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';
  const linkedField = metafields.find((f: any) => f.key === 'linked_product_ids' && f.namespace === 'bundle');
  const linkedProductIds = linkedField ? JSON.parse(linkedField.value) : [];

  return { isBundle, linkedProductIds };
}

// parseLinkedProduct function moved to lib/bundle-calculator.ts

// Check if order is newly created by comparing date_created and date_modified
async function checkOrderStatus(orderId: number, storeHash: string, accessToken: string) {
  try {
    const orderResponse = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      console.warn('[Order Webhook] Could not fetch order details, assuming new order');
      
      return { isNewOrder: true, statusId: null, status: null };
    }

    const orderData = await orderResponse.json();
    const dateCreated = orderData.date_created;
    const dateModified = orderData.date_modified;
    const statusId = orderData.status_id;
    const status = orderData.status;
    
    // Parse timestamps to calculate difference
    const createdTime = new Date(dateCreated).getTime();
    const modifiedTime = new Date(dateModified).getTime();
    const timeDifferenceSeconds = Math.abs(modifiedTime - createdTime) / 1000;
    
    // Consider it a new order if timestamps are within 10 seconds of each other
    const isNewOrder = timeDifferenceSeconds <= 10;
    
    console.log(`[Order Webhook] Order ${orderId} - created: ${dateCreated}, modified: ${dateModified}, status: ${status} (${statusId}), difference: ${timeDifferenceSeconds}s, treating as ${isNewOrder ? 'new order' : 'edit'}`);
    
    return { isNewOrder, statusId, status };
  } catch (error) {
    console.warn('[Order Webhook] Error checking order timestamps, assuming new order:', error);
    
    return { isNewOrder: true, statusId: null, status: null };
  }
}

// Calculate deltas between original and current order items for order updates
async function calculateOrderUpdateDeltas(orderId: number, currentItems: any[], storeHash: string) {
  console.log('[Order Webhook] Calculating order deltas for order update');
  
  try {
    // Get previous order state from our storage
    const previousItems = await getOrderHistory(orderId, storeHash);
    
    // Calculate exact deltas using order history
    const deltas = calculateOrderDeltas(previousItems, currentItems);
    
    // Convert deltas to items for processing, but only for bundle-related changes
    const deltaItems = deltas.map(delta => ({
      product_id: delta.product_id,
      variant_id: delta.variant_id,
      name: delta.name,
      quantity: delta.quantityDelta, // The actual change in quantity
      originalQuantity: delta.newQuantity, // Current quantity for bundle calculations
      isOrderUpdate: true,
      changeType: delta.changeType
    }));
    
    console.log(`[Order Webhook] Prepared ${deltaItems.length} order deltas for processing`);
    
    return deltaItems;
    
  } catch (error) {
    console.error('[Order Webhook] Error calculating order deltas:', error);
    
    // Fallback: use simplified approach - recalculate bundles only
    return currentItems.map(item => ({
      ...item,
      quantity: 0, // Zero delta to avoid double deduction
      originalQuantity: item.quantity,
      isOrderUpdate: true,
      changeType: 'unchanged'
    }));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    // Prevent webhook loops - skip if this update was triggered by our app
    const isFromApp = req.headers['x-bundle-app-update'] === 'true';
    if (isFromApp) {
      console.log('[Order Webhook] Skipping app-generated update to prevent loops');
      
return res.status(200).json({ message: 'Skipped app-generated update' });
    }

    const order = req.body.data;
    const scope = req.body.scope;
    const timestamp = req.body.created_at || Math.floor(Date.now() / 1000);
    // Extract store hash from producer field (format: "stores/7wt5mizwwn")
    const storeHash = req.body.producer?.split('/')[1];

    if (!order || !storeHash) {
      return res.status(400).json({ message: 'Missing required information' });
    }

    const orderId = order.id;

    // Check for duplicate webhook before any processing (atomically registers if new)
    const { isDuplicate, webhookId } = await checkWebhookDuplicate(orderId, storeHash, timestamp, scope);
    
    if (isDuplicate) {
      console.log(`[Order Webhook] Duplicate webhook detected for order ${orderId}, skipping processing`);
      
return res.status(200).json({ message: 'Duplicate webhook ignored', webhookId });
    }
    
    // Webhook is now registered atomically - safe to process
    console.log(`[Order Webhook] Processing webhook ${webhookId} for order ${orderId}`);

    // Get the access token for this store from the database
    const accessToken = await db.getStoreToken(storeHash);

    if (!accessToken) {
      return res.status(401).json({ message: 'Store not authorized' });
    }

    const bc = bigcommerceClient(accessToken, storeHash);

    // Only process store/order/updated events (handles both new orders and edits)
    if (scope !== 'store/order/updated') {
      console.log(`[Order Webhook] Ignoring ${scope} - only processing store/order/updated`);
      
return res.status(200).json({ message: 'Webhook scope not handled' });
    }

    // Check if this is a new order or an edit by comparing timestamps
    const { isNewOrder, statusId, status } = await checkOrderStatus(orderId, storeHash, accessToken);
    console.log(`[Order Webhook] Processing ${isNewOrder ? 'new order' : 'order update'}: ${orderId}`);

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

    const currentOrderItems = await orderProductsRes.json();

    // Check if this is a canceled, refunded, or partially refunded order
    const isCanceled = statusId === 5; // Cancelled
    const isRefunded = statusId === 4; // Refunded
    const isPartiallyRefunded = statusId === 14; // Partially Refunded
    const shouldRestoreInventory = isCanceled || isRefunded;

    // Handle new orders vs order updates differently
    let itemsToProcess = currentOrderItems;
    
    if (isNewOrder) {
      // For new orders, process all items as-is (no deltas needed)
      console.log('[Order Webhook] Processing new order - using full order data');
      
      // Store order history for future comparisons
      await storeOrderHistory(orderId, storeHash, currentOrderItems);
    } else if (shouldRestoreInventory) {
      // For canceled/refunded orders, restore all inventory by inverting quantities
      console.log(`[Order Webhook] Order ${orderId} is ${status} - restoring full inventory`);
      
      // Get the original order items from history
      const previousItems = await getOrderHistory(orderId, storeHash);
      
      if (previousItems && previousItems.length > 0) {
        // Invert the quantities to restore inventory
        itemsToProcess = previousItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          quantity: -item.quantity, // Negative to restore
          originalQuantity: 0, // Current quantity is effectively 0
          isOrderUpdate: true,
          changeType: 'cancelled'
        }));
        console.log(`[Order Webhook] Will restore inventory for ${itemsToProcess.length} items from canceled/refunded order`);
      } else {
        console.warn(`[Order Webhook] No order history found for ${status} order ${orderId}, cannot restore inventory`);
        itemsToProcess = [];
      }
      
      // Update history to mark as processed
      await storeOrderHistory(orderId, storeHash, currentOrderItems);
    } else if (isPartiallyRefunded) {
      // For partially refunded orders, restore inventory based on quantity_refunded field
      console.log(`[Order Webhook] Order ${orderId} is ${status} - processing partial refund`);
      
      // Process items with quantity_refunded > 0
      itemsToProcess = currentOrderItems
        .filter(item => item.quantity_refunded && item.quantity_refunded > 0)
        .map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          quantity: -item.quantity_refunded, // Negative to restore refunded quantity
          originalQuantity: item.quantity - item.quantity_refunded, // Remaining valid quantity
          isOrderUpdate: true,
          changeType: 'partial_refund'
        }));
      
      console.log(`[Order Webhook] Will restore inventory for ${itemsToProcess.length} partially refunded items`);
      itemsToProcess.forEach(item => {
        console.log(`  - ${item.name}: restoring ${Math.abs(item.quantity)} units (${item.originalQuantity} remaining)`);
      });
      
      // Store adjusted quantities (net remaining after refund) in history
      // This ensures future cancellations only restore the remaining quantity
      const adjustedItems = currentOrderItems.map(item => ({
        ...item,
        quantity: item.quantity - (item.quantity_refunded || 0), // Store NET quantity
        // Keep quantity_refunded for reference
      }));
      
      console.log(`[Order Webhook] Storing adjusted order history with net quantities`);
      await storeOrderHistory(orderId, storeHash, adjustedItems);
    } else {
      // For regular order updates, calculate deltas to handle edits properly
      console.log('[Order Webhook] Processing order update - calculating deltas');
      itemsToProcess = await calculateOrderUpdateDeltas(orderId, currentOrderItems, storeHash);
      
      // Update stored order history with current state
      await storeOrderHistory(orderId, storeHash, currentOrderItems);
    }

    console.log(`[Order Webhook] Processing order ${orderId} with ${itemsToProcess.length} items`);

    // Get bundle category products only (much more efficient)
    const bundleProducts = [];
    const bundleVariants = [];
    
    try {
      const { data: categories } = await bc.get('/catalog/categories?limit=250');
      const bundleCategory = categories.find((c: any) => String(c?.name || '').toLowerCase() === 'bundle');
      
      if (bundleCategory) {
        //console.log(`[Order Webhook] Found bundle category: ${bundleCategory.id}`);
        const { data: bundleCategoryProducts } = await bc.get(`/catalog/products?categories:in=${bundleCategory.id}`);
        //console.log(`[Order Webhook] Found ${bundleCategoryProducts.length} products in bundle category`);
        
        // Only check metafields for products in bundle category
        for (const product of bundleCategoryProducts) {
      // Check product-level metafields
      const { isBundle: isProductBundle, linkedProductIds: productLinkedProductIds } = await getProductBundleInfo(product.id, bc);
      
          if (isProductBundle && productLinkedProductIds.length > 0) {
        bundleProducts.push({
          id: product.id,
          linkedProductIds: productLinkedProductIds
        });
            //console.log(`[Order Webhook] Found product bundle: ${product.id}`);
      }

      // Check variant-level metafields
      const { data: variants } = await bc.get(`/catalog/products/${product.id}/variants`);
      for (const variant of variants) {
        const { isBundle: isVariantBundle, linkedProductIds: variantLinkedProductIds } = await getVariantBundleInfo(product.id, variant.id, bc);
        
            if (isVariantBundle && variantLinkedProductIds.length > 0) {
          bundleVariants.push({
            productId: product.id,
            variantId: variant.id,
            linkedProductIds: variantLinkedProductIds
          });
              console.log(`[Order Webhook] Found variant bundle: ${product.id}:${variant.id}`);
            }
          }
        }
      } else {
        //console.log(`[Order Webhook] No bundle category found, will check ordered items individually`);
      }
    } catch (error) {
      console.warn(`[Order Webhook] Could not fetch bundle category, falling back to individual checks:`, error);
    }

    // Collect all inventory updates to batch them
    const inventoryUpdates = new Map<string, { productId: number, variantId: number | null, newLevel: number }>();
    const bundleRecalculations = new Set<string>();

    // Process each ordered item (either full order or deltas)
    for (const item of itemsToProcess) {
      const productId = item.product_id;
      const variantId = item.variant_id;
      const orderedQuantity = item.quantity;
      const isOrderUpdate = item.isOrderUpdate || false;
      
      console.log(`[Order Webhook] Processing item: Product ${productId}${variantId ? ` Variant ${variantId}` : ''} x${orderedQuantity}${isOrderUpdate ? ' (order update)' : ''}`);
      
      // For order updates with zero delta, skip processing (no change)
      if (isOrderUpdate && orderedQuantity === 0) {
        console.log(`[Order Webhook] Skipping item with no quantity change`);
        continue;
      }
      
      // Check if this ordered item is a known bundle
      let isItemABundle = false;
      
      if (variantId) {
        // Check if this variant is a bundle
        const variantBundle = bundleVariants.find(b => b.productId === productId && b.variantId === variantId);
        if (variantBundle) {
          console.log(`[Order Webhook] Ordered item is a variant bundle: ${productId}:${variantId}`);
          isItemABundle = true;
          
          // For new orders, deduct full quantity. For updates, deduct/restore based on delta
          if (orderedQuantity !== 0) {
            // Adjust stock for each component in the bundle based on quantity delta
            for (const linkedProduct of variantBundle.linkedProductIds) {
              const { productId: targetProductId, variantId: targetVariantId, quantity } = parseLinkedProduct(linkedProduct);
              const totalQuantity = orderedQuantity * quantity;
              
              const key = targetVariantId ? `${targetProductId}:${targetVariantId}` : `${targetProductId}`;
              const current = inventoryUpdates.get(key);
              const newDeduction = (current?.newLevel || 0) + totalQuantity;
              
              inventoryUpdates.set(key, {
                productId: targetProductId,
                variantId: targetVariantId,
                newLevel: newDeduction
              });
              
              console.log(`[Order Webhook] Will ${orderedQuantity > 0 ? 'deduct' : 'restore'} ${Math.abs(totalQuantity)} ${orderedQuantity > 0 ? 'from' : 'to'} ${key}`);
            }
          }
        }
      }
      
      if (!isItemABundle) {
        // Check if the parent product is a bundle
        const productBundle = bundleProducts.find(b => b.id === productId);
        if (productBundle) {
          console.log(`[Order Webhook] Ordered item is a product bundle: ${productId}`);
          isItemABundle = true;
          
          // For new orders, deduct full quantity. For updates, deduct/restore based on delta
          if (orderedQuantity !== 0) {
            // Adjust stock for each component in the bundle based on quantity delta
            for (const linkedProduct of productBundle.linkedProductIds) {
                const { productId: targetProductId, variantId: targetVariantId, quantity } = parseLinkedProduct(linkedProduct);
                const totalQuantity = orderedQuantity * quantity;
              
              const key = targetVariantId ? `${targetProductId}:${targetVariantId}` : `${targetProductId}`;
              const current = inventoryUpdates.get(key);
              const newDeduction = (current?.newLevel || 0) + totalQuantity;
              
              inventoryUpdates.set(key, {
                productId: targetProductId,
                variantId: targetVariantId,
                newLevel: newDeduction
              });
              
              console.log(`[Order Webhook] Will ${orderedQuantity > 0 ? 'deduct' : 'restore'} ${Math.abs(totalQuantity)} ${orderedQuantity > 0 ? 'from' : 'to'} ${key}`);
            }
          }
        }
      }
      
      if (!isItemABundle) {
        // Individual item purchased - mark bundles containing this item for recalculation
        // For order updates, we still need to recalculate bundles because the item quantities may have changed
        const displayQuantity = isOrderUpdate ? item.originalQuantity : orderedQuantity;
        console.log(`[Order Webhook] Individual item purchased: ${productId}${variantId ? `:${variantId}` : ''} (qty: ${displayQuantity})`);
        
        // Find bundles that contain this product/variant
        for (const bundle of bundleProducts) {
          const containsItem = bundle.linkedProductIds.some((linked: any) => {
            const targetProductId = typeof linked === 'object' ? linked.productId : linked;
            const targetVariantId = typeof linked === 'object' ? linked.variantId : null;
            
return targetProductId === productId && (!variantId || targetVariantId === variantId);
          });
          
          if (containsItem) {
            bundleRecalculations.add(`product:${bundle.id}`);
            console.log(`[Order Webhook] Bundle ${bundle.id} needs recalculation ${isOrderUpdate ? '(order update)' : ''}`);
          }
        }
        
        for (const bundle of bundleVariants) {
          const containsItem = bundle.linkedProductIds.some((linked: any) => {
            const targetProductId = typeof linked === 'object' ? linked.productId : linked;
            const targetVariantId = typeof linked === 'object' ? linked.variantId : null;
            
return targetProductId === productId && (!variantId || targetVariantId === variantId);
          });
          
          if (containsItem) {
            bundleRecalculations.add(`variant:${bundle.productId}:${bundle.variantId}`);
            console.log(`[Order Webhook] Variant bundle ${bundle.productId}:${bundle.variantId} needs recalculation ${isOrderUpdate ? '(order update)' : ''}`);
          }
        }
      } else if (isOrderUpdate) {
        // Even if item is a bundle, we need to recalculate bundle stock for order updates
        // because BigCommerce may have changed the bundle's own stock level
        if (variantId) {
          bundleRecalculations.add(`variant:${productId}:${variantId}`);
          console.log(`[Order Webhook] Variant bundle ${productId}:${variantId} needs recalculation (order update)`);
        } else {
          bundleRecalculations.add(`product:${productId}`);
          console.log(`[Order Webhook] Product bundle ${productId} needs recalculation (order update)`);
        }
      }
    }

    // Apply inventory deductions
    console.log(`[Order Webhook] Applying ${inventoryUpdates.size} inventory updates`);
    for (const [key, update] of Array.from(inventoryUpdates)) {
      try {
        if (update.variantId) {
          const { data: variant } = await bc.get(`/catalog/products/${update.productId}/variants/${update.variantId}`);
          // For positive deltas: subtract from stock. For negative deltas: add to stock
          const newStock = Math.max(0, variant.inventory_level - update.newLevel);
          
          const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products/${update.productId}/variants/${update.variantId}`, {
            method: 'PUT',
            headers: {
              'X-Auth-Token': accessToken,
              'Content-Type': 'application/json',
              'X-Bundle-App-Update': 'true' // Prevent webhook loops
            },
            body: JSON.stringify({ inventory_level: newStock })
          });
          
          if (response.ok) {
            console.log(`[Order Webhook] Updated variant ${update.productId}:${update.variantId} inventory: ${variant.inventory_level} → ${newStock}`);
          } else {
            console.error(`[Order Webhook] Failed to update variant ${update.productId}:${update.variantId}: ${response.status}`);
          }
        } else {
          const { data: product } = await bc.get(`/catalog/products/${update.productId}`);
          const newStock = Math.max(0, product.inventory_level - update.newLevel);
          
          const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products`, {
            method: 'PUT',
            headers: {
              'X-Auth-Token': accessToken,
              'Content-Type': 'application/json',
              'X-Bundle-App-Update': 'true' // Prevent webhook loops
            },
            body: JSON.stringify([{ id: update.productId, inventory_level: newStock }])
          });
          
          if (response.ok) {
            console.log(`[Order Webhook] Updated product ${update.productId} inventory: ${product.inventory_level} → ${newStock}`);
          } else {
            console.error(`[Order Webhook] Failed to update product ${update.productId}: ${response.status}`);
          }
        }
      } catch (error) {
        console.error(`[Order Webhook] Failed to update inventory for ${key}:`, error);
      }
    }

    // Recalculate affected bundles using shared utility
    await recalculateBundlesFromKeys(bundleRecalculations, bundleProducts, bundleVariants, bc, storeHash, accessToken);

    // Cleanup old webhook records periodically (1% chance per webhook)
    if (Math.random() < 0.01) {
      cleanupExpiredWebhooks(); // Don't await - run in background
    }

    res.status(200).json({ message: 'Stock levels updated successfully', webhookId });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
