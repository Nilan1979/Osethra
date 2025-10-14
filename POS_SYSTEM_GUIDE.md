# 🛒 POS System Guide - Issue Product Management

## Overview
The POS (Point of Sale) System for Osethra Hospital Pharmacy provides a modern, efficient interface for issuing pharmaceutical products to patients and departments. This system includes real-time stock validation, automatic inventory updates, and professional invoice generation.

## Features

### ✅ Core Functionality
1. **Real-time Product Search**
   - Autocomplete search with instant results
   - Search by product name, SKU, or category
   - Display current stock levels in search results
   - Price preview in search dropdown

2. **Smart Cart Management**
   - Add/remove products with one click
   - Adjust quantities with increment/decrement buttons
   - Real-time stock validation (prevents over-ordering)
   - Visual warnings for low-stock items
   - Running total calculation

3. **Stock Validation**
   - Cannot add more than available stock
   - Live stock level display
   - Warning chips for items with < 10 units
   - Maximum quantity enforcement

4. **Issue Type Support**
   - **Outpatient**: Walk-in patients
   - **Inpatient**: Admitted patients (requires ward & bed info)
   - **Department**: Internal hospital departments
   - **Emergency**: Urgent requests

5. **Professional Invoicing**
   - Two print formats:
     - **A4 Invoice**: Full-size professional invoice (210mm × 297mm)
     - **Thermal Receipt**: POS receipt format (80mm width)
   - Hospital branding and logo
   - Itemized product list with batch numbers
   - Tax calculations (configurable)
   - Auto-generated invoice numbers

6. **Automatic Stock Updates**
   - Real-time inventory deduction
   - Transactional safety (MongoDB sessions)
   - Rollback on errors
   - Activity logging

## User Guide

### How to Issue Products

#### Step 1: Access POS System
- Navigate to **Pharmacist Dashboard**
- Click **"New Issue"** button or select **"Issue Products"** from Quick Actions

#### Step 2: Search and Add Products
1. Use the search bar at the top to find products
2. Products appear with:
   - Name and SKU
   - Current stock level (color-coded)
   - Price per unit
3. Click the **+** icon or select from dropdown to add to cart
4. Product is automatically added with quantity = 1

#### Step 3: Manage Cart
- **Increase Quantity**: Click the **+** button
- **Decrease Quantity**: Click the **-** button
- **Direct Input**: Type quantity in the number field
- **Remove Item**: Click the trash icon
- **Clear All**: Use "Clear All" button to empty cart

**Stock Validation:**
- Cannot exceed available stock
- Warning shown for low-stock items (< 10 units)
- Maximum quantity displayed below controls

#### Step 4: Enter Issue Details

**Select Issue Type:**
- Choose from dropdown: Outpatient, Inpatient, Department, Emergency

**For Patients (Outpatient/Inpatient/Emergency):**
- Patient Name (required)
- Patient ID (required)
- For Inpatient only:
  - Ward ID (required)
  - Bed Number (required)

**For Departments:**
- Department Name (required)
- Department ID (required)

**Additional Info:**
- Notes (optional): Any special instructions

#### Step 5: Review Order Summary
The right panel shows:
- Total items count
- Subtotal
- Tax (0% by default)
- **Grand Total** in large, bold text

#### Step 6: Complete Issue
1. Click **"Complete Issue"** button
2. System validates:
   - Cart is not empty
   - Required fields are filled
   - Stock availability
3. Invoice is generated automatically

#### Step 7: Print Invoice
1. Choose print format:
   - **A4 Invoice**: For detailed records, filing
   - **Thermal Receipt**: For quick POS printing
2. Click **"Print Invoice"** or **"Print Receipt"**
3. Use browser print dialog to:
   - Select printer
   - Adjust settings
   - Print or save as PDF

#### Step 8: Complete or Create New Issue
- **New Issue**: Start another transaction
- **Go to Dashboard**: Return to main screen

## Print Formats

### A4 Invoice (Standard)
**Dimensions:** 210mm × 297mm (A4)
**Best For:** 
- Official records
- Patient files
- Insurance claims
- Archiving

**Contains:**
- Hospital letterhead
- Full patient/department details
- Itemized product table with:
  - Product names
  - Batch numbers
  - Expiry dates
  - Quantities
  - Unit prices
  - Total prices
- Subtotal, tax, and grand total
- Payment terms
- Authorized signature section
- Footer with terms & conditions

### Thermal Receipt (POS)
**Dimensions:** 80mm width (auto height)
**Best For:**
- Quick transactions
- POS thermal printers
- Cash registers
- Patient hand receipts

**Contains:**
- Hospital name and contact
- Invoice number and date/time
- Patient/department info
- Compact product list
- Quantities and prices
- Total amount
- Thank you message

**Print Settings for Thermal:**
- Paper size: 80mm roll
- Margins: Minimal (2mm)
- Font: Monospace (Courier)
- Auto-cut after print

## Technical Details

### Stock Management
**Real-time Updates:**
```
1. User adds product to cart
   → System checks current stock
   → Validates quantity ≤ available stock
   
2. User completes issue
   → MongoDB transaction starts
   → Stock validated again
   → Products deducted from inventory
   → Issue record created
   → Activity logged
   → Transaction committed
   
3. Error occurs
   → Transaction rolled back
   → Stock remains unchanged
   → Error message shown to user
```

### Invoice Number Format
```
ISU-YYYY-NNNNN
│   │    └─── Sequential number (5 digits)
│   └──────── Year
└──────────── Prefix (Issue)

Example: ISU-2025-00001
```

### API Endpoints Used
- `POST /api/inventory/issues` - Create new issue
- `GET /api/inventory/products` - Fetch products
- `GET /api/inventory/dashboard/stats` - Update dashboard

## Keyboard Shortcuts (Future Enhancement)

Planned shortcuts:
- `F2` - Focus search bar
- `F4` - Complete issue
- `F9` - Clear cart
- `Ctrl + P` - Print invoice
- `Esc` - Cancel/Go back

## Error Handling

### Common Errors and Solutions

**1. "Insufficient stock for [Product]"**
- **Cause:** Trying to order more than available
- **Solution:** Reduce quantity or split order

**2. "Patient name is required"**
- **Cause:** Missing patient information
- **Solution:** Fill in all required fields

**3. "Please add at least one product"**
- **Cause:** Empty cart
- **Solution:** Add products before completing

**4. "Failed to create issue"**
- **Cause:** Network or server error
- **Solution:** Check connection and try again

## Best Practices

### For Pharmacists
1. **Verify Stock Before Large Orders**
   - Check stock alerts dashboard
   - Confirm availability for multi-item orders

2. **Use Correct Issue Types**
   - Outpatient: Regular customers, walk-ins
   - Inpatient: Only for admitted patients
   - Department: Internal requisitions
   - Emergency: Urgent/critical cases

3. **Double-Check Patient Info**
   - Verify patient ID matches
   - Confirm ward and bed for inpatients
   - Ask patient to verify name spelling

4. **Print Immediately**
   - Print invoice while patient waits
   - Keep copy for records
   - Give receipt to patient

5. **Review Before Completing**
   - Check all items and quantities
   - Verify total amount
   - Confirm patient details

### For Administrators
1. **Regular Stock Updates**
   - Monitor low-stock alerts
   - Replenish before stockouts
   - Set appropriate minimum levels

2. **Audit Trails**
   - Review activity logs regularly
   - Check for unusual patterns
   - Investigate discrepancies

3. **Printer Maintenance**
   - Keep thermal printer paper stocked
   - Clean printer heads regularly
   - Test print settings weekly

## Troubleshooting

### Print Issues

**Thermal Receipt Not Printing Correctly:**
1. Check paper width setting (must be 80mm)
2. Verify printer supports ESC/POS commands
3. Update printer drivers
4. Test with sample receipt

**A4 Invoice Formatting:**
1. Ensure printer supports A4 paper
2. Check page margins in print preview
3. Use "Fit to page" if needed
4. Save as PDF if physical printer unavailable

### Performance Issues

**Slow Product Search:**
- Clear browser cache
- Reduce number of products loaded
- Check internet connection
- Contact IT support

**Stock Updates Not Reflecting:**
- Refresh product list
- Check network connection
- Verify with inventory management page
- Report to administrator

## Security Features

1. **Authentication Required**
   - Must be logged in as Pharmacist or Admin
   - Session timeout after 30 minutes of inactivity

2. **Role-Based Access**
   - Only authorized roles can issue products
   - All actions logged with user ID

3. **Transaction Integrity**
   - Database transactions prevent partial updates
   - Automatic rollback on errors
   - Stock levels always accurate

4. **Audit Trail**
   - Every issue logged with timestamp
   - User information recorded
   - Activity feed shows all actions

## Future Enhancements

### Planned Features
- [ ] Barcode scanner integration
- [ ] Payment method selection (Cash/Card/Credit)
- [ ] Discount management
- [ ] Batch selection for FEFO
- [ ] Customer loyalty points
- [ ] SMS receipt option
- [ ] Email invoice delivery
- [ ] Multi-language support
- [ ] Voice commands
- [ ] Offline mode

## Support

**For Technical Issues:**
- Contact IT Support: +94 11 234 5678
- Email: support@osethra.lk

**For Training:**
- Pharmacy Manager: extension 123
- Training Videos: Available in Help menu

**For Bugs/Feedback:**
- Report through Help > Report Issue
- Email: pharmacy.feedback@osethra.lk

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Document Owner:** Pharmacy Department
