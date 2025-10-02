# Add Product Feature Guide

## Overview
The Add Product page provides a comprehensive form for adding new products to the pharmacy inventory with all necessary details including buying/selling prices and category management.

## Features

### 1. **Basic Information**
- **Product Name** (Required): Full name of the product
  - Example: Paracetamol 500mg
- **SKU / Product Code** (Required): Unique identifier
  - Example: MED-PAR-500
- **Category** (Required): Product category with category management
- **Barcode**: Product barcode number
- **Description**: Detailed product description

### 2. **Pricing Information**
- **Buying Price** (Required): Cost price per unit in LKR
  - Validation: Must be greater than 0
- **Selling Price** (Required): Retail price per unit in LKR
  - Validation: Must be greater than buying price
- **Profit Margin**: Auto-calculated percentage
  - Formula: `((Selling Price - Buying Price) / Buying Price) × 100`
  - Displays as colored chip (green for positive margin)

### 3. **Stock Information**
- **Initial Stock** (Required): Starting quantity
- **Minimum Stock** (Required): Alert threshold
- **Maximum Stock**: Optional upper limit
- **Unit**: Measurement unit (pieces, boxes, bottles, vials, strips, etc.)
- **Storage Location**: Physical location in storage
- **Reorder Point**: Trigger level for reordering

### 4. **Product Details**
- **Manufacturer**: Product manufacturer name
- **Supplier**: Supplier name
- **Batch Number**: Batch identification
- **Manufacture Date**: Production date
- **Expiry Date**: Expiration date
  - Validation: Must be after manufacture date
- **Prescription Required**: Yes/No
- **Status**: Active, Inactive, or Discontinued
- **Additional Notes**: Any extra information

### 5. **Category Management**
- Click the category icon button to open category dialog
- **Add New Categories**: Create custom categories
- **View All Categories**: List of existing categories
- **Delete Categories**: Remove unused categories
- Categories are saved and available for all products

## Usage

### Adding a New Product

1. **Navigate to Add Product**
   - From Dashboard: Click "Add Product" button
   - From Products Page: Click "Add Product" button
   - URL: `/pharmacist/products/add`

2. **Fill Required Fields** (marked with *)
   - Product Name
   - SKU
   - Category
   - Buying Price
   - Selling Price
   - Initial Stock
   - Minimum Stock

3. **Fill Optional Fields**
   - Add as much detail as possible for better tracking

4. **Managing Categories**
   - Click the category icon (📁) next to category dropdown
   - Type new category name
   - Click "Add" or press Enter
   - Delete categories by clicking trash icon

5. **Validate Pricing**
   - Ensure selling price > buying price
   - Check auto-calculated profit margin
   - Profit margin updates automatically

6. **Submit or Reset**
   - **Save Product**: Validates and saves
   - **Reset**: Clears all fields
   - **Cancel**: Returns to products page

## Validation Rules

### Required Field Validation
- Product Name: Cannot be empty
- SKU: Cannot be empty
- Category: Must select a category
- Buying Price: Must be greater than 0
- Selling Price: Must be greater than buying price
- Initial Stock: Must be 0 or positive
- Minimum Stock: Must be 0 or positive

### Price Validation
- Buying price must be > 0
- Selling price must be > buying price
- Profit margin is auto-calculated

### Date Validation
- Expiry date must be after manufacture date

### Stock Validation
- All stock values must be non-negative
- Minimum stock should be less than initial stock

## Auto-Calculations

### Profit Margin
```javascript
Profit Margin = ((Selling Price - Buying Price) / Buying Price) × 100
```

**Example:**
- Buying Price: LKR 100
- Selling Price: LKR 150
- Profit Margin: ((150 - 100) / 100) × 100 = 50%

## Category Management

### Default Categories
1. Medications
2. Medical Supplies
3. PPE (Personal Protective Equipment)
4. Surgical Instruments
5. Laboratory Supplies
6. First Aid
7. Diagnostic Equipment
8. Disposables

### Adding Custom Categories
1. Click category icon button
2. Enter category name
3. Click "Add" button
4. Category appears in dropdown immediately

### Deleting Categories
1. Open category management dialog
2. Click delete icon next to category
3. Category is removed from list
4. If current product uses this category, it's cleared

## Unit Options
- pieces
- boxes
- bottles
- vials
- strips
- packets
- tablets
- capsules
- ml (milliliters)
- liters
- grams
- kg (kilograms)

## Success Flow

1. ✅ Form submitted successfully
2. ✅ Success notification displayed
3. ✅ Auto-redirect to products page after 1.5 seconds
4. ✅ Product appears in products list

## Error Handling

### Field Errors
- Red outline on invalid fields
- Helper text shows error message
- Form cannot be submitted with errors

### Submission Errors
- Error notification displayed
- Form remains with entered data
- User can correct and resubmit

## Best Practices

### Product Naming
- Use consistent naming format
- Include dosage/size in name
- Example: "Paracetamol 500mg" not just "Paracetamol"

### SKU Format
- Use category prefix (MED-, SUP-, PPE-)
- Include product identifier
- Example: MED-PAR-500, SUP-GLV-M

### Pricing Strategy
- Set competitive selling prices
- Maintain healthy profit margins
- Consider market rates

### Stock Levels
- Set minimum stock based on usage patterns
- Reorder point should be above minimum
- Maximum stock prevents overstocking

### Category Organization
- Use clear, descriptive category names
- Don't create duplicate categories
- Keep categories broad enough to be useful

## Tips

1. **Fill all fields**: More data = better inventory management
2. **Double-check prices**: Verify buying and selling prices
3. **Set appropriate minimums**: Prevent stockouts
4. **Add batch numbers**: Essential for tracking
5. **Use storage locations**: Makes finding products easier
6. **Set expiry dates**: Critical for medications
7. **Use consistent units**: Standardize measurements

## Keyboard Shortcuts

- **Enter in Category Dialog**: Add new category
- **Tab**: Navigate between fields
- **Ctrl/Cmd + S**: Submit form (browser default)

## Mobile Responsive

- Form adapts to all screen sizes
- Fields stack vertically on mobile
- Touch-friendly buttons and inputs
- Optimized for tablet use

## Data Saved

When you click "Save Product", the following data is sent:

```javascript
{
  // Basic Information
  name: "Product Name",
  sku: "SKU Code",
  category: "Category",
  description: "Description",
  barcode: "Barcode",
  
  // Pricing
  buyingPrice: 100.00,
  sellingPrice: 150.00,
  profitMargin: 50.00,
  
  // Stock
  initialStock: 500,
  minStock: 100,
  maxStock: 1000,
  reorderPoint: 150,
  unit: "pieces",
  storageLocation: "Location",
  
  // Details
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  batchNumber: "Batch",
  manufactureDate: "2025-01-01",
  expiryDate: "2027-01-01",
  prescription: "yes/no",
  status: "active",
  notes: "Notes"
}
```

## Next Steps After Adding

After successfully adding a product:
1. Product appears in Products Management page
2. Stock levels are tracked automatically
3. Low stock alerts trigger at minimum threshold
4. Expiry warnings show when approaching expiry date
5. Product available for issuing
6. Included in inventory reports

## Support

For issues or questions:
- Check validation messages
- Ensure all required fields are filled
- Verify price calculations
- Contact system administrator if problems persist

---

**Last Updated**: October 2, 2025
**Version**: 1.0
**Route**: `/pharmacist/products/add`
