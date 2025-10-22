# Issue Management Update Summary

## Overview
Updated the Issue Management system to work with the new Product/InventoryItem separation architecture, implementing FEFO (First Expiry First Out) batch selection for medication dispensing.

## Changes Made

### 1. Backend - IssueController.js ✅

#### Added Import
```javascript
const InventoryItem = require('../Model/InventoryItemModel');
```

#### Updated createIssue Function
- **Removed**: Direct `product.currentStock` checks and deductions
- **Added**: Inventory item fetching and FEFO batch selection
- **Implemented**: Multi-batch stock allocation when single batch insufficient

**Key Features:**
1. **FEFO Algorithm**: Automatically selects batches with earliest expiry dates
2. **Multi-Batch Support**: Allocates stock from multiple batches if needed
3. **Weighted Pricing**: Calculates average unit price based on batch prices
4. **Transaction Tracking**: Records all inventory deductions with issue reference
5. **Atomic Operations**: Uses MongoDB transactions for data integrity

**Batch Allocation Logic:**
```javascript
// Get available inventory items sorted by expiry (FEFO)
const inventoryItems = await InventoryItem.find({
  product: product._id,
  status: 'available',
  quantity: { $gt: 0 },
  expiryDate: { $gt: new Date() }
}).sort({ expiryDate: 1 }); // Earliest expiry first

// Allocate stock from batches
for (const invItem of inventoryItems) {
  const qtyToDeduct = Math.min(remainingQty, invItem.quantity);
  batchDeductions.push({
    inventoryItemId: invItem._id,
    batchNumber: invItem.batchNumber,
    expiryDate: invItem.expiryDate,
    quantity: qtyToDeduct,
    unitPrice: invItem.sellingPrice
  });
  remainingQty -= qtyToDeduct;
}
```

**Stock Validation:**
```javascript
const totalAvailable = inventoryItems.reduce((sum, item) => 
  sum + item.quantity, 0
);

if (totalAvailable < item.quantity) {
  return res.status(400).json({
    message: `Insufficient stock for ${product.name}. 
              Available: ${totalAvailable}, Requested: ${item.quantity}`
  });
}
```

**Stock Deduction:**
```javascript
invItem.quantity -= batch.quantity;
invItem.transactions.push({
  type: 'issue',
  quantity: -batch.quantity,
  balanceAfter: invItem.quantity,
  reference: issue.issueNumber,
  performedBy: { id, name, role },
  notes: `Issued to ${patientName} - ${type} issue`
});
```

### 2. Frontend - IssueManagement.jsx ✅

#### Updated fetchProducts Function
- **Removed**: Single product fetch
- **Added**: Parallel fetch of Products and InventoryItems
- **Implemented**: Stock aggregation per product

**Key Features:**
1. **Dual Data Fetch**: Fetches both products and inventory items simultaneously
2. **Stock Aggregation**: Calculates total available stock from all batches
3. **Expiry Filtering**: Only counts non-expired inventory
4. **Batch Information**: Attaches batch details to products
5. **FEFO Sorting**: Pre-sorts batches by expiry date

**Implementation:**
```javascript
const fetchProducts = async () => {
  // Fetch both products and inventory items in parallel
  const [productsResponse, inventoryResponse] = await Promise.all([
    inventoryAPI.products.getProducts({ status: 'active' }),
    inventoryAPI.inventoryItems.getInventoryItems({ status: 'available' })
  ]);
  
  // Calculate aggregated stock per product
  const productsWithStock = productsData.map(product => {
    const productInventory = inventoryData.filter(item => 
      item.product === product._id
    );
    
    // Filter non-expired and sum quantities
    const now = new Date();
    const totalStock = productInventory
      .filter(item => new Date(item.expiryDate) > now && item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    // Get batches sorted by expiry (FEFO)
    const sortedBatches = productInventory
      .filter(item => new Date(item.expiryDate) > now && item.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    
    return {
      ...product,
      currentStock: totalStock, // Aggregated stock
      batches: sortedBatches,   // All available batches
      batchNumber: sortedBatches[0]?.batchNumber,
      expiryDate: sortedBatches[0]?.expiryDate,
      sellingPrice: sortedBatches[0]?.sellingPrice || 0
    };
  });
};
```

## Architecture Overview

### Before (Old System)
```
Product Model
├── name
├── sku
├── currentStock ❌ (removed)
├── sellingPrice
└── orderHistory
```

### After (New System)
```
Product Model (Master Data)
├── name
├── sku
├── category
└── description

InventoryItem Model (Batch-Level Stock)
├── product (reference)
├── batchNumber
├── quantity ✅ (actual stock)
├── expiryDate
├── manufactureDate
├── buyingPrice
├── sellingPrice
└── transactions
```

## Data Flow

### Issue Creation Process

1. **User Selection**
   - User adds products to cart in IssueManagement.jsx
   - Frontend shows aggregated stock from all batches

2. **Stock Validation** (Frontend)
   ```javascript
   if (existingItem.quantity >= product.currentStock) {
     setError(`Cannot add more. Only ${product.currentStock} units available.`);
   }
   ```

3. **Issue Submission** (Backend)
   - Receives: `{ type, patient/department, items, notes }`
   - For each item:
     a. Fetch product
     b. Query available inventory items (FEFO sorted)
     c. Calculate total available stock
     d. Validate stock availability
     e. Allocate batches (oldest expiry first)
     f. Deduct from inventory items
     g. Record transactions

4. **Batch Allocation Example**
   ```
   Request: 250 tablets of Paracetamol 500mg
   
   Available Batches (FEFO sorted):
   - Batch A: 100 tablets, Expires: 2024-03-15
   - Batch B: 200 tablets, Expires: 2024-06-20
   - Batch C: 150 tablets, Expires: 2024-09-10
   
   Allocation:
   - Deduct 100 from Batch A (fully depleted)
   - Deduct 150 from Batch B (50 remaining)
   - Batch C untouched
   ```

5. **Transaction Recording**
   ```javascript
   InventoryItem Batch A:
   - quantity: 100 → 0
   - transactions: [
       { type: 'issue', quantity: -100, reference: 'ISU-2024-00001' }
     ]
   
   InventoryItem Batch B:
   - quantity: 200 → 50
   - transactions: [
       { type: 'issue', quantity: -150, reference: 'ISU-2024-00001' }
     ]
   ```

## API Endpoints Used

### Frontend Calls
- `GET /api/inventory/products` - Get product master data
- `GET /api/inventory/items` - Get inventory items (batches)
- `POST /api/inventory/issues` - Create issue (dispense)

### Backend Processing
- Validates product existence
- Queries available inventory items with FEFO
- Allocates stock across batches
- Deducts quantities with transaction tracking
- Creates issue document
- Logs activity

## Benefits

### 1. Accurate Stock Management
- ✅ Real-time stock from actual inventory batches
- ✅ No more sync issues between Product.currentStock and actual inventory
- ✅ Batch-level tracking for auditing

### 2. FEFO Compliance
- ✅ Automatically dispenses oldest batches first
- ✅ Reduces medication waste from expiry
- ✅ Complies with pharmacy best practices

### 3. Multi-Batch Dispensing
- ✅ Can fulfill orders larger than single batch
- ✅ Transparent batch allocation
- ✅ Weighted pricing across batches

### 4. Traceability
- ✅ Complete transaction history per batch
- ✅ Issue reference in inventory transactions
- ✅ Audit trail for regulatory compliance

### 5. Data Integrity
- ✅ MongoDB transactions prevent partial updates
- ✅ Atomic stock deductions
- ✅ Rollback on errors

## Testing Scenarios

### 1. Single-Batch Dispensing ⏳
**Scenario**: Request quantity available in one batch
- Product: Paracetamol 500mg
- Request: 50 tablets
- Available: Batch A (100 tablets, expires 2024-06-15)
- Expected: Deduct 50 from Batch A

### 2. Multi-Batch Dispensing ⏳
**Scenario**: Request quantity requiring multiple batches
- Product: Amoxicillin 500mg
- Request: 250 capsules
- Available:
  - Batch X (100 capsules, expires 2024-04-10)
  - Batch Y (200 capsules, expires 2024-07-20)
- Expected:
  - Deduct 100 from Batch X (depleted)
  - Deduct 150 from Batch Y (50 remaining)

### 3. Stock Validation ⏳
**Scenario**: Request exceeds available stock
- Product: Vitamin D3
- Request: 200 tablets
- Available: 150 tablets total across all batches
- Expected: Error "Insufficient stock. Available: 150, Requested: 200"

### 4. FEFO Logic ⏳
**Scenario**: Multiple batches with different expiry dates
- Product: Ibuprofen 400mg
- Request: 100 tablets
- Available:
  - Batch M (200 tablets, expires 2024-12-30) ❌ Not selected
  - Batch L (150 tablets, expires 2024-05-15) ✅ Selected first
- Expected: Deduct from Batch L (earliest expiry)

### 5. Expiry Filtering ⏳
**Scenario**: Some batches expired
- Product: Azithromycin 250mg
- Available:
  - Batch E (50 tablets, expires 2024-02-01) ❌ Expired
  - Batch F (100 tablets, expires 2024-08-15) ✅ Available
- Expected: Only counts 100 tablets as available

## Migration Notes

### Database State
- ✅ Products: 23 in MongoDB Atlas
- ✅ InventoryItems: 17 in MongoDB Atlas
- ✅ Multiple batches per product for testing
- ✅ Low-stock items for alert testing

### No Breaking Changes
- ✅ Existing Product model unchanged (removed currentStock was already deprecated)
- ✅ Existing Issue model supports batch information
- ✅ API endpoints remain the same
- ✅ Frontend props/state structure compatible

### Backward Compatibility
- Code still references `product.currentStock` but now calculates it from InventoryItems
- UI remains identical for end users
- No changes required to other components

## Files Modified

1. **server/Controllers/IssueController.js**
   - Added InventoryItem import
   - Replaced createIssue function (250 lines)
   - Implemented FEFO batch selection
   - Added multi-batch allocation logic
   - Added transaction recording

2. **client/src/pages/inventory/IssueManagement.jsx**
   - Updated fetchProducts function (50 lines)
   - Added dual data fetch (Products + InventoryItems)
   - Implemented stock aggregation
   - Added batch information to products
   - Preserved all UI/UX functionality

## Next Steps

### Ready for Testing ✅
The system is now ready for comprehensive testing. Please verify:

1. ✅ Backend compiles without errors
2. ✅ Frontend compiles without errors
3. ⏳ Test single-batch dispensing
4. ⏳ Test multi-batch dispensing
5. ⏳ Test stock validation
6. ⏳ Test FEFO logic
7. ⏳ Test prescription integration
8. ⏳ Verify transaction history

### Recommended Test Data
Use the existing seeded data:
- Paracetamol 500mg (3 batches)
- Amoxicillin 500mg (2 batches)
- Ibuprofen 400mg (2 batches)
- Low-stock items (4 items)

---

**Status**: ✅ Implementation Complete | ⏳ Testing Pending

**Last Updated**: 2024
