# Issue History Total Value Fix

## Problem
The Total Value column in the Issue History page was showing Rs. 0.00 for all issues.

## Root Cause
The `calculateTotalValue` function was looking for incorrect field names in the issue items:
- **Looking for:** `item.product.price` or `item.price`
- **Actual fields in database:** `item.unitPrice` and `item.totalPrice`

According to the IssueModel schema, each item has:
```javascript
{
    productId: ObjectId,
    productName: String,
    quantity: Number,
    unitPrice: Number,      // ← This field was missing
    totalPrice: Number,     // ← This field was missing
    batchNumber: String,
    expiryDate: Date
}
```

## Files Fixed

### 1. client/src/pages/pharmacy/IssueHistory.jsx

#### Fix 1: calculateTotalValue Function (Line ~159)
**Before:**
```javascript
const calculateTotalValue = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
    }, 0);
};
```

**After:**
```javascript
const calculateTotalValue = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
        // Use totalPrice if available, otherwise calculate from unitPrice * quantity
        const itemTotal = item.totalPrice || (item.unitPrice || item.product?.price || item.price || 0) * (item.quantity || 0);
        return sum + itemTotal;
    }, 0);
};
```

#### Fix 2: Issue Details Dialog - Individual Item Prices (Line ~520)
**Before:**
```javascript
<Typography variant="body2" color="primary" fontWeight="600">
    Rs. {((item.product?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
</Typography>
```

**After:**
```javascript
<Typography variant="body2" color="primary" fontWeight="600">
    Rs. {(item.totalPrice || (item.unitPrice || item.product?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
</Typography>
```

#### Fix 3: Issue Details Dialog - Unit Price Display (Line ~528)
**Before:**
```javascript
<Typography variant="caption" color="text.secondary">
    Quantity: {item.quantity || 0} × Rs. {(item.product?.price || item.price || 0).toFixed(2)}
</Typography>
```

**After:**
```javascript
<Typography variant="caption" color="text.secondary">
    Quantity: {item.quantity || 0} × Rs. {(item.unitPrice || item.product?.price || item.price || 0).toFixed(2)}
</Typography>
```

#### Fix 4: Patient/Department Name in Table (Line ~385)
**Before:**
```javascript
{issue.patientName || issue.department || 'N/A'}
```

**After:**
```javascript
{issue.patient?.name || issue.department?.name || 'N/A'}
```

#### Fix 5: Patient/Department Name in Dialog (Line ~487)
**Before:**
```javascript
{selectedIssue.patientName || selectedIssue.department || 'N/A'}
```

**After:**
```javascript
{selectedIssue.patient?.name || selectedIssue.department?.name || 'N/A'}
```

## Changes Summary

### Price Field Mapping
| Location | Old Field | New Field (Priority Order) |
|----------|-----------|---------------------------|
| Total calculation | `item.price` × `item.quantity` | `item.totalPrice` → `item.unitPrice` × `item.quantity` |
| Item total display | `item.product?.price` × `item.quantity` | `item.totalPrice` → `item.unitPrice` × `item.quantity` |
| Unit price display | `item.product?.price` | `item.unitPrice` → `item.product?.price` |

### Patient/Department Field Mapping
| Location | Old Field | New Field |
|----------|-----------|-----------|
| Table display | `issue.patientName` \|\| `issue.department` | `issue.patient?.name` \|\| `issue.department?.name` |
| Dialog display | `selectedIssue.patientName` \|\| `selectedIssue.department` | `selectedIssue.patient?.name` \|\| `selectedIssue.department?.name` |

## Testing

After this fix, the Issue History page should now:
1. ✅ Display correct total values in the main table
2. ✅ Show correct individual item prices in the details dialog
3. ✅ Display correct unit prices in the quantity breakdown
4. ✅ Calculate accurate totals in the dialog footer
5. ✅ Show patient/department names correctly

## Example Data Structure

When an issue is fetched from the backend, it should look like:
```json
{
    "_id": "...",
    "issueNumber": "ISU-2025-00001",
    "type": "outpatient",
    "patient": {
        "name": "John Doe",
        "id": "PAT001"
    },
    "items": [
        {
            "productId": "...",
            "productName": "Paracetamol",
            "quantity": 10,
            "unitPrice": 5.00,
            "totalPrice": 50.00,
            "batchNumber": "BATCH001"
        }
    ],
    "totalAmount": 50.00,
    "issuedBy": {
        "id": "...",
        "name": "Pharmacist Name"
    },
    "issueDate": "2025-10-08T12:00:00Z",
    "status": "issued"
}
```

## Result

The Total Value column now correctly displays the sum of all item prices for each issue, using the `totalPrice` field from the database or calculating it from `unitPrice × quantity` as a fallback.
