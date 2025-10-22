# Quick Start Guide - Testing the New System

## Prerequisites ✅

Before you start testing:
1. Backend server is running (`cd server && npm start`)
2. Frontend dev server is running (`cd client && npm start`)
3. Database migration has been run (`node server/migrate-products.js`)

---

## Test Workflow 🧪

### Step 1: Create a Product (Master Data)

1. **Navigate** to Pharmacist Dashboard
2. **Click** "Products" or go to `/pharmacist/products`
3. **Click** "Add Product" button
4. **Fill in** the form:
   ```
   Product Name: Paracetamol 500mg Tablets
   SKU: MED-PARA-500
   Category: Pain Relief
   Unit: tablets
   Description: Pain and fever reducer
   
   (Optional) Default Buying Price: 2.50
   (Optional) Default Selling Price: 5.00
   
   Minimum Stock: 100
   Prescription Required: No
   ```
5. **Click** "Save Product"
6. **Observe**: Success message appears "Product created successfully! You can now add inventory for this product."
7. **Note**: Product is created WITHOUT any stock

---

### Step 2: Add Inventory (Stock with Batch)

1. **Navigate** to `/pharmacist/inventory/add` (or from Products page, click "Add Inventory")
2. **Select Product** from dropdown: "Paracetamol 500mg Tablets (MED-PARA-500)"
3. **Observe**: Product details appear showing category, unit, default prices
4. **Fill in Batch Information**:
   ```
   Batch Number: BATCH-2025-001
   Manufacture Date: 2025-01-01
   Expiry Date: 2027-01-01
   ```
5. **Fill in Stock & Pricing**:
   ```
   Quantity: 500
   Buying Price: 2.50 (pre-filled from product)
   Selling Price: 5.00 (pre-filled from product)
   ```
6. **(Optional) Fill in Purchase Details**:
   ```
   Storage Location: Shelf A-12
   Supplier Name: ABC Pharma
   Purchase Date: 2025-10-14
   Receipt Number: INV-2025-001
   Notes: First batch of October
   ```
7. **Click** "Add Inventory"
8. **Observe**: 
   - Profit margin shows as 100%
   - Success message appears
   - Form resets
   - Redirects to products page after 2 seconds

---

### Step 3: Add Another Batch (Different Batch Number)

1. **Repeat Step 2** with different batch:
   ```
   Batch Number: BATCH-2025-002
   Manufacture Date: 2025-02-01
   Expiry Date: 2027-02-01
   Quantity: 300
   Buying Price: 2.30 (different price!)
   Selling Price: 4.80 (different price!)
   ```
2. **Observe**: Second batch is created successfully
3. **Result**: Same product now has TWO inventory items (batches)

---

### Step 4: Try to Add Duplicate Batch (Should Fail)

1. **Try to add** the exact same batch:
   ```
   Product: Paracetamol 500mg Tablets
   Batch Number: BATCH-2025-001
   Manufacture Date: 2025-01-01
   Expiry Date: 2027-01-01
   ```
2. **Observe**: Error message "This batch already exists for this product..."
3. **Result**: Duplicate batches are prevented ✅

---

### Step 5: Add Batch with Different Expiry (Should Work)

1. **Try to add** same batch number but different expiry:
   ```
   Product: Paracetamol 500mg Tablets
   Batch Number: BATCH-2025-001
   Manufacture Date: 2025-01-01
   Expiry Date: 2027-06-01 (different expiry!)
   Quantity: 200
   ```
2. **Observe**: New batch is created successfully
3. **Result**: Same batch number with different expiry = separate inventory item ✅

---

## Verification in Database 🔍

### Check Products Collection:
```javascript
// In MongoDB shell or Compass
db.products.find({ sku: "MED-PARA-500" })

// Should show:
{
  name: "Paracetamol 500mg Tablets",
  sku: "MED-PARA-500",
  category: "Pain Relief",
  unit: "tablets",
  defaultBuyingPrice: 2.50,
  defaultSellingPrice: 5.00,
  // NO currentStock field!
  // NO batchNumber field!
  // NO expiryDate field!
}
```

### Check InventoryItems Collection:
```javascript
// In MongoDB shell or Compass
db.inventoryitems.find({ product: ObjectId("...") })

// Should show multiple items:
[
  {
    product: ObjectId("..."),
    batchNumber: "BATCH-2025-001",
    manufactureDate: "2025-01-01",
    expiryDate: "2027-01-01",
    quantity: 500,
    buyingPrice: 2.50,
    sellingPrice: 5.00,
    status: "available",
    storageLocation: "Shelf A-12",
    // ... transaction history
  },
  {
    product: ObjectId("..."),
    batchNumber: "BATCH-2025-002",
    manufactureDate: "2025-02-01",
    expiryDate: "2027-02-01",
    quantity: 300,
    buyingPrice: 2.30,
    sellingPrice: 4.80,
    status: "available",
    // ... transaction history
  },
  // ... more batches
]
```

---

## Testing Edge Cases 🎯

### Test 1: Expired Batch
1. **Try to add** inventory with past expiry:
   ```
   Expiry Date: 2024-01-01 (in the past)
   ```
2. **Expected**: Validation error "Expiry date must be in the future"

### Test 2: Expiry Before Manufacture
1. **Try to add** inventory with expiry < manufacture:
   ```
   Manufacture Date: 2025-06-01
   Expiry Date: 2025-01-01
   ```
2. **Expected**: Validation error "Expiry date must be after manufacture date"

### Test 3: Zero Quantity
1. **Try to add** inventory with quantity = 0:
   ```
   Quantity: 0
   ```
2. **Expected**: Validation error "Quantity must be greater than 0"

### Test 4: Selling Price < Buying Price
1. **Try to add** inventory with selling < buying:
   ```
   Buying Price: 5.00
   Selling Price: 3.00
   ```
2. **Expected**: Validation error "Selling price should be greater than or equal to buying price"

### Test 5: Product Without Default Prices
1. **Create product** without default prices
2. **Add inventory** to that product
3. **Expected**: Fields are empty, must enter prices manually

---

## API Testing (Optional) 🔧

### Test Product Creation:
```bash
# POST /api/inventory/products
curl -X POST http://localhost:5000/api/inventory/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Aspirin 100mg",
    "sku": "MED-ASP-100",
    "category": "Pain Relief",
    "unit": "tablets",
    "defaultBuyingPrice": 1.50,
    "defaultSellingPrice": 3.00,
    "minStock": 50
  }'

# Response should include:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Aspirin 100mg",
    "sku": "MED-ASP-100",
    // ... no stock fields
  }
}
```

### Test Inventory Creation:
```bash
# POST /api/inventory/items
curl -X POST http://localhost:5000/api/inventory/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": "PRODUCT_ID_HERE",
    "batchNumber": "BATCH-TEST-001",
    "manufactureDate": "2025-01-01",
    "expiryDate": "2027-01-01",
    "quantity": 100,
    "buyingPrice": 1.50,
    "sellingPrice": 3.00
  }'

# Response should include:
{
  "success": true,
  "data": {
    "_id": "...",
    "product": "...",
    "batchNumber": "BATCH-TEST-001",
    "quantity": 100,
    "status": "available",
    // ... transaction history
  }
}
```

### Test Duplicate Batch (Should Fail):
```bash
# POST /api/inventory/items (same batch again)
curl -X POST http://localhost:5000/api/inventory/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": "SAME_PRODUCT_ID",
    "batchNumber": "BATCH-TEST-001",
    "manufactureDate": "2025-01-01",
    "expiryDate": "2027-01-01",
    "quantity": 50
  }'

# Response should be:
{
  "success": false,
  "message": "Inventory item with this batch already exists. Updated quantity instead."
  // OR error about duplicate
}
```

---

## Common Issues & Solutions 🔧

### Issue 1: "Cannot read property 'inventoryItems' of undefined"
**Cause**: API import issue  
**Solution**: Check `client/src/pages/inventory/AddInventory.jsx` line with API call

### Issue 2: "Product not found" when adding inventory
**Cause**: Product ID mismatch  
**Solution**: Verify product exists and is active

### Issue 3: Form doesn't reset after success
**Cause**: JavaScript issue  
**Solution**: Check console for errors, ensure formData state is being reset

### Issue 4: Default prices not showing when selecting product
**Cause**: Product doesn't have default prices  
**Solution**: Expected behavior - default prices are optional

### Issue 5: Date picker not working
**Cause**: Browser compatibility  
**Solution**: Use Chrome/Edge, or enter date manually in YYYY-MM-DD format

---

## Success Indicators ✅

You'll know the system is working correctly when:

- ✅ Can create products without any stock
- ✅ Can add inventory to products
- ✅ Default prices pre-fill from product (if set)
- ✅ Can override default prices per batch
- ✅ Cannot create duplicate batches (same product + batch + dates)
- ✅ Can create same batch number with different dates
- ✅ Validation prevents invalid data
- ✅ Success messages appear correctly
- ✅ Forms reset after submission
- ✅ Database shows separated data (products vs inventory items)

---

## Next Steps After Testing 🎯

Once basic testing is complete:

1. **Test with Real Data**: Create actual products and inventory
2. **Update ProductsManagement**: Show aggregated stock
3. **Create InventoryManagement**: View all batches
4. **Update Issue System**: Deduct from specific batches
5. **Add Stock Adjustment**: Modify existing batch quantities
6. **Add Transaction History View**: See all stock movements

---

## Rollback Plan 🔄

If you need to rollback:

1. **Stop the application**
2. **Restore database** from backup:
   ```bash
   # The migration created a backup at:
   server/backups/products-backup-TIMESTAMP.json
   ```
3. **Restore old code**:
   ```bash
   git checkout AddProduct.jsx.backup
   rm AddInventory.jsx
   git checkout App.jsx
   ```
4. **Restart application**

---

## Help & Documentation 📚

- **FRONTEND_UPDATE_COMPLETE.md** - Complete frontend update summary
- **MIGRATION_INSTRUCTIONS.md** - Database migration guide
- **IMPLEMENTATION_STATUS.md** - Overall project status
- **PRODUCT_INVENTORY_SEPARATION_GUIDE.md** - Architecture details

---

**Happy Testing! 🎉**

If you find any bugs or have questions, refer to the documentation or check the console for errors.
