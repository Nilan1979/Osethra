# 🚀 Inventory Management Backend - Setup & Testing Guide

## Quick Start Guide

### Prerequisites
- Node.js installed (v14+)
- MongoDB running locally or connection string ready
- VS Code or any code editor

### Step 1: Environment Setup

Create a `.env` file in the `server` directory if not already exists:

```env
MONGO_URI=mongodb://localhost:27017/osethra-hospital
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

### Step 2: Install Dependencies

```bash
cd server
npm install
```

### Step 3: Seed the Database with Sample Data

Run the inventory seed script to populate your database with real medical inventory data:

```bash
node seed-inventory.js
```

**What this creates:**
- ✅ 8 default categories (Medications, Medical Supplies, PPE, etc.)
- ✅ 51 products across all categories
  - 18 Medications (Paracetamol, Amoxicillin, Insulin, etc.)
  - 10 Medical Supplies (Gauze, Syringes, IV Cannula, etc.)
  - 5 PPE items (N95 masks, Gowns, Face Shields, etc.)
  - 3 Surgical Instruments (Scissors, Forceps, Scalpel Blades)
  - 3 Laboratory Supplies (Blood Collection Tubes, COVID Test Kits, etc.)
  - 2 First Aid items
  - 2 Diagnostic Equipment (Stethoscope, Pulse Oximeter)
  - 5 Disposables
  - 3 Special test items (Expired, Low Stock, Out of Stock)
- ✅ 3 Sample prescriptions (1 completed, 2 pending)

### Step 4: Start the Backend Server

```bash
npm start
# or for development with auto-restart
npm run dev
```

The server will start on `http://localhost:5000`

### Step 5: Start the Frontend

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🧪 Testing the Backend

### Create a Pharmacist User

Before testing inventory endpoints, you need a pharmacist account. Use the existing user creation endpoint or add a pharmacist directly via MongoDB:

**Option 1: Via API (Register endpoint)**
```bash
POST http://localhost:5000/users
Content-Type: application/json

{
  "name": "Pharmacy Manager",
  "email": "pharmacist@hospital.com",
  "password": "pharmacist123",
  "role": "pharmacist",
  "contactNo": "+1-555-0199",
  "address": "Hospital Pharmacy Department"
}
```

**Option 2: Login with existing user**
If you've run `seed-doctor.js`, you can create an admin or pharmacist user manually.

### Login to Get JWT Token

```bash
POST http://localhost:5000/users/login
Content-Type: application/json

{
  "email": "pharmacist@hospital.com",
  "password": "pharmacist123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "pharmacist"
}
```

**Copy the token** - you'll need it for all inventory requests!

---

## 📡 API Endpoints Reference

### Authentication
All inventory endpoints require authentication. Include the token in headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 1. Products Management

#### Get All Products
```bash
GET http://localhost:5000/api/inventory/products
Authorization: Bearer YOUR_TOKEN

# With filters
GET http://localhost:5000/api/inventory/products?page=1&limit=10&category=Medications&search=para
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search by name, SKU, or barcode
- `category` (string): Filter by category name
- `status` (string): active | inactive | discontinued
- `sortBy` (string): Field name to sort by
- `sortOrder` (string): asc | desc

#### Get Single Product
```bash
GET http://localhost:5000/api/inventory/products/:id
Authorization: Bearer YOUR_TOKEN
```

#### Create New Product
```bash
POST http://localhost:5000/api/inventory/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Vitamin C 500mg Tablets",
  "sku": "MED-VIT-C500",
  "category": "Medications",
  "description": "Vitamin C supplement",
  "manufacturer": "HealthCorp",
  "supplier": "MediSupply Co.",
  "buyingPrice": 0.50,
  "sellingPrice": 1.20,
  "initialStock": 1000,
  "minStock": 200,
  "maxStock": 3000,
  "reorderPoint": 300,
  "unit": "tablets",
  "batchNumber": "VIT2024001",
  "manufactureDate": "2024-01-01",
  "expiryDate": "2026-01-01",
  "barcode": "8901234500000",
  "prescription": false,
  "status": "active"
}
```

#### Update Product
```bash
PUT http://localhost:5000/api/inventory/products/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Vitamin C 500mg Tablets",
  "sku": "MED-VIT-C500",
  "category": "Medications",
  "buyingPrice": 0.50,
  "sellingPrice": 1.50,
  "currentStock": 800,
  "minStock": 200,
  "unit": "tablets",
  "status": "active"
}
```

#### Delete Product
```bash
DELETE http://localhost:5000/api/inventory/products/:id
Authorization: Bearer YOUR_TOKEN
```

---

### 2. Categories Management

#### Get All Categories
```bash
GET http://localhost:5000/api/inventory/categories
Authorization: Bearer YOUR_TOKEN
```

#### Create Category
```bash
POST http://localhost:5000/api/inventory/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Nutrition Supplements"
}
```

#### Delete Category
```bash
DELETE http://localhost:5000/api/inventory/categories/Nutrition%20Supplements
Authorization: Bearer YOUR_TOKEN
```

---

### 3. Stock Alerts

#### Get All Stock Alerts
```bash
GET http://localhost:5000/api/inventory/alerts
Authorization: Bearer YOUR_TOKEN

# Filter by type
GET http://localhost:5000/api/inventory/alerts?type=low-stock
GET http://localhost:5000/api/inventory/alerts?type=out-of-stock
GET http://localhost:5000/api/inventory/alerts?type=expiring
GET http://localhost:5000/api/inventory/alerts?type=expired
```

**Response includes:**
- Low stock products (stock < minStock)
- Out of stock products (stock = 0)
- Expiring soon products (< 30 days)
- Expired products

---

### 4. Issues (Product Dispensing)

#### Get All Issues
```bash
GET http://localhost:5000/api/inventory/issues
Authorization: Bearer YOUR_TOKEN

# With filters
GET http://localhost:5000/api/inventory/issues?type=outpatient&status=issued&page=1&limit=10
```

#### Get Today's Issues
```bash
GET http://localhost:5000/api/inventory/issues/today
Authorization: Bearer YOUR_TOKEN
```

#### Get Single Issue
```bash
GET http://localhost:5000/api/inventory/issues/:id
Authorization: Bearer YOUR_TOKEN
```

#### Create Issue (Dispense Products)
```bash
POST http://localhost:5000/api/inventory/issues
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "outpatient",
  "patient": {
    "id": "P12345",
    "name": "John Doe",
    "type": "outpatient"
  },
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "productName": "Paracetamol 500mg Tablets",
      "quantity": 20,
      "unitPrice": 1.20,
      "totalPrice": 24.00,
      "batchNumber": "PAR2024001"
    }
  ],
  "notes": "Regular prescription",
  "totalAmount": 24.00
}
```

**For Inpatient:**
```json
{
  "type": "inpatient",
  "patient": {
    "id": "P12346",
    "name": "Jane Smith",
    "type": "inpatient",
    "bedNumber": "B-205",
    "wardId": "W-02"
  },
  "items": [...],
  "totalAmount": 50.00
}
```

**For Department:**
```json
{
  "type": "department",
  "department": {
    "id": "D-001",
    "name": "Emergency Department"
  },
  "items": [...],
  "totalAmount": 150.00
}
```

#### Update Issue Status
```bash
PATCH http://localhost:5000/api/inventory/issues/:id/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "issued"
}
```

**Valid statuses:** pending | issued | partial | returned | cancelled

---

### 5. Prescriptions Management

#### Get All Prescriptions
```bash
GET http://localhost:5000/api/prescriptions
Authorization: Bearer YOUR_TOKEN

# With filters
GET http://localhost:5000/api/prescriptions?status=pending&search=John
```

#### Get Single Prescription
```bash
GET http://localhost:5000/api/prescriptions/:id
Authorization: Bearer YOUR_TOKEN
```

#### Create Prescription (Doctor only)
```bash
POST http://localhost:5000/api/prescriptions
Authorization: Bearer DOCTOR_TOKEN
Content-Type: application/json

{
  "patient": {
    "id": "P12345",
    "name": "John Doe"
  },
  "doctor": {
    "id": "DOCTOR_ID",
    "name": "Dr. Smith"
  },
  "medications": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "500mg",
      "quantity": 20,
      "duration": "5 days",
      "instructions": "Take 1 tablet every 6 hours"
    }
  ],
  "date": "2024-10-02",
  "time": "10:00 AM",
  "notes": "Fever and headache"
}
```

#### Dispense Prescription (Pharmacist only)
```bash
POST http://localhost:5000/api/prescriptions/:id/dispense
Authorization: Bearer PHARMACIST_TOKEN
Content-Type: application/json

{
  "medications": [
    {
      "medicationId": "MEDICATION_ID",
      "quantityDispensed": 20,
      "batchNumber": "PAR2024001"
    }
  ]
}
```

#### Update Prescription Status
```bash
PATCH http://localhost:5000/api/prescriptions/:id/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "completed"
}
```

#### Cancel Prescription
```bash
DELETE http://localhost:5000/api/prescriptions/:id
Authorization: Bearer DOCTOR_TOKEN
```

---

### 6. Dashboard Statistics

#### Get Dashboard Stats
```bash
GET http://localhost:5000/api/inventory/dashboard/stats
Authorization: Bearer YOUR_TOKEN
```

**Response includes:**
- Total products
- Today's revenue
- Low stock count
- Expired items count
- Total inventory value
- Pending prescriptions
- Today's issues count
- Top selling products
- Reorder suggestions
- Trends

#### Get Recent Activities
```bash
GET http://localhost:5000/api/inventory/dashboard/activities
Authorization: Bearer YOUR_TOKEN

# With filters
GET http://localhost:5000/api/inventory/dashboard/activities?limit=20&type=product_added&severity=info
```

---

## 🔍 Testing Checklist

### Authentication & Authorization

- [ ] Login with pharmacist account - get token
- [ ] Try accessing endpoint without token (should fail with 401)
- [ ] Try accessing with invalid token (should fail with 401)
- [ ] Try accessing with expired token (should fail with 401)
- [ ] Try write operation with doctor role (should fail with 403)
- [ ] Try write operation with nurse role (should fail with 403)

### Products CRUD

- [ ] Get all products (should return 51 products)
- [ ] Search products by name (e.g., "paracetamol")
- [ ] Filter products by category (e.g., "Medications")
- [ ] Filter by status (e.g., "active")
- [ ] Get single product by ID
- [ ] Create new product (check profit margin auto-calculation)
- [ ] Try creating product with duplicate SKU (should fail)
- [ ] Try creating with selling price < buying price (should fail)
- [ ] Update product
- [ ] Delete product

### Categories

- [ ] Get all categories (should return 8)
- [ ] Create new category
- [ ] Try creating duplicate category (should fail)
- [ ] Try deleting category with products (should fail)
- [ ] Delete empty category (should succeed)

### Stock Alerts

- [ ] Get all stock alerts
- [ ] Check low-stock alerts (should find items with stock < minStock)
- [ ] Check out-of-stock alerts (should find items with stock = 0)
- [ ] Check expiring alerts (should find items expiring in < 30 days)
- [ ] Check expired alerts (should find expired items)

### Issues

- [ ] Create outpatient issue
- [ ] Create inpatient issue (with bed and ward)
- [ ] Create department issue
- [ ] Create emergency issue
- [ ] Try creating issue with insufficient stock (should fail)
- [ ] Verify stock is reduced after issue
- [ ] Get all issues
- [ ] Get today's issues
- [ ] Update issue status
- [ ] Get single issue by ID

### Prescriptions

- [ ] Get all prescriptions (should find 3 from seed data)
- [ ] Filter by status (pending, completed)
- [ ] Search prescriptions
- [ ] Create new prescription (as doctor)
- [ ] Dispense prescription (as pharmacist)
- [ ] Verify issue is created after dispensing
- [ ] Verify stock is reduced
- [ ] Verify prescription status changes to completed
- [ ] Cancel prescription

### Dashboard

- [ ] Get dashboard statistics
- [ ] Verify all counts are correct
- [ ] Check revenue calculation
- [ ] Check inventory valuation
- [ ] Get recent activities
- [ ] Filter activities by type
- [ ] Filter activities by severity

---

## 🐛 Common Issues & Solutions

### Issue: "Authentication required"
**Solution:** Include the Authorization header with Bearer token

### Issue: "Access denied"
**Solution:** Make sure you're using a pharmacist or admin token for write operations

### Issue: "Validation failed"
**Solution:** Check the error messages - they'll tell you exactly which fields are invalid

### Issue: "Insufficient stock"
**Solution:** Check the current stock of the product before creating an issue

### Issue: "Product not found"
**Solution:** Make sure you're using a valid product ID from your database

### Issue: "Duplicate SKU"
**Solution:** SKU must be unique. Choose a different SKU for the new product

---

## 📊 Sample Test Data

### Products to Test With:
- **Paracetamol 500mg** - SKU: MED-PAR-500 (High stock, active)
- **Losartan 50mg** - SKU: MED-LOS-050 (Low stock - only 40 units)
- **Out of Stock Item** - SKU: MED-OUT-001 (Stock: 0)
- **Expired Antibiotic** - SKU: MED-EXP-001 (Expired, inactive)
- **Low Stock Emergency** - SKU: MED-LOW-001 (Critical low - only 5 units)

### Test Scenarios:

1. **Normal Product Purchase:**
   - Product: Paracetamol (plenty in stock)
   - Quantity: 20
   - Expected: Success

2. **Low Stock Warning:**
   - Product: Losartan (only 40 units, min 200)
   - Quantity: 10
   - Expected: Success, but shows in low-stock alerts

3. **Insufficient Stock:**
   - Product: Low Stock Emergency (only 5 units)
   - Quantity: 10
   - Expected: Validation error

4. **Out of Stock:**
   - Product: Out of Stock Item
   - Quantity: Any
   - Expected: Validation error

---

## 🚀 Next Steps

After testing the backend:

1. **Test with Frontend:**
   - Login as pharmacist in the frontend
   - Navigate to Products Management
   - Try CRUD operations
   - Check Stock Alerts page
   - Create an issue
   - Dispense a prescription

2. **Verify Data Integrity:**
   - Check MongoDB to see if stock is updating correctly
   - Verify auto-generated issue numbers
   - Check activity logs

3. **Performance Testing:**
   - Test pagination with large datasets
   - Test search performance
   - Test aggregation queries

4. **Edge Cases:**
   - Try to delete a category with products
   - Try to issue more quantity than available
   - Try to access endpoints without proper role

---

## 📝 Notes

- All prices are in LKR (Sri Lankan Rupees)
- Dates should be in ISO format or valid date strings
- Stock values must be non-negative integers
- Selling price must be >= Buying price
- Expiry date must be > Manufacture date
- All write operations require pharmacist or admin role
- Read operations can be accessed by pharmacist, admin, doctor, or nurse

---

**Happy Testing! 🎉**

For issues or questions, check the error messages - they're designed to be descriptive and helpful!
