# 🛡️ Product Management Form - Complete Validation Guide

## Overview
The Product Management form in the Pharmacist Dashboard has **3 layers of validation** to ensure data integrity and prevent errors.

**Last Updated**: October 9, 2025  
**Form Location**: `client/src/pages/inventory/AddProduct.jsx`  
**Validation Layers**: Frontend → Middleware → Database

---

## 📋 Table of Contents
1. [Frontend Validations](#frontend-validations)
2. [Middleware Validations](#middleware-validations)
3. [Database Schema Validations](#database-schema-validations)
4. [Real-time Validations](#real-time-validations)
5. [Visual Indicators](#visual-indicators)
6. [Error Messages](#error-messages)

---

## 🎯 Layer 1: Frontend Validations

### 🔴 Required Fields (7 fields)

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| **Product Name** | Cannot be empty | "Product name is required" |
| **SKU** | Cannot be empty | "SKU is required" |
| **Category** | Must select a category | "Category is required" |
| **Buying Price** | Must have a value | "Buying price is required" |
| **Selling Price** | Must have a value | "Selling price is required" |
| **Initial Stock** | Must have a value | "Initial stock is required" |
| **Minimum Stock** | Must have a value | "Minimum stock is required" |

### 💰 Price Validations

#### 1. Buying Price
```javascript
// Validation Rule
buyingPrice > 0
```
- ✅ **Valid**: 100, 50.50, 1000
- ❌ **Invalid**: 0, -100, empty

**Error Messages**:
- If empty: `"Buying price is required"`
- If ≤ 0: `"Buying price must be greater than 0"`

#### 2. Selling Price
```javascript
// Validation Rules
sellingPrice > 0
sellingPrice >= buyingPrice
```
- ✅ **Valid**: 150 (if buying = 100)
- ❌ **Invalid**: 0, 50 (if buying = 100)

**Error Messages**:
- If empty: `"Selling price is required"`
- If ≤ 0: `"Selling price must be greater than 0"`
- If < buyingPrice: `"Selling price should be greater than buying price"`

#### 3. Profit Margin (Auto-Calculated)
```javascript
// Formula
profitMargin = ((sellingPrice - buyingPrice) / buyingPrice) × 100
```
- **Read-only field** - No validation needed
- **Example**: Buying = 100, Selling = 150 → Margin = 50%
- **Display**: Green chip if positive, red if negative

### 📦 Stock Validations

#### 1. Initial Stock
```javascript
// Validation Rule
initialStock >= 0
```
- ✅ **Valid**: 0, 100, 500
- ❌ **Invalid**: -10, -100

**Error Messages**:
- If empty: `"Initial stock is required"`
- If < 0: `"Stock cannot be negative"`

#### 2. Minimum Stock
```javascript
// Validation Rule
minStock >= 0
```
- ✅ **Valid**: 0, 10, 50
- ❌ **Invalid**: -5, -100

**Error Messages**:
- If empty: `"Minimum stock is required"`
- If < 0: `"Minimum stock cannot be negative"`

#### 3. Maximum Stock (Optional)
```javascript
// Validation Rule (if provided)
maxStock >= minStock
```
- ✅ **Valid**: 1000 (if min = 100)
- ❌ **Invalid**: 50 (if min = 100)

**Note**: This validation is done on the backend

#### 4. Reorder Point (Optional)
```javascript
// No specific validation
// But logically: minStock < reorderPoint < maxStock
```

### 📅 Date Validations

#### Manufacture Date & Expiry Date
```javascript
// Validation Rule (if both provided)
expiryDate > manufactureDate
```

**Example**:
- ✅ **Valid**: Manufacture = 2025-01-01, Expiry = 2027-01-01
- ❌ **Invalid**: Manufacture = 2025-12-31, Expiry = 2025-01-01

**Error Message**:
- `"Expiry date must be after manufacture date"`

### 📝 Text Field Validations

#### 1. Product Name
```javascript
// Frontend: Cannot be empty (after trim)
name.trim().length > 0
```

#### 2. SKU
```javascript
// Frontend: Cannot be empty (after trim)
sku.trim().length > 0

// Backend: Must be unique & valid format
// Format: Letters, numbers, hyphens, underscores only
// Example: MED-PAR-500, SUP-001, TEST_PRODUCT
```

#### 3. Description (Optional)
- No validation required
- Any text allowed

#### 4. Barcode (Optional)
```javascript
// Frontend: No validation
// Backend: Must be unique if provided
```

---

## 🔒 Layer 2: Middleware Validations

**Location**: `server/Middleware/validationMiddleware.js`

### Required Fields
```javascript
validateProduct = (req, res, next) => {
  const errors = [];
  
  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (name.length < 3) {
    errors.push('Product name must be at least 3 characters long');
  } else if (name.length > 200) {
    errors.push('Product name must not exceed 200 characters');
  }
  
  // SKU validation
  if (!sku || sku.trim().length === 0) {
    errors.push('SKU is required');
  } else if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
    errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
  }
  
  // Price validations
  if (buyingPrice <= 0) {
    errors.push('Buying price must be greater than 0');
  }
  
  if (sellingPrice < buyingPrice) {
    errors.push('Selling price must be greater than or equal to buying price');
  }
  
  // Stock validations
  if (initialStock < 0) {
    errors.push('Initial stock cannot be negative');
  }
  
  if (minStock < 0) {
    errors.push('Minimum stock cannot be negative');
  }
  
  if (maxStock && maxStock < minStock) {
    errors.push('Maximum stock must be greater than or equal to minimum stock');
  }
  
  // Date validation
  if (manufactureDate && expiryDate) {
    if (new Date(expiryDate) <= new Date(manufactureDate)) {
      errors.push('Expiry date must be after manufacture date');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};
```

### Additional Middleware Checks

#### SKU Format Validation
```javascript
// Regex pattern
/^[A-Za-z0-9\-_]+$/

// Valid examples:
✅ MED-PAR-500
✅ SUP_GLV_001
✅ TEST-123
✅ PRODUCT_001

// Invalid examples:
❌ MED PAR 500 (spaces)
❌ MED@PAR (special chars)
❌ MED/PAR (slashes)
```

#### Number Type Validation
```javascript
// Ensures values are valid numbers
if (isNaN(buyingPrice)) {
  errors.push('Buying price must be a valid number');
}

// Ensures integers for stock values
if (!Number.isInteger(stockNum)) {
  errors.push('Stock must be a whole number');
}
```

---

## 🗄️ Layer 3: Database Schema Validations

**Location**: `server/Model/ProductModel.js`

### Schema Validation Rules

```javascript
const productSchema = new Schema({
  // Product Name
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  // SKU
  sku: { 
    type: String, 
    required: [true, 'SKU is required'],
    unique: true,  // Prevents duplicate SKUs
    uppercase: true,  // Auto-converts to uppercase
    trim: true
  },
  
  // Category
  category: { 
    type: String, 
    required: [true, 'Category is required']
  },
  
  // Buying Price
  buyingPrice: { 
    type: Number, 
    required: [true, 'Buying price is required'],
    min: [0.01, 'Buying price must be greater than 0']
  },
  
  // Selling Price
  sellingPrice: { 
    type: Number, 
    required: [true, 'Selling price is required'],
    min: [0.01, 'Selling price must be greater than 0'],
    validate: {
      validator: function(value) {
        return value >= this.buyingPrice;
      },
      message: 'Selling price must be greater than or equal to buying price'
    }
  },
  
  // Current Stock
  currentStock: { 
    type: Number, 
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  // Minimum Stock
  minStock: { 
    type: Number, 
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative']
  },
  
  // Maximum Stock
  maxStock: { 
    type: Number,
    min: [0, 'Maximum stock cannot be negative']
  },
  
  // Unit
  unit: { 
    type: String, 
    required: [true, 'Unit is required'],
    enum: ['pieces', 'boxes', 'bottles', 'vials', 'strips', 
           'packets', 'tablets', 'capsules', 'ml', 'liters', 
           'grams', 'kg']
  },
  
  // Expiry Date
  expiryDate: { 
    type: Date,
    validate: {
      validator: function(value) {
        if (!value || !this.manufactureDate) return true;
        return value > this.manufactureDate;
      },
      message: 'Expiry date must be after manufacture date'
    }
  },
  
  // Barcode (optional but unique)
  barcode: {
    type: String,
    unique: true,
    sparse: true  // Allows multiple null values
  }
});
```

### Unique Constraints

#### 1. SKU Uniqueness
```javascript
// Database enforces unique SKU
// Error message from backend:
"Product with this SKU already exists"
```

#### 2. Barcode Uniqueness (if provided)
```javascript
// Database enforces unique barcode
// Error message from backend:
"Product with this barcode already exists"
```

---

## ⚡ Real-time Validations

### 1. Profit Margin Auto-Calculation
```javascript
// Triggers on: buyingPrice or sellingPrice change
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'buyingPrice' || name === 'sellingPrice') {
    const buying = name === 'buyingPrice' ? parseFloat(value) : parseFloat(formData.buyingPrice);
    const selling = name === 'sellingPrice' ? parseFloat(value) : parseFloat(formData.sellingPrice);
    
    if (buying && selling && buying > 0) {
      const margin = ((selling - buying) / buying * 100).toFixed(2);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        profitMargin: margin
      }));
    }
  }
};
```

**Example**:
- User types Buying Price: 100
- User types Selling Price: 150
- Profit Margin instantly shows: 50%
- Display: Green chip with "50%"

### 2. Error Clearing on Input
```javascript
// Automatically clears error when user starts typing
if (errors[name]) {
  setErrors(prev => ({
    ...prev,
    [name]: ''
  }));
}
```

---

## 🎨 Visual Validation Indicators

### 1. Invalid Fields
```javascript
// Red outline + helper text
<TextField
  error={!!errors.name}
  helperText={errors.name}
  // Field turns red when error exists
/>
```

**Visual Appearance**:
- 🔴 **Red border** around the field
- 🔴 **Red error text** below the field
- ⚠️ **Error icon** (optional)

### 2. Valid Fields
```javascript
// Normal blue outline (MUI default)
// No error indicator shown
```

### 3. Profit Margin Chip
```javascript
<Chip
  label={`${profitMargin}%`}
  size="small"
  color={parseFloat(profitMargin) > 0 ? 'success' : 'error'}
/>
```

**Visual Appearance**:
- 🟢 **Green chip** if profit margin > 0
- 🔴 **Red chip** if profit margin ≤ 0

### 4. Snackbar Notifications

#### Error Snackbar (Red)
```javascript
// Appears when form validation fails
"Please fix all errors before submitting"
"Product with this SKU already exists"
"Validation failed"
```

#### Success Snackbar (Green)
```javascript
// Appears when product is successfully created
"Product added successfully!"
```

---

## 💬 Complete Error Messages Reference

### Required Field Errors
| Field | Error Message |
|-------|--------------|
| Product Name | "Product name is required" |
| SKU | "SKU is required" |
| Category | "Category is required" |
| Buying Price | "Buying price is required" |
| Selling Price | "Selling price is required" |
| Initial Stock | "Initial stock is required" |
| Minimum Stock | "Minimum stock is required" |

### Value Validation Errors
| Field | Condition | Error Message |
|-------|-----------|--------------|
| Product Name | < 3 chars | "Product name must be at least 3 characters long" |
| Product Name | > 200 chars | "Product name must not exceed 200 characters" |
| SKU | Invalid format | "SKU can only contain letters, numbers, hyphens, and underscores" |
| SKU | Duplicate | "Product with this SKU already exists" |
| Buying Price | ≤ 0 | "Buying price must be greater than 0" |
| Selling Price | ≤ 0 | "Selling price must be greater than 0" |
| Selling Price | < Buying Price | "Selling price should be greater than buying price" |
| Initial Stock | < 0 | "Stock cannot be negative" |
| Minimum Stock | < 0 | "Minimum stock cannot be negative" |
| Maximum Stock | < Minimum Stock | "Maximum stock must be greater than or equal to minimum stock" |
| Expiry Date | ≤ Manufacture Date | "Expiry date must be after manufacture date" |
| Barcode | Duplicate | "Product with this barcode already exists" |

### General Errors
| Scenario | Error Message |
|----------|--------------|
| Form has errors | "Please fix all errors before submitting" |
| Network error | "Error adding product. Please try again." |
| Server error | Error message from backend response |
| Validation failed | "Validation failed" + list of errors |

---

## 🧪 Validation Testing Examples

### Test Case 1: Empty Form Submission
```javascript
// Action: Submit empty form
// Expected: 7 validation errors

❌ "Product name is required"
❌ "SKU is required"
❌ "Category is required"
❌ "Buying price is required"
❌ "Selling price is required"
❌ "Initial stock is required"
❌ "Minimum stock is required"
```

### Test Case 2: Invalid Prices
```javascript
// Input:
buyingPrice = 200
sellingPrice = 100

// Expected:
❌ "Selling price should be greater than buying price"
```

### Test Case 3: Negative Stock
```javascript
// Input:
initialStock = -10

// Expected:
❌ "Stock cannot be negative"
```

### Test Case 4: Invalid Dates
```javascript
// Input:
manufactureDate = "2025-12-31"
expiryDate = "2025-01-01"

// Expected:
❌ "Expiry date must be after manufacture date"
```

### Test Case 5: Duplicate SKU
```javascript
// Input:
sku = "MED-001"  // Already exists in database

// Expected (from backend):
❌ "Product with this SKU already exists"
```

### Test Case 6: Valid Product
```javascript
// Input:
name = "Paracetamol 500mg"
sku = "MED-PAR-500"
category = "Medications"
buyingPrice = 100
sellingPrice = 150
initialStock = 500
minStock = 50

// Expected:
✅ Form submits successfully
✅ "Product added successfully!"
✅ Redirects to products page
```

---

## 📊 Validation Summary Table

| Validation Type | Location | Trigger | Purpose |
|----------------|----------|---------|---------|
| **Required Fields** | Frontend | Form submit | Ensure critical data present |
| **Price Validation** | Frontend + Backend | Form submit | Prevent negative/invalid prices |
| **Stock Validation** | Frontend + Backend | Form submit | Prevent negative stock |
| **Date Validation** | Frontend + Backend | Form submit | Ensure logical date ranges |
| **SKU Format** | Middleware | API call | Ensure valid SKU format |
| **SKU Uniqueness** | Controller + DB | API call | Prevent duplicates |
| **Barcode Uniqueness** | Controller + DB | API call | Prevent duplicates |
| **Name Length** | Middleware + DB | API call | Ensure reasonable length |
| **Number Type** | Middleware | API call | Ensure correct data types |
| **Unit Enum** | Database | Save | Ensure valid unit value |
| **Profit Margin** | Frontend | Real-time | Auto-calculate margin |
| **Error Clearing** | Frontend | Input change | Improve UX |

---

## 🎯 Best Practices

### 1. User Experience
✅ **Show errors immediately** when user submits form  
✅ **Clear errors** when user starts correcting  
✅ **Disable submit** button during API call  
✅ **Show loading** spinner for feedback  
✅ **Display success** message before redirect  

### 2. Data Integrity
✅ **Validate on frontend** for instant feedback  
✅ **Validate on backend** for security  
✅ **Validate in database** for data consistency  
✅ **Use unique constraints** for SKU and barcode  

### 3. Error Handling
✅ **Show specific** error messages  
✅ **Group related** validations  
✅ **Provide examples** in helper text  
✅ **Use color coding** (red = error, green = success)  

---

## 🔄 Validation Flow Diagram

```
USER INPUTS DATA
    ↓
REAL-TIME CALCULATIONS
(Profit Margin)
    ↓
USER CLICKS SUBMIT
    ↓
FRONTEND VALIDATION
    ├─ ❌ Errors Found → Display red fields + snackbar
    └─ ✅ No Errors → Continue
    ↓
FORM DATA TRANSFORMATION
(String → Number, etc.)
    ↓
API CALL TO BACKEND
    ↓
MIDDLEWARE VALIDATION
    ├─ ❌ Validation Failed → 400 Error + Error Array
    └─ ✅ Validation Passed → Continue
    ↓
CONTROLLER CHECKS
    ├─ ❌ Duplicate SKU → 400 Error
    ├─ ❌ Duplicate Barcode → 400 Error
    └─ ✅ Unique → Continue
    ↓
DATABASE SCHEMA VALIDATION
    ├─ ❌ Schema Error → 400 Error
    └─ ✅ Valid → Save
    ↓
PRODUCT SAVED
    ↓
ACTIVITY LOG CREATED
    ↓
SUCCESS RESPONSE
    ↓
SUCCESS SNACKBAR
    ↓
AUTO-REDIRECT
```

---

## 📝 Quick Reference Checklist

### Before Submission
- [ ] Product Name filled (3-200 chars)
- [ ] SKU filled (letters, numbers, hyphens, underscores only)
- [ ] Category selected
- [ ] Buying Price > 0
- [ ] Selling Price > Buying Price
- [ ] Initial Stock ≥ 0
- [ ] Minimum Stock ≥ 0
- [ ] Unit selected
- [ ] If dates provided: Expiry > Manufacture

### After Submission
- [ ] No red error fields
- [ ] Loading spinner shows
- [ ] Success message appears
- [ ] Redirects to products page
- [ ] Product appears in list

---

## 🎓 Summary

The Product Management form has **comprehensive 3-layer validation**:

1. **Frontend**: Immediate feedback, user-friendly errors
2. **Middleware**: Server-side validation, format checking
3. **Database**: Schema enforcement, unique constraints

**Total Validation Rules**: 20+  
**Required Fields**: 7  
**Optional Fields**: 15  
**Real-time Validations**: 2 (Profit Margin, Error Clearing)  
**Unique Constraints**: 2 (SKU, Barcode)

This ensures **data integrity**, **prevents errors**, and provides an **excellent user experience**! 🎉

---

**Last Updated**: October 9, 2025  
**Maintained By**: Osethra Development Team
