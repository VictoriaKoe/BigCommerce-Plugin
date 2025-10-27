import { sql } from './database.js';

export interface WebhookDeduplicationResult {
  isDuplicate: boolean;
  webhookId: string;
}

// Generate webhook ID from request data
export function generateWebhookId(orderId: number, storeHash: string, timestamp: number, scope: string): string {
  // Create unique ID based on order, store, timestamp, and scope
  return `${storeHash}-${scope}-${orderId}-${timestamp}`;
}

// Check if webhook has already been processed (with race condition protection)
export async function checkWebhookDuplicate(
  orderId: number, 
  storeHash: string, 
  timestamp: number,
  scope: string
): Promise<WebhookDeduplicationResult> {
  const webhookId = generateWebhookId(orderId, storeHash, timestamp, scope);
  
  try {
    // Use atomic INSERT to prevent race conditions
    // If webhook already exists, this will fail due to UNIQUE constraint
    try {
      await sql`
        INSERT INTO webhook_processed (webhook_id, order_id, store_hash)
        VALUES (${webhookId}, ${orderId}, ${storeHash})
      `;
      
      console.log(`[Webhook Dedup] New webhook registered: ${webhookId}`);
      
return { isDuplicate: false, webhookId };
      
    } catch (insertError: any) {
      // Check if error is due to duplicate key (UNIQUE constraint violation)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
        console.log(`[Webhook Dedup] Duplicate webhook detected (atomic insert failed): ${webhookId}`);
        
return { isDuplicate: true, webhookId };
      }
      
      // For other errors, check manually
      const existing = await sql`
        SELECT webhook_id, processed_at 
        FROM webhook_processed 
        WHERE webhook_id = ${webhookId} 
        AND expires_at > CURRENT_TIMESTAMP
      `;
      
      if (existing.length > 0) {
        console.log(`[Webhook Dedup] Duplicate webhook detected: ${webhookId} (first processed: ${existing[0].processed_at})`);
        
return { isDuplicate: true, webhookId };
      }
      
      // Also check for very recent webhooks for the same order (within 5 seconds)
      const recentWebhooks = await sql`
        SELECT webhook_id, processed_at 
        FROM webhook_processed 
        WHERE order_id = ${orderId} 
        AND store_hash = ${storeHash}
        AND processed_at > (CURRENT_TIMESTAMP - INTERVAL '5 seconds')
        AND expires_at > CURRENT_TIMESTAMP
      `;
      
      if (recentWebhooks.length > 0) {
        console.log(`[Webhook Dedup] Recent webhook for order ${orderId} detected within 5 seconds`);
        
return { isDuplicate: true, webhookId };
      }
      
      // Unknown error but no duplicate found - allow processing
      console.warn(`[Webhook Dedup] Warning: Insert failed but no duplicate found:`, insertError);
      
return { isDuplicate: false, webhookId };
    }
    
  } catch (error) {
    console.error('[Webhook Dedup] Error checking webhook duplicate:', error);
    // On error, allow processing but log the issue

    return { isDuplicate: false, webhookId };
  }
}

// Mark webhook as processed
export async function markWebhookProcessed(
  orderId: number, 
  storeHash: string, 
  webhookId: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO webhook_processed (webhook_id, order_id, store_hash)
      VALUES (${webhookId}, ${orderId}, ${storeHash})
      ON CONFLICT (webhook_id) DO NOTHING
    `;
    
    console.log(`[Webhook Dedup] Marked webhook as processed: ${webhookId}`);
    
  } catch (error) {
    console.error('[Webhook Dedup] Error marking webhook as processed:', error);
  }
}

// Clean up expired webhook records (call this periodically)
export async function cleanupExpiredWebhooks(): Promise<void> {
  try {
    await sql`
      DELETE FROM webhook_processed 
      WHERE expires_at < CURRENT_TIMESTAMP
    `;
    
    console.log(`[Webhook Dedup] Cleaned up expired webhook records`);
    
  } catch (error) {
    console.error('[Webhook Dedup] Error cleaning up expired webhooks:', error);
  }
}
