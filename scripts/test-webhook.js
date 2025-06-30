/* eslint-disable no-console */
import 'dotenv/config';
import { ensureWebhookExists, listWebhooks } from '../lib/webhooks.js';
import { getStoreCredentials } from './db.js';

async function testWebhookManagement() {
  try {
    // Get store credentials from database
    const { storeHash, accessToken } = await getStoreCredentials();

    console.log(`Testing webhook management for store: ${storeHash}`);

    // List existing webhooks
    console.log('\n📋 Listing existing webhooks...');
    const existingWebhooks = await listWebhooks({ accessToken, storeHash });
    console.log('Existing webhooks:', existingWebhooks.length);
    existingWebhooks.forEach(webhook => {
      console.log(`  - ${webhook.scope}: ${webhook.destination} (ID: ${webhook.id})`);
    });

    // Ensure webhook exists
    console.log('\n🔧 Ensuring webhook exists...');
    const webhook = await ensureWebhookExists({ accessToken, storeHash });
    
    if (webhook) {
      console.log('✅ Webhook management successful');
      console.log('Webhook details:', {
        id: webhook.id,
        scope: webhook.scope,
        destination: webhook.destination,
        is_active: webhook.is_active
      });
    } else {
      console.log('⚠️ Webhook creation returned null (may already exist or failed)');
    }

    // List webhooks again to confirm
    console.log('\n📋 Final webhook list...');
    const finalWebhooks = await listWebhooks({ accessToken, storeHash });
    console.log('Total webhooks:', finalWebhooks.length);
    finalWebhooks.forEach(webhook => {
      console.log(`  - ${webhook.scope}: ${webhook.destination} (ID: ${webhook.id})`);
    });

  } catch (error) {
    console.error('❌ Error testing webhook management:', error.message);
    if (error.response?.data) {
      console.error('API Error Details:', error.response.data);
    }
  }
}

testWebhookManagement();
