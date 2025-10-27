# BigCommerce API Curl Commands

## Prerequisites
First, you need your store credentials. Get them from your database:

```bash
# Run this to get your store hash and access token
node scripts/db.js
```

Or check your `.env` file for:
- `STORE_HASH` 
- `ACCESS_TOKEN`

## 1. Get Recent Orders

```bash
# Replace YOUR_STORE_HASH and YOUR_ACCESS_TOKEN with actual values
curl -X GET \
  "https://api.bigcommerce.com/stores/YOUR_STORE_HASH/v2/orders?limit=10&sort=date_created:desc" \
  -H "X-Auth-Token: YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

### Example with real values (replace with yours):
```bash
curl -X GET \
  "https://api.bigcommerce.com/stores/7wt5mizwwn/v2/orders?limit=10&sort=date_created:desc" \
  -H "X-Auth-Token: your_token_here" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

## 2. Get Specific Order Details

```bash
# Get order details
curl -X GET \
  "https://api.bigcommerce.com/stores/YOUR_STORE_HASH/v2/orders/ORDER_ID" \
  -H "X-Auth-Token: YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"

# Get order products
curl -X GET \
  "https://api.bigcommerce.com/stores/YOUR_STORE_HASH/v2/orders/ORDER_ID/products" \
  -H "X-Auth-Token: YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

## 3. Get Available Products (to know what IDs to use)

```bash
curl -X GET \
  "https://api.bigcommerce.com/stores/YOUR_STORE_HASH/v3/catalog/products?limit=10&is_visible=true" \
  -H "X-Auth-Token: YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

## 4. Create a Test Order

```bash
curl -X POST \
  "https://api.bigcommerce.com/stores/YOUR_STORE_HASH/v2/orders" \
  -H "X-Auth-Token: YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "status_id": 1,
    "customer_id": 0,
    "date_created": "2025-09-29T03:00:00.000Z",
    "subtotal_ex_tax": "79.98",
    "subtotal_inc_tax": "79.98", 
    "subtotal_tax": "0.0000",
    "total_ex_tax": "79.98",
    "total_inc_tax": "79.98",
    "total_tax": "0.0000",
    "items_total": 2,
    "payment_method": "Manual",
    "payment_status": "pending",
    "currency_code": "USD",
    "billing_address": {
      "first_name": "John",
      "last_name": "Doe",
      "street_1": "123 Test Street",
      "city": "Test City",
      "state": "California", 
      "zip": "90210",
      "country": "United States",
      "country_iso2": "US",
      "email": "test@example.com"
    },
    "products": [
      {
        "product_id": 173,
        "quantity": 1,
        "price_inc_tax": 39.99,
        "price_ex_tax": 39.99
      },
      {
        "product_id": 174,
        "quantity": 1, 
        "price_inc_tax": 39.99,
        "price_ex_tax": 39.99
      }
    ]
  }'
```

## 5. Easier Commands - Use the Scripts

Instead of curl, you can use the scripts I created:

```bash
# Get recent orders with analysis
node scripts/fetch-orders.js

# Get specific order details  
node scripts/fetch-orders.js ORDER_ID

# Create a test order (uses real product IDs from your store)
node scripts/create-test-order.js

# Create order with specific product IDs
node scripts/create-test-order.js "173,174,175"
```

## Order Structure

When you fetch orders, you'll see this structure:

```json
{
  "id": 173,
  "status": "Pending", 
  "date_created": "Mon, 29 Sep 2025 02:56:54 +0000",
  "date_modified": "Mon, 29 Sep 2025 02:56:55 +0000",
  "customer_id": 0,
  "subtotal_ex_tax": "79.98",
  "subtotal_inc_tax": "79.98",
  "total_inc_tax": "79.98",
  "total_tax": "0.0000", 
  "items_total": 2,
  "payment_status": "pending",
  "currency_code": "USD",
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "street_1": "123 Test Street",
    "city": "Test City",
    "state": "California",
    "zip": "90210",
    "country": "United States",
    "email": "test@example.com"
  }
}
```

And order products:

```json
[
  {
    "id": 123,
    "order_id": 173,
    "product_id": 173,
    "variant_id": 0,
    "name": "Product Name",
    "quantity": 1,
    "price_inc_tax": 39.99,
    "price_ex_tax": 39.99
  }
]
```
