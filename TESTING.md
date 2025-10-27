# Order Update Testing Guide

## 🎯 Testing the New Bundle Inventory Logic

### Pre-Testing Setup

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Check Test Environment**
   ```bash
   node scripts/test-order-updates.js
   ```

3. **Monitor Logs**
   - Keep terminal open with dev server
   - Watch for `[Order Webhook]` messages

---

## 🧪 Test Scenarios

### Test 1: Manual Order Update (Recommended)

**Setup:**
- Order #174 has 3 items worth $937.20
- Contains bundle products (oak chess set)

**Steps:**
1. Go to BigCommerce Admin → Orders
2. Find Order #174 (or another Awaiting Fulfillment order)
3. Click "Edit Order"
4. Make a small change (quantity 3 → 4 for one item)
5. Save the order
6. Check development server logs

**Expected Logs:**
```
[Order Webhook] Processing order update: 174
[Order Webhook] Retrieved history for order 174 (X items)
[Order Webhook] Calculated X deltas:
  MODIFIED: oak chess set (3 → 4)
[Order Webhook] Will deduct 1 from component_product:variant
[Order Webhook] Updated variant X:Y inventory: 194 → 193
```

### Test 2: Simulate Webhook Call

```bash
# Test Order #174
node scripts/simulate-order-update.js 174

# Test Order #173 (the one that was actually updated)
node scripts/simulate-order-update.js 173
```

### Test 3: Database Verification

Check that order history is being stored:

```bash
# Connect to your database and run:
SELECT order_id, store_hash, created_at, 
       jsonb_pretty(order_items) as items
FROM order_history 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔍 What to Verify

### ✅ New Order Processing
- [ ] Order history gets stored
- [ ] Bundle components get deducted correctly
- [ ] Logs show "Processing new order"

### ✅ Order Update Processing  
- [ ] Previous order history retrieved
- [ ] Delta calculation works correctly
- [ ] Only changed quantities processed
- [ ] Bundle components adjusted by delta amount
- [ ] New order snapshot stored

### ✅ Bundle Inventory Logic
- [ ] Quantity increase → deduct more component stock
- [ ] Quantity decrease → restore component stock  
- [ ] Item removal → restore all component stock
- [ ] Item addition → deduct component stock

### ✅ Error Handling
- [ ] Missing order history falls back gracefully
- [ ] Invalid products don't crash system
- [ ] Webhook loops prevented with X-Bundle-App-Update header

---

## 🚨 Common Issues to Watch For

### Issue 1: Missing Order History
**Symptom:** "No previous history found for order X"
**Solution:** This is normal for the first update. The system will fall back to recalculation-only mode.

### Issue 2: Double Deduction
**Symptom:** Component inventory decreases by 2x expected amount
**Solution:** Check that BigCommerce isn't also processing the same inventory change

### Issue 3: Webhook Loops
**Symptom:** Infinite webhook calls
**Solution:** Verify X-Bundle-App-Update header is being sent

### Issue 4: Database Errors
**Symptom:** "relation 'order_history' does not exist"
**Solution:** Run `node scripts/db.js` to create missing tables

---

## 📊 Test Results Template

| Test Case | Order ID | Action | Expected Result | Actual Result | ✅/❌ |
|-----------|----------|--------|----------------|---------------|-------|
| New Order | 175 | Create order with bundle | Components deducted | | |
| Qty Increase | 174 | 3→4 chess sets | 1 more component deducted | | |
| Qty Decrease | 174 | 4→2 chess sets | 2 components restored | | |
| Item Removal | 174 | Remove chess set | All components restored | | |
| Item Addition | 174 | Add new bundle | Components deducted | | |

---

## 🎯 Success Criteria

✅ **Order updates accurately track component inventory changes**  
✅ **No double deductions or missed adjustments**  
✅ **Order history stored and retrieved correctly**  
✅ **Fallback logic works when history missing**  
✅ **Performance acceptable (<5 seconds per update)**  

---

## 🔧 Debugging Commands

```bash
# Check recent webhook activity
tail -f your-app.log | grep "Order Webhook"

# Verify order history
node -e "
const { getOrderHistory } = require('./lib/order-history.ts');
getOrderHistory(174, '7wt5mizwwn').then(console.log);
"

# Check bundle products
node scripts/test-order-updates.js

# Simulate specific order update
node scripts/simulate-order-update.js 174
```
