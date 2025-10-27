/* eslint-disable no-console */
import 'dotenv/config';
import axios from 'axios';

async function fetchOrders() {
  const storeHash = '7wt5mizwwn';
  
  // You'll need to provide the access token for this specific store
  // This should be retrieved from your database or environment variables
  const accessToken = 'eg689reagabbe3yql32w16jqxnpzvi2';

  if (!accessToken) {
    console.error('❌ Please set ACCESS_TOKEN_MR060SPPQ6 in your .env file');
    console.error('   You can find this token in your database or BigCommerce app dashboard');
    process.exit(1);
  }

  try {
    console.log(`🔍 Fetching orders from store: ${storeHash}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Fetch recent orders using V2 API (which has more detailed timestamp info)
    const response = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      },
      params: {
        limit: 10,
        sort: 'date_created:desc' // Get most recent orders first
      }
    });

    const orders = response.data;
    
    if (orders.length === 0) {
      console.log('📭 No orders found in this store');
      return;
    }

    console.log(`📋 Found ${orders.length} recent orders:\n`);

    orders.forEach((order, index) => {
      const dateCreated = new Date(order.date_created);
      const dateModified = new Date(order.date_modified);
      const timeDiffSeconds = Math.abs(dateModified.getTime() - dateCreated.getTime()) / 1000;
      
      // Apply the same logic as the webhook
      const wouldBeConsideredNew = timeDiffSeconds <= 30;
      
      console.log(`${index + 1}. Order #${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created:  ${dateCreated.toISOString()}`);
      console.log(`   Modified: ${dateModified.toISOString()}`);
      console.log(`   Diff: ${timeDiffSeconds.toFixed(2)} seconds`);
      console.log(`   Would be classified as: ${wouldBeConsideredNew ? '🆕 NEW ORDER' : '📝 ORDER UPDATE'}`);
      console.log(`   Total: $${order.total_inc_tax}`);
      console.log(`   Items: ${order.items_total}`);
      console.log('   ─────────────────────────────────────────────────────────────────────────────');
    });

    // Analysis
    const newOrders = orders.filter(order => {
      const dateCreated = new Date(order.date_created);
      const dateModified = new Date(order.date_modified);
      const timeDiffSeconds = Math.abs(dateModified.getTime() - dateCreated.getTime()) / 1000;
      return timeDiffSeconds <= 30;
    });

    console.log(`\n📊 ANALYSIS:`);
    console.log(`   • Total orders analyzed: ${orders.length}`);
    console.log(`   • Would be classified as NEW: ${newOrders.length}`);
    console.log(`   • Would be classified as UPDATES: ${orders.length - newOrders.length}`);
    console.log(`   • 30-second threshold seems: ${newOrders.length === orders.length ? '✅ Appropriate (all new)' : '⚠️  May need adjustment'}`);

  } catch (error) {
    console.error('❌ Error fetching orders:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    
    if (error.response?.status === 401) {
      console.error('\n💡 This likely means:');
      console.error('   1. The access token is invalid or expired');
      console.error('   2. The store hash is incorrect');
      console.error('   3. The app doesn\'t have permission to read orders');
    }
  }
}

// Also create a function to fetch a specific order and its products
async function fetchOrderDetails(orderId) {
  const storeHash = '7wt5mizwwn';
  const accessToken = 'eg689reagabbe3yql32w16jqxnpzvi2';

  if (!accessToken) {
    console.error('❌ Please set ACCESS_TOKEN_MR060SPPQ6 in your .env file');
    return;
  }

  try {
    console.log(`🔍 Fetching details for order #${orderId}`);
    
    // Fetch order details
    const orderResponse = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      }
    });

    // Fetch order products
    const productsResponse = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}/products`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      }
    });

    const order = orderResponse.data;
    const products = productsResponse.data;

    console.log(`\n📋 Order #${order.id} Details:`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Created:  ${order.date_created}`);
    console.log(`   Modified: ${order.date_modified}`);
    console.log(`   Total: $${order.total_inc_tax}`);
    
    console.log(`\n📦 Order Items (${products.length}):`);
    products.forEach((item, index) => {
      console.log(`   ${index + 1}. Product ID: ${item.product_id}`);
      console.log(`      ${item.variant_id ? `Variant ID: ${item.variant_id}` : 'No variant'}`);
      console.log(`      Name: ${item.name}`);
      console.log(`      Quantity: ${item.quantity}`);
      console.log(`      Price: $${item.price_inc_tax}`);
    });

  } catch (error) {
    console.error(`❌ Error fetching order #${orderId}:`, error.response?.data || error.message);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const orderId = args[0];
  fetchOrderDetails(orderId);
} else {
  fetchOrders();
}
