# 🧪 Product Insert API - Quick Testing Script

## Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:5173` (or your Vite port)
- Valid JWT token from pharmacist login

---

## Test 1: Successful Product Creation

### Using cURL (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    name = "Paracetamol 500mg"
    sku = "MED-PAR-500"
    category = "Medications"
    description = "Pain reliever and fever reducer"
    manufacturer = "ABC Pharma"
    supplier = "XYZ Supplies"
    buyingPrice = 100
    sellingPrice = 150
    initialStock = 500
    minStock = 50
    maxStock = 1000
    reorderPoint = 100
    unit = "pieces"
    batchNumber = "BATCH2025-001"
    manufactureDate = "2025-01-01"
    expiryDate = "2027-01-01"
    storageLocation = "Shelf A, Row 3"
    barcode = "1234567890123"
    prescription = $false
    status = "active"
    notes = "Keep in cool, dry place"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Expected Response
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "...",
    "name": "Paracetamol 500mg",
    "sku": "MED-PAR-500",
    "currentStock": 500,
    "profitMargin": 50
  }
}
```

---

## Test 2: Validation Error (Missing Required Fields)

### Using cURL (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    name = "Incomplete Product"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Expected Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "SKU is required",
    "Category is required",
    "Buying price is required",
    "Selling price is required",
    "Initial stock is required",
    "Minimum stock is required",
    "Unit is required"
  ]
}
```

---

## Test 3: Duplicate SKU Error

### Step 1: Create first product
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    name = "Test Product 1"
    sku = "TEST-001"
    category = "Medications"
    buyingPrice = 100
    sellingPrice = 150
    initialStock = 100
    minStock = 10
    unit = "pieces"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Step 2: Try to create duplicate (same SKU)
```powershell
$body2 = @{
    name = "Test Product 2"
    sku = "TEST-001"  # Same SKU!
    category = "Medications"
    buyingPrice = 100
    sellingPrice = 150
    initialStock = 100
    minStock = 10
    unit = "pieces"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body2
```

### Expected Response (400)
```json
{
  "success": false,
  "message": "Product with this SKU already exists"
}
```

---

## Test 4: Invalid Pricing (Selling < Buying)

### Using cURL (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    name = "Invalid Price Product"
    sku = "TEST-PRICE-001"
    category = "Medications"
    buyingPrice = 200
    sellingPrice = 100  # Less than buying price!
    initialStock = 100
    minStock = 10
    unit = "pieces"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Expected Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Selling price must be greater than or equal to buying price"
  ]
}
```

---

## Test 5: Invalid Date (Expiry before Manufacture)

### Using cURL (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    name = "Invalid Date Product"
    sku = "TEST-DATE-001"
    category = "Medications"
    buyingPrice = 100
    sellingPrice = 150
    initialStock = 100
    minStock = 10
    unit = "pieces"
    manufactureDate = "2025-12-31"
    expiryDate = "2025-01-01"  # Before manufacture date!
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Expected Response (400)
```json
{
  "success": false,
  "message": "Expiry date must be after manufacture date"
}
```

---

## Test 6: Unauthorized Access (No Token)

### Using cURL (PowerShell)
```powershell
$body = @{
    name = "Unauthorized Product"
    sku = "TEST-UNAUTH-001"
    category = "Medications"
    buyingPrice = 100
    sellingPrice = 150
    initialStock = 100
    minStock = 10
    unit = "pieces"
} | ConvertTo-Json

# No Authorization header!
Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Expected Response (401)
```json
{
  "success": false,
  "message": "Not authorized, token required"
}
```

---

## Frontend Testing Checklist

### Manual UI Testing

1. **Navigate to Add Product Page**
   - [ ] Login as pharmacist
   - [ ] Go to `/pharmacist/products/add`
   - [ ] Page loads successfully
   - [ ] All form fields are visible

2. **Test Required Field Validation**
   - [ ] Click "Save Product" without filling form
   - [ ] Red error messages appear
   - [ ] Fields have red outline
   - [ ] Snackbar shows "Please fix all errors"

3. **Test Profit Margin Calculation**
   - [ ] Enter Buying Price: 100
   - [ ] Enter Selling Price: 150
   - [ ] Profit Margin auto-calculates to 50%
   - [ ] Green chip displays the margin

4. **Test Price Validation**
   - [ ] Enter Selling Price < Buying Price
   - [ ] Error appears: "Selling price should be greater than buying price"
   - [ ] Cannot submit form

5. **Test Category Management**
   - [ ] Click category icon button
   - [ ] Dialog opens with category list
   - [ ] Add new category "Test Category"
   - [ ] Category appears in dropdown
   - [ ] Delete a category
   - [ ] Category removed from dropdown

6. **Test Successful Submission**
   - [ ] Fill all required fields correctly
   - [ ] Click "Save Product"
   - [ ] Button shows loading spinner
   - [ ] Button text changes to "Saving..."
   - [ ] All buttons disabled during submission
   - [ ] Green snackbar: "Product added successfully!"
   - [ ] Auto-redirect to products page after 1.5s
   - [ ] New product appears in products list

7. **Test Error Handling**
   - [ ] Try to add product with duplicate SKU
   - [ ] Red snackbar shows: "Product with this SKU already exists"
   - [ ] Form remains with entered data
   - [ ] Can correct SKU and resubmit

8. **Test Date Validation**
   - [ ] Enter Manufacture Date: 2025-12-31
   - [ ] Enter Expiry Date: 2025-01-01
   - [ ] Error: "Expiry date must be after manufacture date"
   - [ ] Cannot submit

9. **Test Reset Button**
   - [ ] Fill form with data
   - [ ] Click "Reset" button
   - [ ] All fields cleared to initial state
   - [ ] No errors shown

10. **Test Cancel Button**
    - [ ] Click "Cancel" button
    - [ ] Navigates back to products page
    - [ ] No data saved

---

## Browser Console Testing

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit form
4. Check request:
   - [ ] Method: POST
   - [ ] URL: `/api/inventory/products`
   - [ ] Headers include Authorization
   - [ ] Request payload has correct data
   - [ ] Response status: 201
   - [ ] Response has success: true

### Check Console Tab
1. Open Console tab
2. Look for errors
3. Should see:
   - [ ] No red errors
   - [ ] API response logged (from productsAPI)
   - [ ] No CORS errors
   - [ ] No 401/403 errors

---

## Quick Test Data Sets

### Test Set 1: Minimum Required Fields
```json
{
  "name": "Aspirin 100mg",
  "sku": "MED-ASP-100",
  "category": "Medications",
  "buyingPrice": 50,
  "sellingPrice": 75,
  "initialStock": 200,
  "minStock": 20,
  "unit": "tablets"
}
```

### Test Set 2: Complete Product
```json
{
  "name": "Amoxicillin 500mg Capsules",
  "sku": "MED-AMX-500",
  "category": "Medications",
  "description": "Antibiotic for bacterial infections",
  "manufacturer": "PharmaCorp Ltd",
  "supplier": "MediSupply Inc",
  "buyingPrice": 250,
  "sellingPrice": 350,
  "initialStock": 1000,
  "minStock": 100,
  "maxStock": 5000,
  "reorderPoint": 200,
  "unit": "capsules",
  "batchNumber": "AMX2025-Q1-001",
  "manufactureDate": "2025-01-15",
  "expiryDate": "2028-01-15",
  "storageLocation": "Refrigerator A, Shelf 2",
  "barcode": "8901234567890",
  "prescription": true,
  "status": "active",
  "notes": "Store at 2-8°C. Prescription required."
}
```

### Test Set 3: Medical Supply
```json
{
  "name": "Surgical Gloves (Medium)",
  "sku": "SUP-GLV-M",
  "category": "Medical Supplies",
  "description": "Latex-free surgical gloves",
  "manufacturer": "MedGlove Co",
  "supplier": "Healthcare Supplies Ltd",
  "buyingPrice": 15,
  "sellingPrice": 25,
  "initialStock": 5000,
  "minStock": 500,
  "maxStock": 20000,
  "reorderPoint": 1000,
  "unit": "pieces",
  "batchNumber": "GLV-2025-M-001",
  "manufactureDate": "2025-10-01",
  "expiryDate": "2030-10-01",
  "storageLocation": "Storage Room B, Cabinet 5",
  "prescription": false,
  "status": "active"
}
```

---

## Getting JWT Token

### Method 1: From Browser
1. Login to the application as pharmacist
2. Open DevTools (F12) → Application tab
3. Go to Local Storage or Session Storage
4. Find the token (usually stored as 'token' or 'authToken')
5. Copy the value

### Method 2: Login API Call
```powershell
# Login first
$loginBody = @{
    email = "pharmacist@osethra.com"
    password = "pharmacist123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginBody

# Extract token
$token = $response.token
Write-Host "Token: $token"
```

---

## Troubleshooting

### Issue: "Cannot find module 'api/inventory'"
**Solution**: Check import path in AddProduct.jsx
```javascript
import { productsAPI } from '../../api/inventory';
```

### Issue: "CORS error"
**Solution**: Ensure backend has CORS enabled in app.js
```javascript
const cors = require('cors');
app.use(cors());
```

### Issue: "Network Error"
**Solution**: 
1. Check backend is running: `cd server && npm start`
2. Verify URL in axiosConfig.js matches backend port
3. Check firewall settings

### Issue: "401 Unauthorized"
**Solution**: 
1. Ensure you're logged in
2. Check token is valid and not expired
3. Verify Authorization header format: `Bearer <token>`

### Issue: Form submits but product not appearing
**Solution**:
1. Check MongoDB connection
2. Verify database name
3. Check Products collection
4. Refresh products page

---

## Success Criteria

✅ **Integration is successful if:**
1. Form submits without errors
2. Loading state shows during submission
3. Success message appears
4. Redirects to products page
5. New product appears in products list
6. Product data in database matches form input
7. Activity log created in database
8. All validations work correctly
9. Error messages display properly
10. Can add multiple products without issues

---

## Performance Testing

### Load Testing (Optional)
```powershell
# Create 10 products rapidly
1..10 | ForEach-Object {
    $body = @{
        name = "Test Product $_"
        sku = "TEST-$_"
        category = "Medications"
        buyingPrice = 100
        sellingPrice = 150
        initialStock = 100
        minStock = 10
        unit = "pieces"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $body
}
```

---

## Clean Up Test Data

### Delete all test products
```powershell
# Get all products with SKU starting with "TEST-"
$products = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products?search=TEST" `
    -Headers @{"Authorization" = "Bearer $token"}

# Delete each test product
$products.data.products | ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/products/$($_.id)" `
        -Method DELETE `
        -Headers @{"Authorization" = "Bearer $token"}
}
```

---

**Happy Testing! 🧪**
