# Quick Start Guide - Product & Inventory Management

## 🚀 Getting Started

### Step 1: Add Your First Product
1. Go to **Dashboard** → **Product Management** (Green Section)
2. Click **"Add New Product"**
3. Fill in the form:
   - Product Name: e.g., "Paracetamol 500mg"
   - SKU: e.g., "PARA-500"
   - Category: Select from dropdown
   - Unit: Select (tablets, capsules, etc.)
   - Manufacturer: Company name
   - Prescription Required: Yes/No
4. Click **"Save Product"**

### Step 2: Add Stock to Your Product
1. Go to **Dashboard** → **Inventory Management** (Blue Section)
2. Click **"Add Stock/Batch"**
3. Fill in the form:
   - Select Product: Choose from dropdown
   - Batch Number: e.g., "BATCH-2024-001"
   - Quantity: e.g., 1000
   - Buying Price: e.g., 5.00
   - Selling Price: e.g., 10.00
   - Manufacture Date: Select date
   - Expiry Date: Select date
   - Storage Location: e.g., "Shelf A1"
   - Supplier: Company name
4. Click **"Add Inventory"**

### Step 3: View Your Inventory
1. Go to **Dashboard** → **Inventory Management** (Blue Section)
2. Click **"View Inventory"**
3. You'll see:
   - Total items and value
   - Complete list of all batches
   - Filter and search options
   - Edit/Delete buttons

---

## 🎯 Key Concepts

### Product = Definition
Think of it as your **product catalog** or **menu**.
- What products exist in your pharmacy
- Basic information that doesn't change often
- NO stock quantities
- NO prices (prices vary by batch)

**Example:**
```
Product: Paracetamol 500mg Tablets
SKU: PARA-500
Category: Analgesics
Unit: tablets
Manufacturer: ABC Pharma
Prescription Required: No
```

### Inventory = Physical Stock
Think of it as your **warehouse** or **stock room**.
- Actual products you have on shelves
- Specific batches with unique details
- Quantities, prices, dates
- Storage locations

**Example:**
```
Product: Paracetamol 500mg Tablets (linked)
Batch: BATCH-JAN-2024
Quantity: 1000 tablets
Buying Price: LKR 5 each
Selling Price: LKR 10 each
Manufacture: 2024-01-15
Expiry: 2026-01-15
Storage: Shelf A1, Row 3
Supplier: Medical Supplies Ltd
```

---

## 📍 Where to Find Everything

### Dashboard Routes

**Product Management (Green)**
- `/pharmacist/products` - View all products
- `/pharmacist/products/add` - Add new product
- `/pharmacist/products/edit/:id` - Edit product

**Inventory Management (Blue)**
- `/pharmacist/inventory` - **View all inventory** ⭐
- `/pharmacist/inventory/add` - Add stock/batch
- `/pharmacist/alerts` - Low stock & expiry alerts

**Other**
- `/pharmacist/issues` - Issue products
- `/pharmacist/prescriptions` - Manage prescriptions

---

## 🔍 Common Tasks

### How do I add a new medicine?
1. First, create the **Product** (basic info)
2. Then, add **Inventory** (stock with batch)

### How do I check what's expiring soon?
1. Go to **Inventory Management** → **View Inventory**
2. Use filter: "Expiring Soon (30 days)"

### How do I see low stock items?
1. Go to **Inventory Management** → **View Inventory**
2. Use filter: "Low Stock"

### How do I adjust stock quantity?
1. Go to **Inventory Management** → **View Inventory**
2. Find the item and click **Edit**
3. Update quantity and save

### How do I add more stock of existing product?
1. Go to **Inventory Management** → **Add Stock/Batch**
2. Select the existing product
3. Enter NEW batch details (different batch number or dates)

### Can I have multiple batches of same product?
✅ **Yes!** This is the whole point:
- Same product (e.g., "Paracetamol 500mg")
- Different batches with different:
  - Batch numbers
  - Expiry dates
  - Prices
  - Suppliers

---

## 🎨 Color Guide

### Dashboard Sections
- 🟢 **Green** = Product Management
- 🔵 **Blue** = Inventory Management

### Status Chips

**Stock Status:**
- 🟢 Well Stocked (> 200 units)
- 🔵 In Stock (50-200 units)
- 🟠 Low Stock (1-49 units)
- 🔴 Out of Stock (0 units)

**Expiry Status:**
- 🟢 Fresh (> 90 days)
- 🔵 Good (31-90 days)
- 🟠 Expiring Soon (1-30 days)
- 🔴 Expired (past date)

---

## ❓ FAQ

**Q: Why can't I add stock when creating a product?**  
A: Products and inventory are separate! First create the product (definition), then add inventory (stock).

**Q: Can I edit prices later?**  
A: Yes! Edit the inventory item. Note: Prices are per-batch, so different batches can have different prices.

**Q: What if I receive the same product but different batch?**  
A: Add new inventory with different batch number or dates. The system allows multiple batches of the same product.

**Q: How do I delete a product?**  
A: Go to Products list, find the product, click delete. Note: You should delete associated inventory first.

**Q: What happens when batch expires?**  
A: It appears in "Expired" filter with red status chip. You should remove it from inventory.

**Q: Can I import products from Excel?**  
A: Not yet, but you can add them one by one through the form.

---

## 📝 Best Practices

### When Adding Products
✅ Use clear, descriptive names  
✅ Create unique SKU codes  
✅ Assign correct category  
✅ Specify correct unit of measurement  

❌ Don't add stock information here  
❌ Don't add prices here  

### When Adding Inventory
✅ Use unique batch numbers  
✅ Enter accurate expiry dates  
✅ Record actual purchase prices  
✅ Note storage location  
✅ Keep receipt numbers  

❌ Don't reuse batch numbers for different shipments  
❌ Don't forget expiry dates  

### Regular Maintenance
- Check "Expiring Soon" weekly
- Review "Low Stock" daily
- Update quantities after issues
- Remove expired batches promptly

---

## 🆘 Troubleshooting

**Issue: Can't find product in inventory form**  
Solution: Make sure you created the product first in Product Management.

**Issue: "Duplicate inventory item" error**  
Solution: Same batch with same dates already exists. Change batch number or dates.

**Issue: Product shows but no stock**  
Solution: Product exists but no inventory added yet. Add inventory for this product.

**Issue: Can't see inventory list**  
Solution: Go to Dashboard → Inventory Management → View Inventory.

**Issue: Wrong expiry status color**  
Solution: Check if manufacture/expiry dates are correct. System calculates days automatically.

---

## 🎓 Training Checklist

For new users, practice these tasks:

- [ ] Add a new product (master data)
- [ ] Add inventory for that product
- [ ] View inventory list
- [ ] Use search to find product
- [ ] Use filters (expiring soon, low stock)
- [ ] Edit an inventory item
- [ ] Add second batch of same product
- [ ] Check statistics on inventory page
- [ ] Navigate between product and inventory sections
- [ ] Understand green vs blue dashboard sections

---

## 📞 Quick Navigation

From Dashboard:
- **Add Product** → Green Section → "Add New Product"
- **Add Stock** → Blue Section → "Add Stock/Batch"
- **View Stock** → Blue Section → "View Inventory"
- **Check Alerts** → Blue Section → "Stock Alerts"

---

## 💡 Remember

1. **Green = Products** (catalog)
2. **Blue = Inventory** (stock)
3. Create product FIRST, add inventory SECOND
4. One product can have MANY inventory batches
5. Check expiring stock regularly!

**Happy Managing!** 🎉
