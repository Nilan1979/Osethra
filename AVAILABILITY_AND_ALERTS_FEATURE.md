# Product Availability & Low Stock Notifications Feature

## Overview
Added automatic product availability tracking and low stock notification system to the inventory management.

## Features Implemented

### 1. ✅ Automatic Availability Tracking
- **Three availability states:**
  - `in-stock`: Quantity > minimum stock level (GREEN)
  - `low-stock`: Quantity ≤ minimum stock level but > 0 (YELLOW)
  - `out-of-stock`: Quantity = 0 (RED)
  
- **Auto-calculated:** Availability updates automatically when inventory quantity changes
- **Real-time:** Calculated in pre-save middleware - no manual updates needed

### 2. ✅ Stock Threshold Configuration
Each inventory item (batch) can have:
- **Minimum Stock (minStock):** Low stock alert threshold (default: 10)
- **Reorder Point:** When to initiate reorder (default: 20)
- **Batch-specific:** Different batches can have different thresholds

### 3. ✅ Smart Reorder Recommendations
- **Auto-calculated recommended reorder quantity:**
  ```javascript
  recommendedQty = Math.max(reorderPoint * 2 - currentQuantity, minStock)
  ```
- **Example:** If reorder point = 50, current quantity = 30
  - Recommended: 50 × 2 - 30 = 70 units

### 4. ✅ Enhanced Stock Alerts API
**Endpoint:** `GET /api/inventory/alerts?type={alert-type}`

**Alert Types:**
- `low-stock` - Items at or below minimum stock level
- `out-of-stock` - Items with zero quantity
- `needs-reorder` - Items at or below reorder point
- `expiring` - Items expiring within 30 days
- `expired` - Items past expiry date

**Response includes:**
- Product details (name, SKU, category, unit)
- Current quantity and thresholds
- Stock percentage
- Recommended reorder quantity
- Days left/expired (for expiry alerts)

### 5. ✅ Frontend Enhancements
**AddInventory Form:**
- New fields: Minimum Stock Level, Reorder Point
- Real-time availability indicator chip
- Color-coded status: Green (In Stock), Yellow (Reorder Soon), Red (Low Stock)
- Low stock warnings on submission

## Database Changes

### InventoryItem Model Updates

#### New Fields:
```javascript
{
  // Stock Thresholds (batch-specific)
  minStock: {
    type: Number,
    default: 10,
    required: true,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 20,
    required: true,
    min: 0
  },
  
  // Auto-calculated Availability
  availability: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock'
  }
}
```

#### New Virtual Properties:
```javascript
{
  stockStatus: 'depleted' | 'low' | 'reorder-soon' | 'adequate',
  needsReorder: boolean,
  recommendedReorderQty: number
}
```

#### Enhanced Pre-Save Middleware:
```javascript
inventoryItemSchema.pre('save', function(next) {
  // Auto-update availability based on quantity
  if (this.quantity === 0) {
    this.availability = 'out-of-stock';
  } else if (this.quantity <= this.minStock) {
    this.availability = 'low-stock';
  } else {
    this.availability = 'in-stock';
  }
  next();
});
```

## Backend Changes

### 1. InventoryController.js - addInventoryItem
**Enhanced to:**
- Accept `minStock` and `reorderPoint` parameters
- Return availability status in response
- Include low stock alerts in response
- Log warnings for low stock items

**Response Format:**
```javascript
{
  success: true,
  message: 'Inventory item added successfully',
  data: {
    _id: '...',
    product: '...',
    quantity: 5,
    minStock: 10,
    reorderPoint: 20,
    availability: 'low-stock',
    needsReorder: true,
    recommendedReorderQty: 35
  },
  alert: {
    type: 'low-stock',
    message: 'Paracetamol is running low (5 remaining)'
  }
}
```

### 2. InventoryController.js - getStockAlerts
**Completely rewritten to:**
- Query InventoryItems instead of Products
- Use availability field for filtering
- Include product details via population
- Calculate stock percentages and reorder quantities
- Support multiple alert types
- Return comprehensive summary statistics

## Frontend Changes

### 1. AddInventory.jsx
**New Form Fields:**
- Minimum Stock Level (required, default: 10)
- Reorder Point (required, default: 20)
- Real-time status indicator chip

**Visual Indicators:**
- 🟢 **IN STOCK:** Quantity > Reorder Point
- 🟡 **REORDER SOON:** Quantity ≤ Reorder Point but > Min Stock
- 🔴 **LOW STOCK:** Quantity ≤ Min Stock

**Enhanced Submission:**
- Sends minStock and reorderPoint to backend
- Displays low stock warnings from response
- Shows warning snackbar if inventory is low after adding

### 2. Stock Alerts Component (Ready for Implementation)
**API Integration:**
```javascript
import { alertsAPI } from '../../api/inventory';

// Fetch all alerts
const alerts = await alertsAPI.getStockAlerts();

// Fetch specific type
const lowStock = await alertsAPI.getStockAlerts('low-stock');
```

**Alert Data Structure:**
```javascript
{
  success: true,
  data: {
    lowStock: [{
      productName: 'Paracetamol',
      productSKU: 'PARA-500-TAB',
      quantity: 5,
      minStock: 10,
      reorderPoint: 20,
      stockPercentage: '50.00',
      recommendedReorderQty: 35,
      batchNumber: 'BATCH001',
      expiryDate: '2025-12-31'
    }],
    outOfStock: [...],
    needsReorder: [...],
    expiringItems: [...],
    expiredItems: [...]
  },
  summary: {
    lowStockCount: 3,
    outOfStockCount: 1,
    needsReorderCount: 5,
    expiringCount: 2,
    expiredCount: 0,
    totalAlerts: 11
  }
}
```

## Usage Examples

### Example 1: Adding Inventory with Thresholds
```javascript
const inventoryData = {
  product: '507f1f77bcf86cd799439011',
  batchNumber: 'BATCH123',
  manufactureDate: '2024-01-01',
  expiryDate: '2025-12-31',
  quantity: 100,
  minStock: 15,        // Alert when ≤ 15
  reorderPoint: 30,    // Reorder when ≤ 30
  buyingPrice: 50.00,
  sellingPrice: 75.00,
  storageLocation: 'Shelf A-3',
  supplierName: 'MediSupply Co.'
};
```

### Example 2: Checking Stock Alerts
```javascript
// Get all low stock items
const response = await fetch('/api/inventory/alerts?type=low-stock');
const { data, summary } = await response.json();

console.log(`Found ${summary.lowStockCount} items with low stock`);
data.lowStock.forEach(item => {
  console.log(`${item.productName}: ${item.quantity}/${item.minStock}`);
  console.log(`Recommended reorder: ${item.recommendedReorderQty} ${item.unit}`);
});
```

### Example 3: Dashboard Alert Component
```jsx
function StockAlertsBadge() {
  const [alertCount, setAlertCount] = useState(0);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      const response = await alertsAPI.getStockAlerts();
      setAlertCount(response.summary.totalAlerts);
    };
    fetchAlerts();
  }, []);
  
  return (
    <Badge badgeContent={alertCount} color="error">
      <NotificationsIcon />
    </Badge>
  );
}
```

## Testing Checklist

### Backend Testing:
- [ ] Start/restart the server (`npm start` in server directory)
- [ ] Test adding inventory with minStock and reorderPoint
- [ ] Verify availability auto-calculation
- [ ] Test stock alerts endpoint: `/api/inventory/alerts`
- [ ] Test different alert types: low-stock, out-of-stock, needs-reorder
- [ ] Verify recommended reorder quantity calculations

### Frontend Testing:
- [ ] Navigate to "Add Inventory" page
- [ ] Fill in product details
- [ ] Enter different quantities and observe status chip:
  - Quantity > reorderPoint → GREEN "IN STOCK"
  - Quantity ≤ reorderPoint and > minStock → YELLOW "REORDER SOON"
  - Quantity ≤ minStock → RED "LOW STOCK"
- [ ] Submit with low stock quantity and verify warning message
- [ ] Add inventory item and check database for availability field

### Database Verification:
```javascript
// MongoDB query to check inventory items
db.inventoryitems.find({}, {
  product: 1,
  quantity: 1,
  minStock: 1,
  reorderPoint: 1,
  availability: 1
}).pretty()

// Find low stock items
db.inventoryitems.find({ availability: 'low-stock' })

// Find items needing reorder
db.inventoryitems.find({ $expr: { $lte: ['$quantity', '$reorderPoint'] } })
```

## Migration Notes

### For Existing Inventory Items:
If you have existing inventory items without `minStock` and `reorderPoint`:

1. **They will get default values** (minStock: 10, reorderPoint: 20)
2. **Availability will be calculated** on next save
3. **To bulk update existing items:**
   ```javascript
   // Run in MongoDB shell
   db.inventoryitems.updateMany(
     { minStock: { $exists: false } },
     { 
       $set: { 
         minStock: 10,
         reorderPoint: 20
       }
     }
   )
   ```

## API Endpoints Summary

| Method | Endpoint | Purpose | Query Params |
|--------|----------|---------|--------------|
| POST | `/api/inventory/items` | Add inventory with thresholds | - |
| GET | `/api/inventory/alerts` | Get stock alerts | `type`: low-stock, out-of-stock, needs-reorder, expiring, expired |

## Benefits

1. **Proactive Stock Management:**
   - Never run out of critical medications
   - Automatic alerts before stockouts occur
   - Smart reorder recommendations

2. **Batch-Level Precision:**
   - Different batches can have different thresholds
   - Track expiry and stock levels together
   - Better inventory optimization

3. **Real-Time Visibility:**
   - Instant availability status
   - Auto-updating alerts
   - No manual status management needed

4. **Cost Optimization:**
   - Prevent overstocking
   - Reduce emergency orders
   - Optimize reorder timing

## Next Steps

1. **Create Stock Alerts Dashboard Widget:**
   - Display alert counts by type
   - Show critical items list
   - Link to detailed alerts view

2. **Email/SMS Notifications:**
   - Configure alert thresholds
   - Send notifications to pharmacist
   - Daily/weekly summary reports

3. **Purchase Order Integration:**
   - Generate PO from reorder recommendations
   - Track pending orders
   - Auto-update upon receipt

4. **Analytics & Reporting:**
   - Stock movement trends
   - Alert history
   - Reorder frequency analysis

## Date Implemented
October 14, 2025

## Related Files Modified
- ✅ `server/Model/InventoryItemModel.js`
- ✅ `server/Controllers/InventoryController.js`
- ✅ `client/src/pages/inventory/AddInventory.jsx`

## Related Documentation
- `BACKEND_CONTROLLER_COMPLETE_FIX.md` - Controller updates
- `API_RESPONSE_FIX.md` - Frontend API handling
- `SAMPLE_PRODUCTS_ADDED.md` - Sample product data
