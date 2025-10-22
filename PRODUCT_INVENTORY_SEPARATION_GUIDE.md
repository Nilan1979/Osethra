# Product & Inventory Management Separation Guide

## Overview

The system has been refactored to separate **Product Management** (product master data) from **Inventory Management** (actual stock with batch details). This allows for better tracking of products with multiple batches, expiry dates, and purchase details.

## Architecture

### 1. Product Model (Master Data)
**File:** `server/Model/ProductModel.js`

**Purpose:** Stores product definitions/master data only

**Key Fields:**
- `name` - Product name
- `sku` - Stock Keeping Unit (unique)
- `category` - Product category
- `description` - Product description
- `manufacturer` - Manufacturer name
- `supplier` - Supplier name
- `defaultBuyingPrice` - Default buying price (optional)
- `defaultSellingPrice` - Default selling price (optional)
- `minStock` - Minimum stock threshold
- `maxStock` - Maximum stock threshold
- `reorderPoint` - Reorder point
- `unit` - Unit of measurement (pieces, boxes, tablets, etc.)
- `defaultStorageLocation` - Default storage location
- `barcode` - Product barcode (unique, optional)
- `prescription` - Whether product requires prescription
- `status` - Product status (active/inactive/discontinued)

**What's Removed:**
- ❌ `currentStock` - Now tracked in InventoryItem
- ❌ `batchNumber` - Now tracked in InventoryItem
- ❌ `manufactureDate` - Now tracked in InventoryItem
- ❌ `expiryDate` - Now tracked in InventoryItem
- ❌ `orderHistory` - Now tracked in InventoryItem transactions

---

### 2. InventoryItem Model (Stock/Batch Data)
**File:** `server/Model/InventoryItemModel.js`

**Purpose:** Stores actual stock items with batch-specific details

**Key Fields:**
- `product` - Reference to Product (ObjectId)
- `batchNumber` - Batch number (required)
- `manufactureDate` - Manufacture date (required)
- `expiryDate` - Expiry date (required)
- `quantity` - Current quantity in stock
- `buyingPrice` - Buying price for this batch
- `sellingPrice` - Selling price for this batch
- `storageLocation` - Storage location for this batch
- `supplierName` - Supplier for this batch
- `purchaseDate` - Purchase date
- `receiptNumber` - Receipt/Invoice number
- `status` - Status (available/reserved/expired/depleted)
- `transactions[]` - Transaction history (receipts, issues, adjustments)

**Unique Constraint:**
Each combination of `(product, batchNumber, expiryDate, manufactureDate)` must be unique.

---

## Workflow

### Step 1: Create Product Master Data
**Endpoint:** `POST /api/inventory/products`

**Purpose:** Define a new product (one-time setup)

**Example Request:**
```json
{
  "name": "Paracetamol 500mg Tablets",
  "sku": "MED-PARA-500",
  "category": "Medications",
  "description": "Pain reliever and fever reducer",
  "manufacturer": "Pharma Ltd",
  "supplier": "Medical Supplies Inc",
  "defaultBuyingPrice": 50,
  "defaultSellingPrice": 75,
  "minStock": 100,
  "maxStock": 1000,
  "unit": "tablets",
  "prescription": false,
  "defaultStorageLocation": "A-12"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully. You can now add inventory for this product.",
  "data": {
    "_id": "60f7b3c4e5d4f12345678901",
    "name": "Paracetamol 500mg Tablets",
    "sku": "MED-PARA-500",
    ...
  }
}
```

---

### Step 2: Add Inventory (Stock) to Product
**Endpoint:** `POST /api/inventory/items`

**Purpose:** Add stock to an existing product with batch details

**Example Request:**
```json
{
  "product": "60f7b3c4e5d4f12345678901",
  "batchNumber": "BATCH-2025-001",
  "manufactureDate": "2025-01-15",
  "expiryDate": "2027-01-15",
  "quantity": 500,
  "buyingPrice": 48,
  "sellingPrice": 72,
  "storageLocation": "A-12",
  "supplierName": "Medical Supplies Inc",
  "purchaseDate": "2025-10-14",
  "receiptNumber": "RCP-2025-1234",
  "notes": "First batch purchase"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory item added successfully",
  "data": {
    "_id": "60f7b3c4e5d4f12345678902",
    "product": "60f7b3c4e5d4f12345678901",
    "batchNumber": "BATCH-2025-001",
    "quantity": 500,
    ...
  }
}
```

**Important Notes:**
- If the same batch (same batchNumber, expiryDate, manufactureDate) is added again, the quantity will be added to the existing item
- Different batches create separate inventory items
- Prices can vary per batch

---

### Step 3: View Product with All Inventory
**Endpoint:** `GET /api/inventory/products/:productId/inventory`

**Purpose:** Get complete inventory summary for a product (all batches)

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "60f7b3c4e5d4f12345678901",
      "name": "Paracetamol 500mg Tablets",
      "sku": "MED-PARA-500",
      "unit": "tablets",
      "minStock": 100
    },
    "summary": {
      "totalQuantity": 1200,
      "totalValue": 86400,
      "avgBuyingPrice": 48.50,
      "avgSellingPrice": 72.00,
      "totalBatches": 3,
      "expiredBatches": 0,
      "expiringSoonBatches": 1,
      "stockStatus": "in-stock"
    },
    "batches": [
      {
        "_id": "...",
        "batchNumber": "BATCH-2025-001",
        "expiryDate": "2027-01-15",
        "quantity": 500,
        "daysUntilExpiry": 823
      },
      ...
    ]
  }
}
```

---

## API Endpoints

### Product Management (Master Data)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/inventory/products` | Get all products | All authenticated |
| GET | `/api/inventory/products/:id` | Get single product | All authenticated |
| POST | `/api/inventory/products` | Create product | Pharmacist, Admin |
| PUT | `/api/inventory/products/:id` | Update product | Pharmacist, Admin |
| DELETE | `/api/inventory/products/:id` | Delete product | Pharmacist, Admin |
| GET | `/api/inventory/products/:productId/inventory` | Get product inventory summary | Pharmacist, Admin, Nurse |

### Inventory Management (Stock/Batches)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/inventory/items` | Add inventory item | Pharmacist, Admin |
| GET | `/api/inventory/items` | Get all inventory items | Pharmacist, Admin, Nurse |
| GET | `/api/inventory/items/:id` | Get single inventory item | Pharmacist, Admin, Nurse |
| PUT | `/api/inventory/items/:id` | Update inventory item | Pharmacist, Admin |
| PATCH | `/api/inventory/items/:id/adjust` | Adjust stock quantity | Pharmacist, Admin |

---

## Frontend Components Needed

### 1. Product Management Component
**File:** `client/src/pages/inventory/ProductsManagement.jsx`

**Features:**
- List all products (master data)
- Search and filter products
- View product details with inventory summary
- Create new product (master data only)
- Edit product details
- Mark product as active/inactive

---

### 2. Add Product Component
**File:** `client/src/pages/inventory/AddProduct.jsx`

**Purpose:** Create product master data only

**Form Fields:**
- Product Name*
- SKU*
- Category*
- Description
- Manufacturer
- Supplier
- Default Buying Price
- Default Selling Price
- Min Stock*
- Max Stock
- Unit*
- Default Storage Location
- Barcode
- Prescription Required (Yes/No)

**No Stock Fields:**
- ❌ Current Stock
- ❌ Batch Number
- ❌ Manufacture Date
- ❌ Expiry Date

**Button:** "Create Product" → After creation, show option to "Add Inventory"

---

### 3. Add Inventory Component (NEW)
**File:** `client/src/pages/inventory/AddInventory.jsx`

**Purpose:** Add stock to an existing product

**Form Fields:**
- Select Product* (Dropdown - search products)
- Batch Number*
- Manufacture Date*
- Expiry Date*
- Quantity*
- Buying Price*
- Selling Price*
- Storage Location
- Supplier Name
- Purchase Date
- Receipt Number
- Notes

**Button:** "Add to Inventory"

---

### 4. Inventory Items Management (NEW)
**File:** `client/src/pages/inventory/InventoryManagement.jsx`

**Features:**
- List all inventory items (all batches across all products)
- Filter by:
  - Product
  - Batch Number
  - Expiry Status (expired, expiring soon, good)
  - Status (available, depleted, expired)
- View batch details
- Adjust stock quantity
- Stock value summary

---

## Migration Strategy

### Existing Data Conversion

A migration script is needed to convert existing Product records to the new structure:

```javascript
// migrate-products.js
const Product = require('./Model/ProductModel');
const InventoryItem = require('./Model/InventoryItemModel');

async function migrateProducts() {
  const products = await Product.find({ currentStock: { $exists: true } });
  
  for (const product of products) {
    // If product has stock, create an inventory item
    if (product.currentStock > 0) {
      await InventoryItem.create({
        product: product._id,
        batchNumber: product.batchNumber || `MIGRATED-${product.sku}`,
        manufactureDate: product.manufactureDate || new Date(),
        expiryDate: product.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        quantity: product.currentStock,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        storageLocation: product.storageLocation,
        status: 'available',
        notes: 'Migrated from old system'
      });
    }
    
    // Update product to new schema
    product.defaultBuyingPrice = product.buyingPrice;
    product.defaultSellingPrice = product.sellingPrice;
    product.defaultStorageLocation = product.storageLocation;
    
    // Remove old fields
    product.currentStock = undefined;
    product.batchNumber = undefined;
    product.manufactureDate = undefined;
    product.expiryDate = undefined;
    product.buyingPrice = undefined;
    product.sellingPrice = undefined;
    product.storageLocation = undefined;
    
    await product.save();
  }
}
```

---

## Benefits

✅ **Better Batch Tracking** - Each batch has its own record with expiry, purchase details
✅ **Accurate FIFO/FEFO** - Can implement First-In-First-Out or First-Expired-First-Out
✅ **Price Variations** - Different batches can have different prices
✅ **Audit Trail** - Complete transaction history per batch
✅ **Inventory Accuracy** - Know exactly which batch has how much stock
✅ **Compliance** - Better for pharmaceutical regulations
✅ **Reporting** - Better insights into purchases, expiry, wastage

---

## Example Use Cases

### Use Case 1: Multiple Batches
**Scenario:** Pharmacy receives 3 batches of the same medicine at different times

```
Product: Paracetamol 500mg
├── Batch 1: Exp 2026-01, Qty: 200, Price: $0.50
├── Batch 2: Exp 2026-06, Qty: 300, Price: $0.48
└── Batch 3: Exp 2027-01, Qty: 150, Price: $0.52
```

**Total Stock:** 650 tablets
**System tracks each batch separately for expiry and FIFO**

---

### Use Case 2: Issue Products
**When dispensing:** System can automatically select from the batch expiring soonest (FEFO)

```javascript
// Issue 50 tablets
// System selects from Batch 1 (expires first)
// Batch 1: 200 → 150
```

---

## Next Steps

1. ✅ Create InventoryItem Model
2. ✅ Update Product Model
3. ✅ Add Inventory Controllers
4. ✅ Add Inventory Routes
5. ⏳ Create Frontend Components:
   - Simplified AddProduct (master data only)
   - New AddInventory component
   - New InventoryManagement component
   - Update ProductsManagement to show inventory summary
6. ⏳ Update Issue System to use inventory items
7. ⏳ Create migration script
8. ⏳ Update documentation

---

## Support

For questions or issues with the new system, please refer to:
- `PHARMACIST_DASHBOARD_SUMMARY.md` - Dashboard overview
- `INVENTORY_MANAGEMENT_GUIDE.md` - Detailed inventory operations
- `API_DOCUMENTATION.md` - Complete API reference
