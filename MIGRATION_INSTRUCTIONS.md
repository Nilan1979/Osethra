# Database Migration Instructions

## ⚠️ IMPORTANT - Read Before Running

This migration script will permanently modify your database. Always test on a development environment first!

---

## What This Migration Does

1. **Creates a backup** of all existing products to `backups/products-backup-[timestamp].json`
2. **Updates Product documents** - Removes stock-related fields, adds default pricing fields
3. **Creates InventoryItem documents** - Creates one inventory item per product if it has stock > 0
4. **Handles edge cases**:
   - Products without expiry dates get a default 2-year expiry from now
   - Products with past expiry dates get status='expired'
   - Products without batch numbers get auto-generated batch numbers
   - Each error is logged but doesn't stop the migration

---

## Before Running Migration

### 1. Verify Your MongoDB Connection

Check `server/app.js` for your MongoDB connection string. It should be something like:
```
mongodb://localhost:27017/osethra
```

### 2. Create a Manual Backup (Optional but Recommended)

```bash
# Windows PowerShell/CMD
mongodump --db osethra --out backup-$(Get-Date -Format "yyyy-MM-dd-HHmm")

# Or use MongoDB Compass to export your database
```

### 3. Test on Development Database First

If you have a production database, DO NOT run this on production first!

1. Create a copy of your database
2. Run migration on the copy
3. Verify the results
4. Then run on production

---

## Running the Migration

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Run the Migration Script

```bash
node migrate-products.js
```

### Step 3: Confirm

You will see:
```
==============================================
  Product to Inventory Migration Tool
==============================================

This migration will:
- Backup all existing products
- Remove stock fields from products
- Create inventory items for products with stock
- Update product schema to new format

⚠️  WARNING: This will permanently modify your database!

Do you want to continue? (yes/no):
```

Type `yes` and press Enter to proceed.

### Step 4: Monitor Progress

The script will show:
```
✅ Backup created: backups/products-backup-2024-01-15-143022.json
🔄 Processing 150 products...
✅ Product 1/150: Paracetamol 500mg - updated, inventory created
✅ Product 2/150: Aspirin 100mg - updated, inventory created
⚠️  Product 3/150: Expired Medicine - updated, inventory status: expired
...
✅ Migration completed successfully!
```

---

## What Happens During Migration

### Products Table Changes

**Before Migration**:
```javascript
{
  name: "Paracetamol 500mg",
  sku: "MED-001",
  currentStock: 500,
  batchNumber: "BATCH-001",
  manufactureDate: "2024-01-01",
  expiryDate: "2026-01-01",
  buyingPrice: 10,
  sellingPrice: 15,
  storageLocation: "Shelf A-1",
  profitMargin: 50,
  // ... other fields
}
```

**After Migration**:
```javascript
{
  name: "Paracetamol 500mg",
  sku: "MED-001",
  defaultBuyingPrice: 10,      // ← renamed from buyingPrice
  defaultSellingPrice: 15,     // ← renamed from sellingPrice
  defaultStorageLocation: "Shelf A-1",  // ← renamed
  // ✗ currentStock - removed
  // ✗ batchNumber - removed
  // ✗ manufactureDate - removed
  // ✗ expiryDate - removed
  // ✗ profitMargin - removed
  // ... other fields unchanged
}
```

### InventoryItems Table (New)

For each product with stock > 0, creates:
```javascript
{
  product: ObjectId("..."),    // Reference to product
  batchNumber: "BATCH-001",
  manufactureDate: "2024-01-01",
  expiryDate: "2026-01-01",
  quantity: 500,
  buyingPrice: 10,
  sellingPrice: 15,
  storageLocation: "Shelf A-1",
  status: "available",
  createdBy: ObjectId("..."),  // Migration user ID
  transactionHistory: [
    {
      type: "migration",
      quantity: 500,
      date: "2024-01-15",
      reference: "Data migration from legacy products",
    }
  ]
}
```

---

## Post-Migration Verification

### 1. Check the Backup File

```bash
cd backups
dir  # Windows
# or
ls  # Linux/Mac

# You should see: products-backup-YYYY-MM-DD-HHMMSS.json
```

### 2. Verify in MongoDB

**Using MongoDB Compass**:
1. Connect to your database
2. Check `products` collection - should have no stock fields
3. Check `inventoryitems` collection - should have new records

**Using Mongo Shell**:
```javascript
// Connect
mongo osethra

// Check products (should NOT have currentStock)
db.products.findOne()

// Check inventory items (should exist)
db.inventoryitems.find().pretty()

// Count check - should match number of products with stock > 0
db.inventoryitems.countDocuments()
```

### 3. Check Migration Log

The console output will show:
- Number of products processed
- Number of inventory items created
- Any errors encountered
- Summary statistics

---

## Rolling Back (If Needed)

If something goes wrong, you can restore from the backup:

### Option 1: Use the Backup JSON File

```javascript
// In mongo shell
use osethra

// Delete migrated data
db.products.deleteMany({})
db.inventoryitems.deleteMany({})

// Restore from backup
const backup = JSON.parse(fs.readFileSync('backups/products-backup-XXXX.json'));
db.products.insertMany(backup);
```

### Option 2: Use MongoDB Restore

```bash
# If you made a mongodump backup
mongorestore --db osethra backup-folder-name/osethra
```

---

## Common Issues and Solutions

### Issue 1: "Cannot find module"
**Error**: `Cannot find module './Model/ProductModel.js'`

**Solution**: Make sure you're in the `server` directory:
```bash
cd server
node migrate-products.js
```

### Issue 2: "MongoDB connection failed"
**Error**: `MongooseError: Connection failed`

**Solution**: 
1. Check if MongoDB is running: `net start MongoDB` (Windows)
2. Verify connection string in `server/app.js`

### Issue 3: "Migration user not found"
**Warning**: `⚠️  No admin/pharmacist user found for createdBy field`

**Impact**: Inventory items will have null `createdBy`. This is not critical.

**Solution** (optional): Create an admin user first or manually update after migration.

### Issue 4: "Some products failed to migrate"
**Error**: Individual product errors in the log

**Solution**: 
1. Check the error message for specific product
2. The backup file is still safe
3. You can manually fix the problematic product and re-run migration

### Issue 5: "Duplicate key error"
**Error**: `E11000 duplicate key error`

**Cause**: Migration was partially run before

**Solution**:
```javascript
// In mongo shell
db.inventoryitems.deleteMany({});  // Clear inventory items
// Then re-run migration
```

---

## Testing After Migration

### Test 1: View Products (Should Work)
```
GET http://localhost:5000/api/inventory/products
```

Products should show with `defaultBuyingPrice` instead of `buyingPrice`.

### Test 2: View Inventory Items (Should Work)
```
GET http://localhost:5000/api/inventory/items
```

Should return all inventory items with batch details.

### Test 3: Get Product Inventory Summary (Should Work)
```
GET http://localhost:5000/api/inventory/products/:productId/inventory
```

Should show aggregated stock from all batches.

### Test 4: Add New Product (Should Work)
```
POST http://localhost:5000/api/inventory/products
{
  "name": "Test Product",
  "sku": "TEST-001",
  "category": "Test",
  "unit": "pieces",
  "defaultBuyingPrice": 100,
  "defaultSellingPrice": 150
}
```

Should create product WITHOUT stock.

### Test 5: Add Inventory (Should Work)
```
POST http://localhost:5000/api/inventory/items
{
  "product": "<productId>",
  "batchNumber": "BATCH-TEST-001",
  "quantity": 100,
  "buyingPrice": 100,
  "sellingPrice": 150,
  "manufactureDate": "2024-01-01",
  "expiryDate": "2026-01-01"
}
```

Should create inventory item for the product.

---

## Migration Script Location

```
server/migrate-products.js
```

**Size**: ~226 lines
**Dependencies**: mongoose, Product model, InventoryItem model

---

## Statistics to Expect

After migration, you should see:
```
📊 Migration Statistics:
- Products processed: XXX
- Products updated: XXX
- Inventory items created: XXX
- Products with expired stock: XX
- Products without stock: XX
- Errors encountered: 0
```

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify your backup was created
3. Check MongoDB connection
4. Review the migration log
5. Test on a development database first

For code-related issues, check:
- `server/Model/ProductModel.js` - New product schema
- `server/Model/InventoryItemModel.js` - Inventory item schema
- `PRODUCT_INVENTORY_SEPARATION_GUIDE.md` - Architecture details
- `FRONTEND_UPDATE_GUIDE.md` - Frontend changes needed

---

## Next Steps After Migration

1. ✅ Verify migration success
2. ✅ Test API endpoints
3. ⏭️ Update frontend components (see FRONTEND_UPDATE_GUIDE.md)
4. ⏭️ Create AddInventory.jsx component
5. ⏭️ Update ProductsManagement.jsx
6. ⏭️ Create InventoryManagement.jsx
7. ⏭️ Test complete workflow: Create Product → Add Inventory → Manage Stock

---

## Files Created by Migration

```
backups/
  products-backup-2024-01-15-143022.json  ← Your backup (KEEP THIS SAFE!)
```

**Important**: Don't delete the backup until you've verified everything works correctly!

---

## Summary

✅ Migration script is **ready to run**
✅ Backup is **created automatically**
✅ Rollback is **possible** using backup
✅ **No data loss** if done correctly
⚠️ **Test on development first**
⚠️ **Keep backup safe**

Good luck with the migration! 🚀
