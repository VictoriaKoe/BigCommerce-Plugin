const { neon } = require('@neondatabase/serverless');
const axios = require('axios');
require('dotenv').config();

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
    console.error('[DB] ❌ Error getting store credentials:', error.message);
    throw error;
  }
}

// Function to create BigCommerce API client
function createBigCommerceClient(storeHash, accessToken) {
  return axios.create({
    baseURL: `https://api.bigcommerce.com/stores/${storeHash}/v3`,
    headers: {
      'X-Auth-Token': accessToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

async function createTables() {
  console.log('[DB] 🔄 Creating PostgreSQL tables...');
  
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      email TEXT NOT NULL,
      username TEXT
    );
  `;

  // Create stores table
  await sql`
    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      store_hash VARCHAR(10) NOT NULL UNIQUE,
      access_token TEXT,
      scope TEXT
    );
  `;

  // Create store_users table
  await sql`
    CREATE TABLE IF NOT EXISTS store_users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      store_hash VARCHAR(10) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      UNIQUE(user_id, store_hash)
    );
  `;

  // Create products table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      stock INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL
    );
  `;

  // Create bundles table
  await sql`
    CREATE TABLE IF NOT EXISTS bundles (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL UNIQUE,
      is_bundle BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  // Create bundle_links table
  await sql`
    CREATE TABLE IF NOT EXISTS bundle_links (
      id SERIAL PRIMARY KEY,
      bundle_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      FOREIGN KEY (bundle_id) REFERENCES bundles(product_id) ON DELETE CASCADE
    );
  `;

  console.log('[DB] ✅ PostgreSQL tables created or already exist.');
}

async function syncProductsFromBigCommerce() {
  console.log('[DB] 🔄 Syncing products from BigCommerce...');

  try {
    // Get store credentials from database
    const { storeHash, accessToken } = await getStoreCredentials();
    const bigcommerce = createBigCommerceClient(storeHash, accessToken);
    
    const { data } = await bigcommerce.get('/catalog/products?limit=250');

    for (const p of data.data) {
      if (!p.sku) continue;

      const sku = p.sku;
      const name = p.name;
      const stock = p.inventory_level || 0;
      const price = p.price || 0.00;

      await sql`
        INSERT INTO products (sku, name, stock, price)
        VALUES (${sku}, ${name}, ${stock}, ${price})
        ON CONFLICT (sku) 
        DO UPDATE SET
          name = EXCLUDED.name,
          stock = EXCLUDED.stock,
          price = EXCLUDED.price;
      `;
    }

    console.log(`[DB] ✅ Synced ${data.data.length} products from BigCommerce.`);
  } catch (error) {
    if (error.message.includes('No stores found')) {
      console.log('[DB] ℹ️  No stores found in database yet. Product sync will be skipped.');
      console.log('[DB] ℹ️  Install the app on a store first, then run this script again to sync products.');
    } else {
      console.error('[DB] ❌ Error syncing products:', error.response?.data || error.message);
    }
  }  
}

(async () => {
  try {
    await createTables();
    await syncProductsFromBigCommerce();
  } catch (err) {
    console.error('[DB] ❌ Error:', err.message);
  }
})();
