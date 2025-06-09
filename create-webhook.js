/* eslint-disable no-console */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import axios from 'axios';

// Neon serverless connection
const sql = neon(process.env.POSTGRES_URL);

// Function to get store credentials from database
async function getStoreCredentials() {
  try {
    // Get the first store from the database (for single-store setups)
    // For multi-store, you could pass a specific store hash as a parameter
    const stores = await sql`SELECT store_hash, access_token FROM stores LIMIT 1`;

    if (stores.length === 0) {
      throw new Error('No stores found in database. Please install the app on a store first.');
    }

    const { store_hash, access_token } = stores[0];

    if (!access_token) {
      throw new Error('No access token found for store. Please reinstall the app.');
    }

    return { storeHash: store_hash, accessToken: access_token };
  } catch (error) {
    console.error('❌ Error getting store credentials:', error.message);
    throw error;
  }
}

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
