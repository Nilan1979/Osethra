# Frontend Update Guide
## Product and Inventory Separation

This guide explains the changes needed to update the frontend components to work with the new separated Product and Inventory system.

---

## Overview

The backend has been updated to separate:
- **Products**: Master data (product definitions)
- **InventoryItems**: Actual stock with batch-level tracking

### What Changed in Backend

**ProductModel** - Now stores only master data:
- **Removed fields**: `current Stock`, `batchNumber`, `manufactureDate`, `expiryDate`, `buyingPrice`, `sellingPrice`, `storageLocation`, `profitMargin`
- **Added fields**: `defaultBuyingPrice`, `defaultSellingPrice`, `defaultStorageLocation` (all optional)

**InventoryItemModel** - New model for stock tracking:
- Fields: `product`, `batchNumber`, `manufactureDate`, `expiryDate`, `quantity`, `buyingPrice`, `sellingPrice`, `storageLocation`, etc.
- Unique constraint: Product + batchNumber + expiryDate + manufactureDate must be unique

---

## Required Frontend Updates

### 1. Update `AddProduct.jsx`

**Current Location**: `client/src/pages/inventory/AddProduct.jsx`

#### Changes Needed:

**A. Update formData state (around line 52):**
```jsx
const [formData, setFormData] = useState({
  name: '',
  sku: '',
  category: '',
  description: '',
  manufacturer: '',
  supplier: '',
  // Default Pricing (Optional)
  defaultBuyingPrice: '',
  defaultSellingPrice: '',
  // Stock Control
  minStock: '10',
  maxStock: '',
  reorderPoint: '',
  unit: 'pieces',
  // Product Details
  defaultStorageLocation: '',
  barcode: '',
  // Additional Info
  prescription: 'no',
  status: 'active',
  notes: '',
});
```

**B. Remove from formData:**
- `buyingPrice` → `defaultBuyingPrice`
- `sellingPrice` → `defaultSellingPrice`
- `profitMargin` (delete entirely)
- `initialStock` (delete entirely)
- `batchNumber` (delete entirely)
- `manufactureDate` (delete entirely)
- `expiryDate` (delete entirely)
- `storageLocation` → `defaultStorageLocation`

**C. Update handleInputChange (remove profit margin calculation):**
Remove the profit margin auto-calculation logic (around lines 130-132)

**D. Update validateForm function:**
- Remove required validation for `initialStock`
- Remove required validation for `buyingPrice` and `sellingPrice` (make them optional)
- Remove expiry date validation
- Remove stock >= 0 validation

**E. Update handleSubmit function:**
```jsx
const productData = {
  name: formData.name.trim(),
  sku: formData.sku.trim().toUpperCase(),
  category: formData.category.trim(),
  description: formData.description.trim() || undefined,
  manufacturer: formData.manufacturer.trim() || undefined,
  supplier: formData.supplier.trim() || undefined,
  defaultBuyingPrice: formData.defaultBuyingPrice ? parseFloat(formData.defaultBuyingPrice) : undefined,
  defaultSellingPrice: formData.defaultSellingPrice ? parseFloat(formData.defaultSellingPrice) : undefined,
  minStock: formData.minStock ? parseInt(formData.minStock) : 10,
  maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
  reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : undefined,
  unit: formData.unit,
  defaultStorageLocation: formData.defaultStorageLocation.trim() || undefined,
  barcode: formData.barcode.trim() || undefined,
  prescription: formData.prescription === 'yes',
  status: formData.status,
  notes: formData.notes.trim() || undefined,
};
```

**F. Update success message:**
Change from "Product added successfully" to:
```
"Product created successfully! You can now add inventory for this product."
```

**G. Update JSX form fields:**
Remove these sections:
- Pricing section with buyingPrice/sellingPrice/profitMargin
- Stock section with initialStock
- Batch Details section with batchNumber/manufactureDate/expiryDate

Add these sections:
- Default Pricing (Optional) section with defaultBuyingPrice/defaultSellingPrice
- Add note: "These are default prices that can be overridden when adding inventory batches"

**H. Add navigation button after success:**
After product creation, show button: "Add Inventory to this Product" → navigates to `/pharmacist/inventory/add?productId={newProductId}`

---

### 2. Create `AddInventory.jsx` (NEW FILE)

**Location**: `client/src/pages/inventory/AddInventory.jsx`

#### Purpose:
Form to add inventory (stock) to existing products with batch details.

#### Required Fields:
```jsx
const [formData, setFormData] = useState({
  product: '', // Product ID (dropdown selection)
  batchNumber: '',
  manufactureDate: '',
  expiryDate: '',
  quantity: '',
  buyingPrice: '',
  sellingPrice: '',
  storageLocation: '',
  supplierName: '',
  purchaseDate: '',
  receiptNumber: '',
  notes: '',
});
```

#### Features:
1. **Product Selector**: Autocomplete dropdown to search and select products
2. **Batch Details**: Required fields for batch tracking
3. **Pricing**: Required buying/selling prices (with defaults from product)
4. **Validation**: 
   - All required fields must be filled
   - Expiry date > manufacture date
   - Selling price >= buying price
   - Quantity > 0
5. **API Call**: `POST /api/inventory/items`
6. **Success Handling**: 
   - Show success message
   - Option to add another batch
   - Option to view inventory list
7. **Duplicate Handling**: If batch already exists, show error with option to adjust stock instead

#### Implementation Steps:
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productsAPI } from '../../api/inventory';
import { inventoryItemsAPI } from '../../api/inventory';

const AddInventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // If productId passed via navigation state, pre-select it
  useEffect(() => {
    if (location.state?.productId) {
      // Fetch and select the product
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await inventoryItemsAPI.addInventoryItem(formData);
      // Handle success
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        // Show duplicate batch message
        // Offer to adjust stock instead
      }
    }
  };
};
```

---

### 3. Update `ProductsManagement.jsx`

**Location**: `client/src/pages/inventory/ProductsManagement.jsx`

#### Changes Needed:

**A. Update table columns:**
- Remove: `Current Stock` column
- Add: `Total Stock` column (aggregated from all inventory items)
- Add: `Batches` column (count of inventory items)

**B. Update data fetching:**
```jsx
const fetchProducts = async () => {
  const response = await productsAPI.getProducts();
  // For each product, fetch inventory summary
  const productsWithInventory = await Promise.all(
    response.data.map(async (product) => {
      const inventory = await inventoryItemsAPI.getProductInventory(product._id);
      return {
        ...product,
        totalStock: inventory.summary.totalQuantity,
        batchCount: inventory.items.length,
      };
    })
  );
};
```

**C. Update detail view:**
Show inventory summary instead of single stock value

**D. Add action buttons:**
- "Add Inventory" button per product → navigates to AddInventory with productId
- "View Inventory" button → navigates to inventory management filtered by product

**E. Update search/filter:**
Add filter options:
- Products with low stock (totalStock < minStock)
- Products without inventory
- Products by category

---

### 4. Create `InventoryManagement.jsx` (NEW FILE)

**Location**: `client/src/pages/inventory/InventoryManagement.jsx`

#### Purpose:
Comprehensive view of all inventory items (batches) across all products.

#### Table Columns:
- Product Name
- SKU
- Batch Number
- Manufacture Date
- Expiry Date (with days until expiry badge)
- Quantity
- Buying Price
- Selling Price
- Storage Location
- Status (available/reserved/expired/depleted)
- Actions

#### Features:
1. **Filters**:
   - By product
   - By status (available, expired, expiring soon, low stock)
   - By expiry status (active, expiring soon, expired)
   - Search (product name, batch number, SKU)

2. **Sorting**:
   - By expiry date (FEFO - First Expired First Out)
   - By quantity
   - By product name
   - By batch number

3. **Actions per Item**:
   - View Details
   - Adjust Stock (+ or -)
   - Edit (update prices, storage location)
   - View Transaction History

4. **Summary Cards**:
   - Total Inventory Value (sum of quantity × buyingPrice)
   - Total Items
   - Expired Batches
   - Expiring Soon (within 30 days)
   - Low Stock Items

5. **API Integration**:
```jsx
const fetchInventory = async () => {
  const response = await inventoryItemsAPI.getInventoryItems({
    status: selectedStatus,
    expiryStatus: selectedExpiryStatus,
    search: searchTerm,
    page: currentPage,
    limit: 20,
  });
};
```

#### Implementation:
```jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Visibility, Add, Remove } from '@mui/icons-material';
import { inventoryItemsAPI } from '../../api/inventory';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    expiryStatus: 'all',
    search: '',
  });

  const getExpiryBadgeColor = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return 'error';
    if (daysUntilExpiry < 30) return 'warning';
    if (daysUntilExpiry < 90) return 'info';
    return 'success';
  };

  const getStatusBadge = (status) => {
    const colors = {
      available: 'success',
      reserved: 'warning',
      expired: 'error',
      depleted: 'default',
    };
    return <Chip label={status} color={colors[status]} size="small" />;
  };
};
```

---

### 5. Update `EditProduct.jsx`

**Location**: `client/src/pages/inventory/EditProduct.jsx`

#### Changes Needed:
Same as AddProduct.jsx - remove stock-related fields, keep only master data fields.

**Important**: When editing a product, do NOT allow changing stock here. Stock is managed through inventory items.

Add section: "Inventory Summary" showing:
- Total stock across all batches
- Number of batches
- Button to manage inventory

---

### 6. Update Routing

**Location**: `client/src/App.jsx` or routing configuration

Add new routes:
```jsx
<Route path="/pharmacist/inventory/add" element={<AddInventory />} />
<Route path="/pharmacist/inventory" element={<InventoryManagement />} />
```

Update navigation menu to include:
- Products Management (master data)
- Inventory Management (stock/batches)

---

## Database Migration

Before using the new frontend, you MUST run the database migration:

```bash
cd server
node migrate-products.js
```

This will:
1. Create a backup of existing products
2. Convert products to new schema (remove stock fields)
3. Create inventory items from existing product stock
4. Handle edge cases (expired items, missing dates)

**Important**: Test the migration on a development database first!

---

## Testing Checklist

After making all changes:

- [ ] Can create a new product (master data only)
- [ ] Can add inventory to an existing product
- [ ] Cannot add duplicate batches (same product + batch + expiry + manufacture)
- [ ] Can view all inventory items
- [ ] Can filter inventory by status/expiry
- [ ] Can adjust stock (increase/decrease)
- [ ] Can edit inventory item details
- [ ] Can view product with inventory summary
- [ ] Can view transaction history
- [ ] Stock alerts work with aggregated inventory
- [ ] Migration script creates backup before running
- [ ] Migration script converts old products correctly

---

## API Endpoints Reference

### Products (Master Data)
- `GET /api/inventory/products` - List all products
- `POST /api/inventory/products` - Create product (master data only)
- `GET /api/inventory/products/:id` - Get single product
- `PUT /api/inventory/products/:id` - Update product (master data only)
- `DELETE /api/inventory/products/:id` - Delete product

### Inventory Items (Stock/Batches)
- `GET /api/inventory/items` - List all inventory items (with filters)
- `POST /api/inventory/items` - Add inventory item (creates or updates batch)
- `GET /api/inventory/items/:id` - Get single inventory item
- `PUT /api/inventory/items/:id` - Update inventory item
- `PATCH /api/inventory/items/:id/adjust` - Adjust stock quantity
- `GET /api/inventory/products/:productId/inventory` - Get all inventory for a product

---

## Common Issues and Solutions

### Issue: "Cannot read property 'currentStock' of undefined"
**Solution**: Update code to use aggregated totalStock from inventory items instead of product.currentStock

### Issue: "Product created but no stock shown"
**Solution**: Stock is now in separate inventory items. Need to add inventory after creating product.

### Issue: "Duplicate batch error"
**Solution**: The system prevents duplicate batches. If you need to add more stock to existing batch, use the "Adjust Stock" feature instead.

### Issue: "Old products don't show in new system"
**Solution**: Run the migration script to convert old products to new schema.

---

## Files Summary

**Files to UPDATE**:
- `client/src/pages/inventory/AddProduct.jsx` - Remove stock fields, add default pricing
- `client/src/pages/inventory/EditProduct.jsx` - Same changes as AddProduct
- `client/src/pages/inventory/ProductsManagement.jsx` - Show inventory summary
- `client/src/App.jsx` - Add new routes

**Files to CREATE**:
- `client/src/pages/inventory/AddInventory.jsx` - Add stock with batch details
- `client/src/pages/inventory/InventoryManagement.jsx` - Manage all inventory items

**Backend Files** (Already complete):
- `server/Model/InventoryItemModel.js` ✅
- `server/Model/ProductModel.js` ✅  
- `server/Controllers/InventoryController.js` ✅
- `server/Routes/InventoryRoutes.js` ✅
- `server/migrate-products.js` ✅
- `client/src/api/inventory.js` ✅

---

## Next Steps

1. **Run migration**: `node server/migrate-products.js` (creates backup first)
2. **Update AddProduct.jsx**: Follow section 1 above
3. **Create AddInventory.jsx**: Follow section 2 above
4. **Update ProductsManagement.jsx**: Follow section 3 above
5. **Create InventoryManagement.jsx**: Follow section 4 above
6. **Test complete workflow**: Create product → Add inventory → View inventory → Adjust stock

---

## Need Help?

Refer to:
- `PRODUCT_INVENTORY_SEPARATION_GUIDE.md` - Complete backend architecture
- `SEPARATION_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- Backend API documentation in the guides

For questions about specific API endpoints or model fields, check the backend controllers and models.
