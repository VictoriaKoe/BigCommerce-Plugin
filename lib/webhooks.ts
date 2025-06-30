/* eslint-disable no-console */
import { bigcommerceClient } from './auth';

interface WebhookConfig {
  scope: string;
  destination: string;
  is_active: boolean;
}

interface CreateWebhookParams {
  accessToken: string;
  storeHash: string;
  appUrl?: string;
}

export async function ensureWebhookExists({ accessToken, storeHash, appUrl }: CreateWebhookParams) {
  const baseUrl = appUrl || process.env.APP_URL;

  if (!baseUrl) {
    console.error('APP_URL is not configured');
    throw new Error('APP_URL is required for webhook creation');
  }

  const bc = bigcommerceClient(accessToken, storeHash);

  try {
    // Check if webhook already exists
    const { data: existingWebhooks } = await bc.get('/hooks');
    const orderWebhook = existingWebhooks.find((webhook: any) =>
      webhook.scope === 'store/order/created' &&
      webhook.destination === `${baseUrl}/api/webhooks/orders`
    );

    if (orderWebhook) {
      console.log(`✅ Webhook already exists for store ${storeHash}:`, orderWebhook.id);

      return orderWebhook;
    }

    // Create new webhook
    const webhookConfig: WebhookConfig = {
      scope: 'store/order/created',
      destination: `${baseUrl}/api/webhooks/orders`,
      is_active: true
    };

    const { data: newWebhook } = await bc.post('/hooks', webhookConfig);
    console.log(`✅ Created webhook for store ${storeHash}:`, newWebhook.id);

    return newWebhook;
  } catch (error: any) {
    console.error(`❌ Error managing webhook for store ${storeHash}:`, error.response?.data || error.message);

    // Don't throw error - webhook creation failure shouldn't break app installation
    // Log the error and continue
    if (error.response?.status === 422) {
      console.log('Webhook may already exist or there may be a configuration issue');
    }

    return null;
  }
}

export async function removeWebhook({ accessToken, storeHash, webhookId }: CreateWebhookParams & { webhookId: string }) {
  const bc = bigcommerceClient(accessToken, storeHash);

  try {
    await bc.delete(`/hooks/${webhookId}`);
    console.log(`✅ Removed webhook ${webhookId} for store ${storeHash}`);

    return true;
  } catch (error: any) {
    console.error(`❌ Error removing webhook ${webhookId} for store ${storeHash}:`, error.response?.data || error.message);

    return false;
  }
}

export async function listWebhooks({ accessToken, storeHash }: CreateWebhookParams) {
  const bc = bigcommerceClient(accessToken, storeHash);

  try {
    const { data: webhooks } = await bc.get('/hooks');

    return webhooks;
  } catch (error: any) {
    console.error(`❌ Error listing webhooks for store ${storeHash}:`, error.response?.data || error.message);

    return [];
  }
}
