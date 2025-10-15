# Activity Model Fix - October 15, 2025

## Issue
When adding inventory items, the server returned a 500 error:
```
Activity validation failed: type: `inventory_receipt` is not a valid enum value for path `type`.
```

## Root Cause
The Activity model's `type` field had a limited enum that didn't include inventory-related activity types that were being used in the InventoryController.

## Solution
Updated the Activity model to include all inventory-related activity types.

## Changes Made

### File: `server/Model/ActivityModel.js`

#### 1. Updated `type` enum
**Added new activity types**:
- `inventory_added` - When new inventory items are added
- `inventory_receipt` - When inventory is received from suppliers
- `inventory_adjustment` - When stock quantities are manually adjusted

**Before**:
```javascript
enum: [
    'product_added',
    'product_updated',
    'product_deleted',
    'issue_created',
    'issue_updated',
    'prescription_created',
    'prescription_dispensed',
    'stock_adjusted',
    'category_added',
    'category_deleted',
    'low_stock_alert',
    'expiry_alert'
]
```

**After**:
```javascript
enum: [
    'product_added',
    'product_updated',
    'product_deleted',
    'inventory_added',        // NEW
    'inventory_receipt',      // NEW
    'inventory_adjustment',   // NEW
    'stock_adjusted',
    'issue_created',
    'issue_updated',
    'prescription_created',
    'prescription_dispensed',
    'category_added',
    'category_deleted',
    'low_stock_alert',
    'expiry_alert'
]
```

#### 2. Updated `entityType` enum
**Added**:
- `InventoryItem` - To reference inventory item entities

**Before**:
```javascript
enum: ['Product', 'Issue', 'Prescription', 'Category']
```

**After**:
```javascript
enum: ['Product', 'InventoryItem', 'Issue', 'Prescription', 'Category']
```

## Activity Types Reference

### Product Activities
- `product_added` - New product created in catalog
- `product_updated` - Product information modified
- `product_deleted` - Product removed from catalog

### Inventory Activities
- `inventory_added` - New inventory item added (general)
- `inventory_receipt` - Inventory received from supplier
- `inventory_adjustment` - Manual stock quantity adjustment
- `stock_adjusted` - Stock level changed

### Issue/Dispensing Activities
- `issue_created` - New medication dispensing issue created
- `issue_updated` - Issue information updated

### Prescription Activities
- `prescription_created` - New prescription created
- `prescription_dispensed` - Prescription fulfilled/dispensed

### Category Activities
- `category_added` - New product category created
- `category_deleted` - Category removed

### Alert Activities
- `low_stock_alert` - Stock below minimum threshold
- `expiry_alert` - Product approaching expiry date

## Entity Types Reference

### Available Entity Types
- `Product` - Reference to Product collection
- `InventoryItem` - Reference to InventoryItem collection (batches)
- `Issue` - Reference to Issue collection (dispensing)
- `Prescription` - Reference to Prescription collection
- `Category` - Reference to Category collection

## Usage Examples

### Example 1: Inventory Receipt Activity
```javascript
await Activity.create({
    type: 'inventory_receipt',
    description: 'Added 100 tablets of Paracetamol 500mg (Batch: B12345)',
    user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role
    },
    entityType: 'Product',
    entityId: productId,
    entityName: 'Paracetamol 500mg Tablets',
    severity: 'info',
    metadata: {
        productId: productId,
        inventoryItemId: inventoryItemId,
        quantity: 100,
        batchNumber: 'B12345',
        availability: 'in-stock'
    }
});
```

### Example 2: Inventory Adjustment Activity
```javascript
await Activity.create({
    type: 'inventory_adjustment',
    description: 'Adjusted stock for Amoxicillin 500mg (Batch: B67890): -10 capsules',
    user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role
    },
    entityType: 'Product',
    entityId: productId,
    entityName: 'Amoxicillin 500mg Capsules',
    severity: 'warning',
    metadata: {
        productId: productId,
        inventoryItemId: inventoryItemId,
        adjustment: -10,
        newQuantity: 240,
        reason: 'Damaged items removed'
    }
});
```

## Testing
After updating the Activity model:
1. ✅ Server restarted successfully
2. ✅ Inventory items can be added without validation errors
3. ✅ Activities are logged correctly in the database
4. ✅ Activity logs display proper types

## Impact
- **Files Modified**: 1 (ActivityModel.js)
- **Breaking Changes**: None (backward compatible - only added new enum values)
- **Database Migration**: Not required (existing data unaffected)

## Next Steps
- Monitor activity logs to ensure all activities are being recorded correctly
- Consider adding more specific activity types as features expand
- Implement activity filtering by type in the frontend

## Status
✅ **Fixed and Deployed**

---
**Last Updated**: October 15, 2025
