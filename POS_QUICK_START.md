# 🚀 Quick Start Guide - POS System

## Test the POS System in 5 Minutes

### Prerequisites
- Backend server running on port 5000
- Frontend dev server running
- Logged in as Pharmacist (sanduni / your password)
- Database has products (from seed-inventory.js)

---

## Step-by-Step Test

### 1. Access POS System (30 seconds)
```
1. Login as Pharmacist (sanduni)
2. Click "NEW ISSUE" button in dashboard header
   OR
3. Click "Issue Products" in Quick Actions
```

### 2. Add Products to Cart (1 minute)
```
1. Click in the search bar
2. Type "para" (for Paracetamol)
3. See autocomplete dropdown with:
   - Product name
   - SKU
   - Stock level (green/red)
   - Price
4. Click the + icon OR select from dropdown
5. Product added to cart with quantity 1
6. Repeat for 2-3 different products
```

**Try This:**
- Add "Paracetamol"
- Add "Amoxicillin"
- Add "Ibuprofen"

### 3. Test Stock Validation (1 minute)
```
1. Find a product in cart
2. Click the + button multiple times
3. Watch the stock warning appear when low
4. Try to exceed available stock
5. See error message: "Only X units available"
6. Quantity stays at maximum
```

**What You'll See:**
- Warning chip when stock < 10: "Only 8 left!"
- Error toast when exceeding: "Only 15 units available"
- + button disabled at maximum stock

### 4. Manage Cart (30 seconds)
```
1. Use +/- buttons to adjust quantities
2. Type number directly in quantity field
3. Click trash icon to remove item
4. Click "Clear All" to empty cart
5. Add products again
```

### 5. Enter Issue Details (1 minute)
```
1. Issue Type: Leave as "Outpatient"
2. Patient Name: Type "John Doe"
3. Patient ID: Type "P12345"
4. Notes: Type "Regular refill" (optional)
```

**For Inpatient Test:**
```
1. Change Issue Type to "Inpatient"
2. Patient Name: "Jane Smith"
3. Patient ID: "P67890"
4. Ward ID: "W-03"
5. Bed Number: "B-15"
```

### 6. Review Order Summary (30 seconds)
```
Check right panel:
- Items: Shows total unit count
- Subtotal: Sum of all products
- Tax: 0.00 (currently)
- TOTAL: Big, bold, in blue
```

### 7. Complete Issue (30 seconds)
```
1. Click "Complete Issue" button
2. Wait 1-2 seconds (processing)
3. See success dialog:
   ✓ Issue Completed Successfully!
```

### 8. Test Print Formats (1 minute)

**A4 Invoice:**
```
1. Keep "A4 Invoice" selected (default)
2. Review invoice preview:
   - Hospital header
   - Patient info
   - Product table with batch numbers
   - Totals
   - Signature section
3. Click "Print Invoice"
4. In browser print dialog:
   - Select "Save as PDF" (for testing)
   - OR Send to printer
```

**Thermal Receipt:**
```
1. Click "Thermal Receipt" toggle button
2. Preview changes to compact format:
   - 80mm width
   - Monospace font
   - Compact layout
3. Click "Print Receipt"
4. Print settings auto-adjust for thermal
```

### 9. Verify Stock Updated (30 seconds)
```
1. Click "New Issue"
2. Search for same products
3. See stock levels decreased:
   - Before: 50 units
   - After: 48 units (if you issued 2)
```

### 10. Check Dashboard (30 seconds)
```
1. Click "Go to Dashboard"
2. Verify updates:
   - Today's Transactions: +1
   - Today's Revenue: Increased
   - Recent Activity: Shows new issue
```

---

## Expected Results

### ✅ What Should Work

1. **Product Search**
   - Instant autocomplete
   - Shows stock levels
   - Color-coded (green = good, red = low)
   - Displays prices

2. **Cart Management**
   - Add/remove works
   - Quantity adjustments work
   - Stock validation prevents over-ordering
   - Total calculates correctly

3. **Stock Validation**
   - Cannot exceed available stock
   - Warning shows for low stock
   - Error message when over-limit
   - Stock updates after issue

4. **Form Validation**
   - Cannot submit empty cart
   - Required fields enforced
   - Type-specific fields required
   - Error messages clear

5. **Invoice Generation**
   - Auto-generated invoice number (ISU-2025-XXXXX)
   - All details populated
   - Calculations correct
   - Both formats render properly

6. **Print Functionality**
   - Print dialog opens
   - Can save as PDF
   - Can send to printer
   - Format-specific styling applied

---

## Test Scenarios

### Scenario 1: Regular Outpatient Sale
```
Products: Paracetamol (10), Vitamin C (5)
Patient: John Smith, P001
Expected: Quick checkout, print receipt
Time: 2 minutes
```

### Scenario 2: Large Inpatient Order
```
Products: 5-6 different medications
Patient: Ward W-02, Bed B-08
Expected: All items processed, stock updated
Time: 3 minutes
```

### Scenario 3: Department Requisition
```
Products: Multiple items for ICU
Department: ICU, D-ICU-01
Expected: Department issue, A4 invoice
Time: 2 minutes
```

### Scenario 4: Stock Limit Test
```
Product: Low stock item (e.g., 3 units available)
Action: Try to order 5 units
Expected: Error message, limited to 3
Time: 1 minute
```

---

## Common Issues & Solutions

### Issue: Products not loading
**Solution:**
```bash
# Check backend is running
cd server
node app.js

# Check products exist
# Login to MongoDB and verify products collection
```

### Issue: Cannot add to cart
**Solution:**
- Check product has stock > 0
- Refresh page
- Clear browser cache

### Issue: Print not working
**Solution:**
- Check browser allows pop-ups
- Try "Save as PDF" instead
- Use Ctrl+P manual print

### Issue: Stock not updating
**Solution:**
- Refresh products page
- Check browser console for errors
- Verify backend transaction logs

---

## Sample Test Data

### Test Products (from seed)
```
1. Paracetamol 500mg - Stock: 450
2. Amoxicillin 500mg - Stock: 120
3. Ibuprofen 400mg - Stock: 300
4. Metformin 500mg - Stock: 200
5. Vitamin C 500mg - Stock: 180
```

### Test Patients
```
Outpatient:
- Name: John Doe, ID: P12345
- Name: Jane Smith, ID: P67890

Inpatient:
- Name: Bob Wilson, ID: P11111
  Ward: W-03, Bed: B-15
- Name: Alice Brown, ID: P22222
  Ward: W-05, Bed: B-22
```

### Test Departments
```
- ICU: D-ICU-01
- Emergency: D-ER-01
- Pediatric: D-PED-01
```

---

## Performance Benchmarks

**Target Times:**
- Product search: < 500ms
- Add to cart: Instant
- Complete issue: < 2 seconds
- Generate invoice: < 1 second
- Print dialog: Instant

**Limits:**
- Cart size: Unlimited items
- Product quantity: Up to available stock
- Invoice size: Auto-sized

---

## Debugging Tips

### Enable Console Logs
```javascript
// In browser console (F12)
// Check for errors in:
localStorage.getItem('token') // Should have JWT
// Network tab: Check API calls
```

### Check Backend Logs
```bash
# Terminal where server is running
# Look for:
POST /api/inventory/issues 201 Created
PUT /api/inventory/products/:id 200 OK
```

### Verify Database
```javascript
// In MongoDB
db.issues.find().sort({createdAt: -1}).limit(1)
// Should show latest issue

db.products.findOne({name: /Paracetamol/})
// Check currentStock decreased
```

---

## Next Steps After Testing

1. **Try All Issue Types**
   - Outpatient
   - Inpatient
   - Department
   - Emergency

2. **Test Edge Cases**
   - Empty cart
   - Missing fields
   - Stock limits
   - Special characters

3. **Print Testing**
   - Save as PDF
   - Physical printer (if available)
   - Both formats

4. **Integration Testing**
   - Check dashboard updates
   - Verify activity logs
   - Review stock levels

5. **User Acceptance**
   - Get pharmacist feedback
   - Adjust UI if needed
   - Add requested features

---

## Success Criteria

✅ **System is working if:**
- [ ] Can search products
- [ ] Can add to cart
- [ ] Stock validation works
- [ ] Cannot exceed limits
- [ ] Can complete issue
- [ ] Invoice generated
- [ ] Can print both formats
- [ ] Stock updates correctly
- [ ] Dashboard shows new data

---

**Time to Complete Full Test:** 5-10 minutes  
**Difficulty:** Easy  
**Required:** Basic computer skills

Happy Testing! 🎉
