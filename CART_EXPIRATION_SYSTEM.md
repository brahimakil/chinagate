# Cart Expiration System - Documentation

## Overview
This system automatically clears abandoned cart items after 20 minutes and restores the reserved stock to prevent inventory lockup.

## How It Works

### 1. **When User Adds to Cart**
- Stock is **immediately reduced** from the product
- Cart item is created with `expiresAt` timestamp (20 minutes from now)
- User has 20 minutes to complete purchase

### 2. **When User Updates Cart Quantity**
- Stock is adjusted accordingly (reduced if increased, restored if decreased)
- `expiresAt` timer is **reset to 20 minutes** from now

### 3. **When User Manually Removes from Cart**
- Stock is **immediately restored** to the product
- Cart item is deleted

### 4. **When Cart Expires (20 minutes)**
- Background cleanup job runs every 5 minutes
- Finds all expired cart items
- **Restores stock** for each expired item
- Removes cart item from user's cart array
- Deletes expired cart items
- Logs cleanup activity

### 5. **When User Completes Purchase**
- Cart items are deleted **WITHOUT restoring stock** (already reserved)
- Order is created
- Stock remains reduced (purchased)

## Technical Implementation

### Files Modified

#### `server/models/cart.model.js`
- TTL index on `expiresAt` field (20 minutes)
- Pre-delete hook to restore stock on manual deletion
- Background cleanup job (`cleanupExpiredCarts`)
- Runs every 5 minutes
- Also runs 5 seconds after server startup

#### `server/services/cart.service.js`
- **addToCart**: Reduces stock immediately, sets 20-minute expiration
- **updateCart**: Adjusts stock based on quantity change, resets expiration timer
- **deleteCart**: Restores stock when user manually removes item

#### `server/services/order.service.js`
- **createOrder**: Uses `deleteOne()` to bypass pre-delete hook
- Prevents stock restoration during purchase completion

#### `server/services/product.service.js`
- **updateProduct**: Stock updates now use increment/decrement logic

## Stock Flow Examples

### Example 1: Abandoned Cart
```
Time 0:00  - User adds 5 units → Product stock: 100 → 95
Time 20:01 - Cart expires → Stock restored: 95 → 100 ✅
```

### Example 2: User Updates Cart
```
Time 0:00  - User adds 5 units → Stock: 100 → 95
Time 10:00 - User adds 3 more → Stock: 95 → 92
Time 10:00 - Timer resets to 20 minutes (expires at 30:00)
Time 30:01 - Cart expires → Stock restored: 92 → 100 ✅
```

### Example 3: User Purchases
```
Time 0:00  - User adds 5 units → Stock: 100 → 95
Time 5:00  - User completes order → Stock: 95 (stays reduced) ✅
           - Cart deleted (no restoration)
```

### Example 4: User Removes Item
```
Time 0:00  - User adds 5 units → Stock: 100 → 95
Time 5:00  - User removes item → Stock restored: 95 → 100 ✅
```

## Benefits

1. ✅ **Prevents inventory lockup** - Stock isn't held indefinitely
2. ✅ **Fair for all customers** - Abandoned items become available again
3. ✅ **Automatic cleanup** - No manual intervention needed
4. ✅ **Real-time updates** - Stock changes reflect immediately
5. ✅ **Accurate inventory** - Always shows current availability

## Monitoring

The system logs all cleanup activities:
- `🧹 Cleaning up X expired cart items...`
- `✅ Restored X units to product [ID]`
- `✅ Cleanup complete: X items processed`
- `❌ Error during cart cleanup: [error]`

## Configuration

To change the expiration time, update these values:

**Cart Model** (`server/models/cart.model.js`):
```javascript
default: () => new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
```

**Cart Service** (`server/services/cart.service.js`):
```javascript
expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
```

**Cleanup Frequency** (`server/models/cart.model.js`):
```javascript
setInterval(cleanupExpiredCarts, 5 * 60 * 1000); // Every 5 minutes
```

## Important Notes

⚠️ **Stock is reserved when added to cart**, not when order is placed
⚠️ **Timer resets** on any cart quantity update
⚠️ **Cleanup runs every 5 minutes**, not exactly at 20 minutes
⚠️ **Manual deletion** always restores stock immediately
⚠️ **Purchase completion** never restores stock

---

**Last Updated**: January 2024
**Version**: 2.0

