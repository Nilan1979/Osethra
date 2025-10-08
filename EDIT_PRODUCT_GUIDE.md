# Edit Product Feature Guide

## Overview
The Edit Product page allows pharmacists to update existing product information, modify pricing, adjust stock levels, and manage all product details with full validation and change tracking.

## Features

### 1. **Loading State**
- Displays loading spinner while fetching product data
- Shows "Loading product data..." message
- Smooth transition to form once data is loaded

### 2. **Unsaved Changes Indicator**
- Yellow "Unsaved Changes" chip in header
- Appears when form data differs from original
- Helps prevent accidental data loss

### 3. **All Product Fields** (Same as Add Product)
- **Basic Information**: Name, SKU, Category, Barcode, Description
- **Pricing**: Buying Price, Selling Price, Auto-calculated Profit Margin
- **Stock**: Current Stock, Min/Max Stock, Unit, Storage Location, Reorder Point
- **Details**: Manufacturer, Supplier, Batch Number, Dates, Prescription, Status, Notes

### 4. **Smart Features**
- Auto-calculate profit margin when prices change
- Real-time field validation
- Compare changes with original data
- Reset to original values
- Category management

## Usage

### Accessing Edit Product

**Method 1: From Products List**
1. Navigate to Products Management (`/pharmacist/products`)
2. Find the product you want to edit
3. Click the **Edit** icon (✏️) on the product card
4. Edit page opens with product data loaded

**Method 2: Direct URL**
- `/pharmacist/products/edit/{productId}`
- Example: `/pharmacist/products/edit/1`

### Editing a Product

1. **Wait for Data to Load**
   - Loading spinner appears
   - Product data populates form fields
   - Form becomes editable

2. **Modify Fields**
   - Change any field you need
   - "Unsaved Changes" chip appears in header
   - Validation happens in real-time

3. **Review Changes**
   - Modified fields highlighted by validation
   - Auto-calculated fields update immediately
   - Check profit margin calculation

4. **Save or Reset**
   - **Update Product**: Saves changes to database
   - **Reset**: Reverts to original loaded values
   - **Cancel**: Returns to products list without saving

## Key Differences from Add Product

### Changed Fields
- **Initial Stock** → **Current Stock**
  - Shows actual current inventory level
  - Can be adjusted for corrections

### Additional Features
- **Loading State**: Fetches existing data from database
- **Original Data Tracking**: Remembers initial values
- **Change Detection**: Knows when form is modified
- **Reset Functionality**: Restore to loaded values
- **Unsaved Changes Warning**: Visual indicator of modifications

### Disabled States
- **Update Button**: Disabled when no changes made
- **Reset Button**: Disabled when no changes made
- Prevents unnecessary API calls

## Validation Rules

### Same as Add Product
All validation rules from Add Product apply:
- Required fields must be filled
- Prices must be positive
- Selling price > Buying price
- Stock values non-negative
- Expiry date after manufacture date

### Additional Validations
- Product ID must exist
- Cannot change to invalid category
- Cannot set negative stock

## Auto-Calculations

### Profit Margin
```javascript
Profit Margin = ((Selling Price - Buying Price) / Buying Price) × 100
```

Updates automatically when either price changes.

**Example:**
- Original: Buying LKR 100, Selling LKR 150 = 50% margin
- Updated: Selling LKR 175 = 75% margin (auto-calculated)

## Change Tracking

### How It Works
1. **Load**: Original data saved to `originalData` state
2. **Edit**: Form data updates in `formData` state
3. **Compare**: `hasChanges()` compares JSON strings
4. **Indicate**: Shows chip if data differs

### Visual Indicators
- **Unsaved Changes Chip**: Yellow chip in header
- **Modified Fields**: Normal appearance (no special highlight)
- **Button States**: Update/Reset disabled when no changes

## Reset Functionality

### Reset Button
- **Purpose**: Discard all changes, restore original values
- **Behavior**: 
  - Reverts all fields to loaded state
  - Clears validation errors
  - Shows info notification
  - Disabled when no changes exist

### When to Use Reset
- Made mistakes in multiple fields
- Want to start editing over
- Need to see original values

## Success Flow

1. ✅ User modifies product data
2. ✅ Clicks "Update Product"
3. ✅ Validation passes
4. ✅ Data sent to API (simulated)
5. ✅ Success notification shown
6. ✅ Auto-redirect to products list after 1.5s
7. ✅ Changes reflected in products list

## Error Handling

### Loading Errors
- Failed to fetch product data
- Invalid product ID
- Network error

**Result**: Error notification, option to retry or go back

### Validation Errors
- Required fields empty
- Invalid price values
- Invalid date ranges

**Result**: Red outlines, error messages, submit blocked

### Save Errors
- API failure
- Network timeout
- Server error

**Result**: Error notification, data preserved, can retry

## Category Management

Same as Add Product:
- Click category icon to open dialog
- Add new categories
- Delete unused categories
- Changes apply immediately

## Mock Data

### Example Product Loaded
```javascript
{
  id: 1,
  name: "Paracetamol 500mg",
  sku: "MED-PAR-500",
  category: "Medications",
  description: "Pain relief and fever reduction",
  manufacturer: "Ceylon Pharmaceuticals",
  supplier: "MedSupply Lanka",
  buyingPrice: "12.50",
  sellingPrice: "15.00",
  profitMargin: "20.00",
  currentStock: "450",
  minStock: "100",
  maxStock: "1000",
  reorderPoint: "150",
  unit: "tablets",
  batchNumber: "PAR2024-089",
  manufactureDate: "2024-01-15",
  expiryDate: "2026-03-15",
  storageLocation: "Shelf A, Row 3",
  barcode: "8901234567890",
  prescription: "no",
  status: "active",
  notes: "Store in cool, dry place"
}
```

## Best Practices

### Before Editing
1. ✅ Verify you have the correct product
2. ✅ Check current stock levels
3. ✅ Note batch numbers if applicable
4. ✅ Verify expiry dates

### During Editing
1. ✅ Update all related fields together
2. ✅ Verify price calculations
3. ✅ Check stock adjustments
4. ✅ Update dates if batch changed
5. ✅ Add notes about changes

### After Editing
1. ✅ Review changes before saving
2. ✅ Verify stock levels are correct
3. ✅ Check alerts after update
4. ✅ Confirm changes in product list

## Common Edit Scenarios

### 1. Stock Adjustment
**Scenario**: Physical stock count differs from system
```
Current Stock: 450 → 425 (Adjusted)
Note: "Stock count adjustment - Oct 2, 2025"
```

### 2. Price Update
**Scenario**: Supplier price increased
```
Buying Price: LKR 12.50 → LKR 14.00
Selling Price: LKR 15.00 → LKR 17.00
Profit Margin: 20% → 21.43% (auto-calculated)
```

### 3. Batch Change
**Scenario**: New batch received
```
Batch Number: PAR2024-089 → PAR2025-012
Manufacture Date: 2024-01-15 → 2025-01-10
Expiry Date: 2026-03-15 → 2027-01-10
```

### 4. Status Change
**Scenario**: Discontinuing product
```
Status: Active → Discontinued
Notes: "Product discontinued by manufacturer - Oct 2025"
```

### 5. Storage Update
**Scenario**: Reorganized storage
```
Storage Location: Shelf A, Row 3 → Shelf B, Row 1
```

## URL Parameters

### Route Pattern
```
/pharmacist/products/edit/:id
```

### Examples
- `/pharmacist/products/edit/1` - Edit product ID 1
- `/pharmacist/products/edit/42` - Edit product ID 42

### Invalid IDs
- Non-existent ID shows error
- Invalid format shows error
- Redirects to products list

## Keyboard Shortcuts

- **Enter**: Submit form (on focused submit button)
- **Esc**: Close category dialog
- **Tab**: Navigate between fields
- **Ctrl/Cmd + Z**: Browser undo (text fields)

## Mobile Responsive

- Fields stack vertically on mobile
- Touch-friendly buttons
- Optimized form layout
- Easy category management
- Smooth scrolling

## API Integration

### Fetch Product (GET)
```javascript
// TODO: Replace mock with actual API
GET /api/inventory/products/:id
Response: Product object
```

### Update Product (PUT)
```javascript
// TODO: Replace mock with actual API
PUT /api/inventory/products/:id
Body: Updated product data
Response: Updated product object
```

## Notifications

### Success Messages
- ✅ "Product updated successfully!"
- ✅ "Category added successfully!"
- ✅ "Category deleted successfully!"
- ℹ️ "Form reset to original values"

### Error Messages
- ❌ "Error loading product data"
- ❌ "Please fix all errors before submitting"
- ❌ "Error updating product. Please try again."

## Data Comparison

### Change Detection
```javascript
// Compares stringified JSON
const hasChanges = () => {
  return JSON.stringify(formData) !== JSON.stringify(originalData);
};
```

### What Triggers Changes
- Any field modification
- Price adjustments
- Stock updates
- Status changes
- Category changes
- Notes additions

### What Doesn't Trigger
- Focus/blur events
- Opening dialogs
- Field hover
- Validation display

## Tips for Efficient Editing

1. **Batch Similar Changes**: Edit multiple products in one session
2. **Use Reset Wisely**: Only when major changes need undoing
3. **Verify Calculations**: Check auto-calculated profit margins
4. **Add Notes**: Document why changes were made
5. **Update Related Fields**: Change batch, dates, and notes together
6. **Check Stock Alerts**: Verify if changes affect alert thresholds
7. **Confirm Prices**: Double-check buying/selling prices

## Troubleshooting

### Product Not Loading
- Check product ID in URL
- Verify product exists
- Check network connection
- Try refreshing page

### Changes Not Saving
- Check for validation errors
- Ensure all required fields filled
- Verify network connection
- Check browser console for errors

### Profit Margin Not Updating
- Ensure both prices are valid numbers
- Buying price must be > 0
- Refresh page if stuck

### Reset Not Working
- Ensure changes were made
- Check if button is enabled
- Try refreshing page

## Support

For issues or questions:
- Review validation messages
- Check console for errors
- Verify all required fields
- Try resetting form
- Contact system administrator

---

**Last Updated**: October 2, 2025
**Version**: 1.0
**Route**: `/pharmacist/products/edit/:id`
**Related**: Add Product, Products Management
