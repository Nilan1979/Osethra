# Product Order History Implementation Guide

## Overview
This document describes the implementation of the product order history tracking system, which logs every issue transaction for each product in the inventory system.

## Features Implemented

### 1. **Backend - Data Model**
- Added `orderHistory` array field to `ProductModel.js`
- Each history entry tracks:
  - Issue ID and Issue Number
  - Transaction type (issue, return, adjustment)
  - Quantity and pricing information
  - Who the product was issued to (patient/department/general)
  - Who issued it (user details)
  - Date and notes

### 2. **Backend - Issue Controller**
- Modified `createIssue` function in `IssueController.js`
- Automatically logs transaction to product's orderHistory when issues are created
- Updates history with issue reference after issue is saved
- All operations run within MongoDB transactions for data consistency

### 3. **Backend - API Endpoint**
- **Endpoint**: `GET /api/inventory/products/:id/history`
- **Access**: Pharmacist and Admin only
- **Features**:
  - Pagination support (page, limit)
  - Filter by transaction type (issue, return, adjustment)
  - Filter by date range (startDate, endDate)
  - Returns statistics (total transactions, quantities, revenue)
- **Controller**: `getProductOrderHistory` in `InventoryController.js`

### 4. **Frontend - API Service**
- Added `getProductHistory` function to `inventory.js`
- Accepts product ID and filter parameters
- Returns formatted response with history data and statistics

### 5. **Frontend - ProductHistory Component**
- **Location**: `client/src/components/Inventory/ProductHistory.jsx`
- **Features**:
  - Full-screen dialog with comprehensive history view
  - Statistics cards showing:
    - Total transactions
    - Total quantity issued
    - Total quantity returned
    - Total revenue generated
  - Filter controls:
    - Transaction type dropdown
    - Date range pickers (start/end date)
  - Detailed transaction table with:
    - Date and time
    - Transaction type with color-coded chips
    - Issue number
    - Quantity (with +/- indicators)
    - Unit price and total price
    - Issued to (patient/department/general)
    - Issued by (user name and role)
    - Notes
  - Pagination support
  - Loading and error states

### 6. **Frontend - ProductCard Integration**
- Updated `ProductCard.jsx` to include:
  - History icon button (info color)
  - Tooltip: "View History"
  - Added to both grid and list views
  - Positioned with other action buttons (Edit, Issue, Delete)

### 7. **Frontend - ProductsManagement Page**
- Added `ProductHistory` dialog component
- Created `handleViewHistory` and `handleCloseHistory` handlers
- Passed handlers to all ProductCard instances
- Dialog state management with product ID and name

## How to Use

### Viewing Product History

1. **Navigate to Products Management**
   - Go to Pharmacist Dashboard
   - Click on "Products Management"

2. **Select a Product**
   - Find the product you want to view history for
   - Click the blue History icon (ℹ️) button on the product card

3. **View History Dialog**
   - See statistics cards at the top showing summary information
   - Use filters to narrow down the history:
     - Filter by type (Issue/Return/Adjustment)
     - Filter by date range
   - Browse the transaction table
   - Use pagination controls to navigate through pages
   - Click "Close" when done

### Understanding the Data

**Transaction Types:**
- 🔴 **ISSUE** (Red): Product was issued/dispensed
- 🟢 **RETURN** (Green): Product was returned to inventory
- 🟡 **ADJUSTMENT** (Yellow): Stock adjustment/correction

**Issued To:**
- Patient name (if issued to a patient)
- Department name (if issued to a department)
- "General Issue" (if no specific recipient)

**Statistics:**
- **Total Transactions**: Count of all history entries
- **Total Issued**: Sum of all issue quantities (negative impact on stock)
- **Total Returned**: Sum of all return quantities (positive impact on stock)
- **Total Revenue**: Sum of all issue transaction values in LKR

## API Usage Examples

### Get Product History
```javascript
// Fetch all history
const response = await productsAPI.getProductHistory(productId);

// Fetch with filters
const response = await productsAPI.getProductHistory(productId, {
  page: 1,
  limit: 50,
  type: 'issue',
  startDate: '2025-01-01',
  endDate: '2025-10-03'
});
```

### Response Format
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "...",
      "name": "Product Name",
      "sku": "SKU123",
      "currentStock": 100
    },
    "history": [
      {
        "issueId": "...",
        "issueNumber": "ISS-2025-001",
        "type": "issue",
        "quantity": 10,
        "unitPrice": 50.00,
        "totalPrice": 500.00,
        "issuedTo": "John Doe",
        "issuedBy": {
          "id": "...",
          "name": "Pharmacist Name",
          "role": "pharmacist"
        },
        "date": "2025-10-03T10:30:00Z",
        "notes": "Outpatient issue"
      }
    ],
    "stats": {
      "totalTransactions": 45,
      "totalQuantityIssued": 500,
      "totalQuantityReturned": 20,
      "totalRevenue": 25000.00
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10
    }
  }
}
```

## Database Schema

### Product Model - orderHistory Field
```javascript
orderHistory: [{
  issueId: ObjectId (ref: 'Issue'),
  issueNumber: String,
  type: String (enum: ['issue', 'return', 'adjustment']),
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  issuedTo: String (default: 'General Issue'),
  issuedBy: {
    id: ObjectId,
    name: String,
    role: String
  },
  date: Date (default: now),
  notes: String
}]
```

## Files Modified/Created

### Backend
- ✅ `server/Model/ProductModel.js` - Added orderHistory schema
- ✅ `server/Controllers/IssueController.js` - Added history logging
- ✅ `server/Controllers/InventoryController.js` - Added getProductOrderHistory
- ✅ `server/Routes/InventoryRoutes.js` - Added history endpoint route

### Frontend
- ✅ `client/src/api/inventory.js` - Added getProductHistory API function
- ✅ `client/src/components/Inventory/ProductHistory.jsx` - NEW component
- ✅ `client/src/components/Inventory/molecules/ProductCard.jsx` - Added history button
- ✅ `client/src/pages/inventory/ProductsManagement.jsx` - Integrated history dialog

## Testing Checklist

- [ ] Create a new issue and verify it appears in product history
- [ ] Check that stock updates are reflected correctly
- [ ] Verify history shows correct issue number and details
- [ ] Test filters (type, date range)
- [ ] Test pagination with large datasets
- [ ] Verify statistics calculations are accurate
- [ ] Test with different user roles (pharmacist, admin)
- [ ] Check for general issues (no patient info)
- [ ] Check for patient-specific issues
- [ ] Verify proper formatting of dates, currency, and quantities

## Security & Permissions

- ✅ Only Pharmacists and Admins can view product history
- ✅ Authentication required for all history endpoints
- ✅ Role-based access control implemented
- ✅ All operations logged for audit trail

## Performance Considerations

- History data is stored within the product document (embedded)
- Indexed on product ID for fast retrieval
- Pagination prevents large data transfers
- Filter options reduce query size
- Consider archiving old history if data grows too large (future enhancement)

## Future Enhancements

1. **Export to Excel/PDF**: Add download functionality for history reports
2. **Advanced Analytics**: Charts and graphs for historical trends
3. **Bulk History View**: View history across multiple products
4. **History Comparison**: Compare usage patterns between products
5. **Automated Reports**: Schedule periodic history reports via email
6. **Archive System**: Move old history to separate collection for better performance

## Troubleshooting

### History not showing
- Check if issues were created after this implementation
- Verify user has pharmacist or admin role
- Check browser console for API errors

### Statistics incorrect
- Verify all transactions have proper type field
- Check for null/undefined values in quantity or price fields
- Ensure calculations in backend controller are correct

### Performance issues
- Reduce page size (limit parameter)
- Use date filters to narrow down results
- Check database indexes on product ID

## Support

For issues or questions about the order history system:
1. Check this documentation
2. Review the code comments in the implementation files
3. Contact the development team
