/* eslint-disable no-console */
import 'dotenv/config';
import axios from 'axios';
import { getStoreCredentials } from './db.js';

async function createWebhook() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    console.error('Please ensure APP_URL is set in .env file');
    process.exit(1);
  }

  try {
    // Get store credentials from database
    const { storeHash, accessToken } = await getStoreCredentials();

    console.log(`Creating webhook for store: ${storeHash}`);

    const response = await axios({
      method: 'post',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v3/hooks`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Auth-Token': accessToken
      },
      data: {
        scope: 'store/order/created',
        destination: `${appUrl}/api/webhooks/orders`,
        is_active: true
      }
    });

    console.log('✅ Webhook created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.message.includes('No stores found')) {
      console.error('❌ No stores found in database.');
      console.error('Please install the app on a BigCommerce store first, then run this script.');
    } else {
      console.error('❌ Error creating webhook:');
      console.error(error.response?.data || error.message);
    }
  }
}

createWebhook();
