#!/usr/bin/env node
/* eslint-disable no-console */
import 'dotenv/config';
import axios from 'axios';
import { getStoreCredentials } from './db.js';

// Sample order data for testing
const sampleOrderData = {
  status_id: 1, // Pending
  customer_id: 0, // Guest customer
  date_created: new Date().toISOString(),
  subtotal_ex_tax: "79.98",
  subtotal_inc_tax: "79.98",
  subtotal_tax: "0.0000",
  total_ex_tax: "79.98",
  total_inc_tax: "79.98",
  total_tax: "0.0000",
  items_total: 2,
  items_shipped: 0,
  payment_method: "Manual",
  payment_status: "pending",
  currency_code: "USD",
  
  // Billing address
  billing_address: {
    first_name: "John",
    last_name: "Doe",
    company: "",
    street_1: "123 Test Street",
    street_2: "",
    city: "Test City",
    state: "California",
    zip: "90210",
    country: "United States",
    country_iso2: "US",
    phone: "",
    email: "test@example.com"
  },

  // Order products - these will be added separately
  products: [
    {
      product_id: 173, // Change this to an actual product ID from your store
      quantity: 1,
      price_inc_tax: 39.99,
      price_ex_tax: 39.99
    },
    {
      product_id: 174, // Change this to another product ID from your store
      quantity: 1,
      price_inc_tax: 39.99,
      price_ex_tax: 39.99
    }
  ]
};

async function createTestOrder(customProductIds = null) {
  try {
    console.log('🔄 Getting store credentials...');
    const { storeHash, accessToken } = await getStoreCredentials();
    
    console.log(`🏪 Creating test order for store: ${storeHash}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // If custom product IDs provided, use them
    let orderData = { ...sampleOrderData };
    if (customProductIds && customProductIds.length > 0) {
      orderData.products = customProductIds.map((id, index) => ({
        product_id: parseInt(id),
        quantity: 1,
        price_inc_tax: 39.99 + (index * 10), // Vary prices slightly
        price_ex_tax: 39.99 + (index * 10)
      }));
      
      // Update totals
      const total = orderData.products.reduce((sum, p) => sum + p.price_inc_tax, 0);
      orderData.subtotal_ex_tax = total.toFixed(2);
      orderData.subtotal_inc_tax = total.toFixed(2);
      orderData.total_ex_tax = total.toFixed(2);
      orderData.total_inc_tax = total.toFixed(2);
      orderData.items_total = orderData.products.length;
    }

    // First get available products from the store to use real product IDs
    console.log('📦 Fetching available products...');
    const productsResponse = await axios({
      method: 'get',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products`,
      headers: {
        'X-Auth-Token': accessToken,
        'Accept': 'application/json'
      },
      params: {
        limit: 5,
        is_visible: true
      }
    });

    const availableProducts = productsResponse.data.data;
    
    if (availableProducts.length === 0) {
      console.error('❌ No products found in store. Please add some products first.');
      return;
    }

    console.log(`📋 Found ${availableProducts.length} available products:`);
    availableProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ID: ${p.id} - ${p.name} ($${p.price})`);
    });

    // Use the first 2 available products if no custom IDs provided
    if (!customProductIds) {
      orderData.products = availableProducts.slice(0, 2).map((product, index) => ({
        product_id: product.id,
        quantity: 1,
        price_inc_tax: product.price,
        price_ex_tax: product.price
      }));
      
      // Update totals based on actual product prices
      const total = orderData.products.reduce((sum, p) => sum + p.price_inc_tax, 0);
      orderData.subtotal_ex_tax = total.toFixed(2);
      orderData.subtotal_inc_tax = total.toFixed(2);
      orderData.total_ex_tax = total.toFixed(2);
      orderData.total_inc_tax = total.toFixed(2);
      orderData.items_total = orderData.products.length;
    }

    console.log('\n📝 Creating order with products:');
    orderData.products.forEach((p, i) => {
      const productName = availableProducts.find(ap => ap.id === p.product_id)?.name || 'Unknown';
      console.log(`   ${i + 1}. Product ${p.product_id} (${productName}) x${p.quantity} - $${p.price_inc_tax}`);
    });

    // Create the order using V2 API (V3 doesn't support order creation)
    const orderResponse = await axios({
      method: 'post',
      url: `https://api.bigcommerce.com/stores/${storeHash}/v2/orders`,
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: orderData
    });

    const createdOrder = orderResponse.data;
    
    console.log('\n✅ Order created successfully!');
    console.log(`   Order ID: ${createdOrder.id}`);
    console.log(`   Status: ${createdOrder.status}`);
    console.log(`   Total: $${createdOrder.total_inc_tax}`);
    console.log(`   Created: ${createdOrder.date_created}`);
    console.log(`   Modified: ${createdOrder.date_modified}`);
    
    // Calculate time difference to see if it would be considered "new"
    const createdTime = new Date(createdOrder.date_created);
    const modifiedTime = new Date(createdOrder.date_modified);
    const timeDiffSeconds = Math.abs(modifiedTime.getTime() - createdTime.getTime()) / 1000;
    
    console.log(`   Time difference: ${timeDiffSeconds} seconds`);
    console.log(`   Would be classified as: ${timeDiffSeconds <= 10 ? '🆕 NEW ORDER' : '📝 ORDER UPDATE'}`);

    console.log('\n🎯 This should trigger your order webhook!');
    console.log(`   Check your webhook logs for order ID: ${createdOrder.id}`);

    return createdOrder;

  } catch (error) {
    console.error('❌ Error creating test order:');
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
      console.error('   3. The app doesn\'t have permission to create orders');
    } else if (error.response?.status === 422) {
      console.error('\n💡 Validation error - check that:');
      console.error('   1. Product IDs exist in your store');
      console.error('   2. All required fields are provided');
      console.error('   3. Price and quantity values are valid');
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let productIds = null;

if (args.length > 0) {
  productIds = args[0].split(',').map(id => id.trim());
  console.log(`🎯 Using custom product IDs: ${productIds.join(', ')}`);
}

// Run the script
createTestOrder(productIds);
