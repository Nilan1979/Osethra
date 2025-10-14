# Quick Reference: Product vs Inventory Management

## 🟢 Product Management (Master Data)

### Purpose
Create product definitions - the "catalog" of what products exist in your pharmacy.

### When to Use
- Adding a new type of product to your catalog
- Defining product properties that don't change
- Setting up product categories and classifications

### What It Does
- Creates a product record with basic information
- NO stock quantities
- NO batch tracking
- NO expiry dates

### Route
`/pharmacist/products/add`

### Example
```
Product: Paracetamol 500mg Tablets
SKU: PARA-500-TAB
Category: Analgesics
Unit: tablets
Min Stock Alert: 100 tablets
Default Storage: Shelf A1
```

---

## 🔵 Inventory Management (Stock Tracking)

### Purpose
Add actual physical stock to products with batch-level tracking.

### When to Use
- After receiving a shipment
- Adding stock to an existing product
- Tracking different batches of the same product

### What It Does
- Creates an inventory record linked to a product
- Tracks actual quantities
- Records batch numbers
- Tracks expiry and manufacture dates
- Records purchase details

### Route
`/pharmacist/inventory/add`

### Example
```
Product: Paracetamol 500mg Tablets (select from dropdown)
Batch: BATCH-2024-001
Quantity: 1000 tablets
Buying Price: LKR 5 per tablet
Selling Price: LKR 10 per tablet
Manufacture Date: 2024-01-15
Expiry Date: 2026-01-15
Storage Location: Shelf A1, Row 3
Supplier: Medical Supplies Ltd
Receipt #: INV-2024-001
```

---

## 📋 Workflow

### Step 1: Create Product (ONE TIME)
1. Go to **Product Management** → Add New Product
2. Enter product name, SKU, category
3. Set stock thresholds (optional)
4. Set default prices (optional)
5. Save

### Step 2: Add Inventory (EVERY SHIPMENT)
1. Go to **Inventory Management** → Add Stock/Batch
2. Select the product from dropdown
3. Enter batch number
4. Enter quantity received
5. Enter prices for this batch
6. Enter manufacture and expiry dates
7. Enter supplier and receipt details
8. Save

### Step 3: Repeat Step 2
Every time you receive a new shipment, even if it's the same product:
- Same product + Different batch = New inventory record ✅
- Same product + Different expiry = New inventory record ✅
- Same product + Same batch + Same dates = Error (duplicate) ❌

---

## 🎯 Key Differences

| Aspect | Product Management | Inventory Management |
|--------|-------------------|---------------------|
| **Purpose** | Define what products exist | Track physical stock |
| **Frequency** | Once per product type | Every shipment |
| **Quantity** | No quantity stored | Actual stock quantity |
| **Batch** | No batch tracking | Batch number required |
| **Expiry** | No expiry date | Expiry date required |
| **Manufacture Date** | No | Required |
| **Prices** | Optional defaults | Actual prices |
| **Storage** | Default location | Actual location |
| **Supplier** | General supplier info | Specific supplier for batch |
| **Changes** | Rarely changes | Frequently updated |

---

## 💡 Think of It Like...

### Product = Book in a Library Catalog
- Title, author, ISBN
- Category and genre
- Never changes

### Inventory = Physical Books on Shelves
- How many copies you have
- Which edition (batch)
- Condition and location
- When you got them

---

## ✅ Do's

### Product Management
✅ Create product once  
✅ Update product details when needed  
✅ Set realistic stock thresholds  
✅ Use clear, consistent naming  
✅ Assign proper categories  

### Inventory Management
✅ Add inventory after receiving shipments  
✅ Use unique batch numbers  
✅ Record accurate quantities  
✅ Enter correct dates  
✅ Track supplier information  
✅ Keep receipt numbers  

---

## ❌ Don'ts

### Product Management
❌ Don't enter stock quantities here  
❌ Don't enter batch numbers  
❌ Don't enter expiry dates  
❌ Don't create duplicate products  

### Inventory Management
❌ Don't skip batch numbers  
❌ Don't use same batch for different shipments  
❌ Don't enter wrong expiry dates  
❌ Don't forget to link to correct product  

---

## 🔍 Where to Find What

### View All Products (Master Catalog)
**Route**: `/pharmacist/products`  
**Shows**: All product definitions  
**Use for**: Browsing catalog, editing products  

### View All Inventory (Stock & Batches)
**Route**: `/pharmacist/inventory` ⚠️ *TO BE CREATED*  
**Shows**: All stock batches across all products  
**Use for**: Stock taking, batch tracking, expiry monitoring  

### Stock Alerts
**Route**: `/pharmacist/alerts`  
**Shows**: Low stock and expiring batches  
**Use for**: Reordering decisions  

---

## 🎨 Visual Guide (Dashboard)

### Green Section = Product Management
- Add New Product
- View Products
- Edit Products

### Blue Section = Inventory Management
- Add Stock/Batch
- View Inventory
- Stock Alerts

### Other Actions
- Issue Products (to patients)
- Prescriptions
- Reports

---

## 🔢 Example Scenario

### Scenario: Stocking Paracetamol

#### Day 1: New Product
**Action**: Create Product  
**Where**: Product Management → Add New Product  

```
Name: Paracetamol 500mg Tablets
SKU: PARA-500
Category: Analgesics
Min Stock: 100
Default Buy Price: LKR 5
Default Sell Price: LKR 10
```

#### Day 2: First Shipment
**Action**: Add Inventory  
**Where**: Inventory Management → Add Stock/Batch  

```
Product: Paracetamol 500mg Tablets
Batch: JAN-2024-001
Quantity: 1000 tablets
Buy Price: LKR 5/tablet
Sell Price: LKR 10/tablet
Mfg Date: 2024-01-01
Exp Date: 2026-01-01
Supplier: ABC Pharma
Receipt: INV-2024-001
```

#### Day 30: Second Shipment (Same Product, Different Batch)
**Action**: Add Inventory  
**Where**: Inventory Management → Add Stock/Batch  

```
Product: Paracetamol 500mg Tablets (same)
Batch: FEB-2024-002 (different)
Quantity: 500 tablets
Buy Price: LKR 4.50/tablet (better price!)
Sell Price: LKR 9/tablet
Mfg Date: 2024-02-01
Exp Date: 2026-02-01
Supplier: XYZ Pharma (different supplier)
Receipt: INV-2024-045
```

**Result**: 
- 1 Product record
- 2 Inventory records
- Total stock: 1500 tablets across 2 batches
- Different prices and suppliers tracked
- Different expiry dates tracked

---

## 📞 Quick Decision Guide

**Q: I received a new type of medicine. What do I do?**  
A: First create the **Product** (master data), then add **Inventory** (stock)

**Q: I received more stock of existing medicine. What do I do?**  
A: Just add **Inventory** (the product already exists)

**Q: I need to update a product's name or category. Where?**  
A: **Product Management** → View Products → Edit

**Q: I need to adjust stock quantity. Where?**  
A: **Inventory Management** → View Inventory → Adjust Stock *(to be created)*

**Q: I need to check expiry dates. Where?**  
A: **Inventory Management** → Stock Alerts

**Q: Same product, same batch number, but different expiry date?**  
A: This creates a **new inventory record** (different batch)

**Q: Exact same product, batch, AND dates?**  
A: **Error** - this is a duplicate (adjust quantity instead)

---

## 🎓 Remember

- **Product** = What you can sell (catalog)
- **Inventory** = What you have in stock (warehouse)
- **Batch** = Specific shipment with unique dates
- **Green Dashboard** = Products
- **Blue Dashboard** = Inventory

**Golden Rule**: Create product once, add inventory many times! 🌟
