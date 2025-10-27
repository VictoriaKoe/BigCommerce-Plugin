/* eslint-disable no-console */
import 'dotenv/config';
import axios from 'axios';

async function simulateOrderUpdate() {
  const orderId = process.argv[2] || '174'; // Default to order 174
  const appUrl = 'http://localhost:3000'; // Force local for testing
  
  console.log(`🎭 Simulating Order Update Webhook for Order #${orderId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Use fixed timestamp for duplicate testing
  const fixedTimestamp = 1759194000; // Fixed timestamp for testing duplicates
  
  // Simulate BigCommerce webhook payload for order update
  const webhookPayload = {
    scope: 'store/order/updated',
    store_id: '1025646',
    data: {
      type: 'order',
      id: parseInt(orderId)
    },
    hash: 'c699d6f4e7b0d8d49c7a71db00e67c6f3ab0bd5b',
    created_at: fixedTimestamp,
    producer: 'stores/7wt5mizwwn'
  };

  try {
    console.log(`📡 Sending webhook to: ${appUrl}/api/webhooks/orders`);
    console.log(`📦 Payload:`, JSON.stringify(webhookPayload, null, 2));
    
    const response = await axios({
      method: 'post',
      url: `${appUrl}/api/webhooks/orders`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BigCommerce-Webhooks/1.0'
      },
      data: webhookPayload,
      timeout: 30000
    });

    console.log(`✅ Webhook Response (${response.status}):`);
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error sending webhook:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure your development server is running:');
      console.error('   npm run dev');
    }
  }
}

console.log('Usage: node scripts/simulate-order-update.js [ORDER_ID]');
console.log('Example: node scripts/simulate-order-update.js 174\n');

simulateOrderUpdate();
