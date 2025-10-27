/* eslint-disable no-console */
import 'dotenv/config';
import axios from 'axios';
import { getStoreCredentials } from './db.js';

async function testOrderUpdates() {
  try {
    const { storeHash, accessToken } = await getStoreCredentials();
    
    console.log('🧪 Testing Order Update Logic');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Check recent orders for testing candidates
    console.log('\n📋 Step 1: Finding orders suitable for testing...');
    
    const ordersResponse = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      },
      params: {
        limit: 10,
        sort: 'date_created:desc'
      }
    });
    
    const orders = ordersResponse.data;
    const testableOrders = orders.filter(order => 
      order.status === 'Pending' || 
      order.status === 'Awaiting Fulfillment' ||
      order.status === 'Incomplete'
    );
    
    console.log(`Found ${testableOrders.length} orders that can be safely updated for testing:`);
    testableOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order #${order.id} - Status: ${order.status} - Items: ${order.items_total} - Total: $${order.total_inc_tax}`);
    });
    
    if (testableOrders.length === 0) {
      console.log('\n❌ No suitable test orders found. Create a new test order first.');
      return;
    }
    
    // 2. Check for bundle products to test with
    console.log('\n📋 Step 2: Checking for bundle products...');
    
    const { data: categories } = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/categories?limit=250`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      }
    });
    
    const bundleCategory = categories.data.find(c => String(c?.name || '').toLowerCase() === 'bundle');
    
    if (!bundleCategory) {
      console.log('❌ No bundle category found. Please create some bundle products first.');
      return;
    }
    
    const { data: bundleProducts } = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products?categories:in=${bundleCategory.id}`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      }
    });
    
    console.log(`Found ${bundleProducts.data.length} products in bundle category:`);
    bundleProducts.data.forEach((product, index) => {
      console.log(`   ${index + 1}. Product #${product.id} - ${product.name} - Stock: ${product.inventory_level}`);
    });
    
    // 3. Testing instructions
    console.log('\n🎯 Step 3: Testing Instructions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Manual Testing Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to BigCommerce admin → Orders');
    console.log(`3. Edit Order #${testableOrders[0]?.id} (or any pending order)`);
    console.log('4. Change quantities, add/remove items, especially bundles');
    console.log('5. Save the order');
    console.log('6. Check your server logs for "[Order Webhook]" messages');
    console.log('7. Verify component inventory levels changed correctly');
    
    console.log('\n🔍 What to Look For in Logs:');
    console.log('- "Processing order update - calculating deltas"');
    console.log('- "Retrieved history for order X"');
    console.log('- "Calculated X deltas: ADDED/MODIFIED/REMOVED"');
    console.log('- "Will deduct/restore X from component:variant"');
    console.log('- "Updated product/variant X inventory: Y → Z"');
    
    console.log('\n⚠️  Important Notes:');
    console.log('- Only test with orders in Pending/Awaiting Fulfillment status');
    console.log('- Make small changes first (quantity 1→2) to verify logic');
    console.log('- Check component inventory levels before/after changes');
    console.log('- Each order update should store new snapshot in order_history table');
    
  } catch (error) {
    console.error('❌ Error during testing setup:', error.response?.data || error.message);
  }
}

testOrderUpdates();
