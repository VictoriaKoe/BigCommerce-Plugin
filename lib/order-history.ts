import { sql } from './database.js';
import db from './db';

export interface OrderItem {
  product_id: number;
  variant_id?: number;
  quantity: number;
  name: string;
  price_inc_tax: number;
}

export interface OrderDelta {
  product_id: number;
  variant_id?: number;
  oldQuantity: number;
  newQuantity: number;
  quantityDelta: number; // positive = increase, negative = decrease
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
  name: string;
}

// Store order snapshot for future comparison
export async function storeOrderHistory(    
  orderId: number, 
  storeHash: string, 
  orderItems: any
): Promise<void> {
  try {
    const storeToken = await db.getStoreToken(storeHash);
    if (!storeToken) {
      console.warn(`[Order History] No store token found for ${storeHash}`);
      
return;
    }

    // Ensure orderItems is an array
    const itemsArray = Array.isArray(orderItems) ? orderItems : [orderItems];
    const itemsJson = JSON.stringify(itemsArray);

    // Store the order items as JSON
    await sql`
      INSERT INTO order_history (order_id, store_hash, order_items) 
      VALUES (${orderId}, ${storeHash}, ${itemsJson}) 
      ON CONFLICT (order_id, store_hash) 
      DO UPDATE SET 
        order_items = ${itemsJson}, 
        created_at = CURRENT_TIMESTAMP
    `;
    
    console.log(`[Order History] Stored history for order ${orderId} (${itemsArray.length} items)`);
  } catch (error) {
    console.error(`[Order History] Failed to store order ${orderId}:`, error);
  }
}

// Get previous order state from storage
export async function getOrderHistory(
  orderId: number, 
  storeHash: string
): Promise<OrderItem[] | null> {
  try {
    const result = await sql`
      SELECT order_items 
      FROM order_history 
      WHERE order_id = ${orderId} AND store_hash = ${storeHash}
    `;
    
    if (result.length === 0) {
      console.log(`[Order History] No previous history found for order ${orderId}`);
      
return null;
    }
    
    try {
      const rawData = result[0].order_items;
      const orderItems = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      console.log(`[Order History] Retrieved history for order ${orderId} (${orderItems.length} items)`);
      
return orderItems;
    } catch (parseError) {
      console.error(`[Order History] Failed to parse order items for order ${orderId}:`, parseError);
      console.error(`[Order History] Raw data:`, result[0].order_items);
      
return null;
    }
  } catch (error) {
    console.error(`[Order History] Failed to get order ${orderId} history:`, error);
    
return null;
  }
}

// Calculate exact deltas between previous and current order state
export function calculateOrderDeltas(
  previousItems: OrderItem[] | null, 
  currentItems: OrderItem[]
): OrderDelta[] {
  if (!previousItems) {
    // No previous state = all items are new (treat as new order)
    return currentItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      oldQuantity: 0,
      newQuantity: item.quantity,
      quantityDelta: item.quantity,
      changeType: 'added' as const,
      name: item.name
    }));
  }

  const deltas: OrderDelta[] = [];
  const previousMap = new Map<string, OrderItem>();
  const currentMap = new Map<string, OrderItem>();
  
  // Create lookup maps
  previousItems.forEach(item => {
    const key = item.variant_id ? `${item.product_id}:${item.variant_id}` : `${item.product_id}`;
    previousMap.set(key, item);
  });
  
  currentItems.forEach(item => {
    const key = item.variant_id ? `${item.product_id}:${item.variant_id}` : `${item.product_id}`;
    currentMap.set(key, item);
  });
  
  // Find all unique items (current + previous)
  const allKeys = new Set([...Array.from(previousMap.keys()), ...Array.from(currentMap.keys())]);
  
  for (const key of Array.from(allKeys)) {
    const previousItem = previousMap.get(key);
    const currentItem = currentMap.get(key);
    
    if (!previousItem && currentItem) {
      // Item was added
      deltas.push({
        product_id: currentItem.product_id,
        variant_id: currentItem.variant_id,
        oldQuantity: 0,
        newQuantity: currentItem.quantity,
        quantityDelta: currentItem.quantity,
        changeType: 'added',
        name: currentItem.name
      });
    } else if (previousItem && !currentItem) {
      // Item was removed
      deltas.push({
        product_id: previousItem.product_id,
        variant_id: previousItem.variant_id,
        oldQuantity: previousItem.quantity,
        newQuantity: 0,
        quantityDelta: -previousItem.quantity,
        changeType: 'removed',
        name: previousItem.name
      });
    } else if (previousItem && currentItem) {
      // Item exists in both - check if quantity changed
      const quantityDelta = currentItem.quantity - previousItem.quantity;
      
      deltas.push({
        product_id: currentItem.product_id,
        variant_id: currentItem.variant_id,
        oldQuantity: previousItem.quantity,
        newQuantity: currentItem.quantity,
        quantityDelta: quantityDelta,
        changeType: quantityDelta === 0 ? 'unchanged' : 'modified',
        name: currentItem.name
      });
    }
  }
  
  console.log(`[Order History] Calculated ${deltas.length} deltas:`);
  deltas.forEach(delta => {
    if (delta.changeType !== 'unchanged') {
      console.log(`  ${delta.changeType.toUpperCase()}: ${delta.name} (${delta.oldQuantity} → ${delta.newQuantity})`);
    }
  });
  
  return deltas;
}

// Clean up old order history (keep last 30 days)
export async function cleanupOrderHistory(): Promise<void> {
  try {
    await sql`
      DELETE FROM order_history 
      WHERE created_at < NOW() - INTERVAL '30 days'
    `;
    
    console.log(`[Order History] Cleaned up old order history records`);
  } catch (error) {
    console.error('[Order History] Failed to cleanup old records:', error);
  }
}
