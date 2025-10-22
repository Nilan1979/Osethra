# 📊 Osethra Hospital - Reports & Analytics Guide

## Overview
Comprehensive reporting system for inventory management, financial analysis, and operational insights.

## 🎯 Available Reports

### 1. Stock Status Report
**Purpose**: Monitor current inventory levels and identify stock alerts

**Features**:
- Real-time stock levels for all products
- Stock status indicators (In Stock, Low Stock, Out of Stock)
- Total inventory valuation
- Batch count per product
- Filter by category, status, and stock level

**Use Cases**:
- Daily stock monitoring
- Identify products needing reorder
- Inventory valuation for accounting
- Stock audit preparation

**Filters**:
- Category (Analgesics, Antibiotics, Vitamins, etc.)
- Product Status (Active, Inactive)
- Stock Status (In Stock, Low Stock, Out of Stock)

---

### 2. Batch & Expiry Report
**Purpose**: Track medication expiry dates and prevent waste

**Features**:
- Batch-wise inventory tracking
- Days until expiry calculation
- Color-coded alerts:
  - 🔴 **Expired** - Already expired
  - 🟠 **Critical** - Expiring within 30 days
  - 🟡 **Warning** - Expiring within 90 days
  - 🟢 **Fresh** - More than 90 days
- Total value at risk calculation
- Storage location tracking

**Use Cases**:
- Prevent medication waste
- FIFO/FEFO stock rotation
- Compliance with regulatory requirements
- Inventory write-off planning

**Filters**:
- Category
- Time Period (30, 60, 90, 180 days)
- Expiry Status

---

### 3. Issues/Dispensing Report
**Purpose**: Track all medication dispensing transactions

**Features**:
- Complete dispensing history
- Transaction details (patient, department, items, amounts)
- Issue type classification:
  - Outpatient
  - Inpatient
  - Emergency
  - Department
  - General
- Status tracking (Issued, Pending, Partial, Cancelled)
- Total revenue calculation

**Use Cases**:
- Daily sales reconciliation
- Patient dispensing history
- Department consumption tracking
- Pharmacist performance analysis

**Filters**:
- Date Range (Start and End Date)
- Issue Type
- Status

---

### 4. Sales & Revenue Report
**Purpose**: Financial performance analysis and revenue tracking

**Features**:
- **Financial Summary**:
  - Total Revenue
  - Total Cost (estimated)
  - Total Profit
  - Profit Margin %
  - Average Transaction Value

- **Category Analysis**:
  - Revenue by medication category
  - Profit by category
  - Profit margin per category

- **Top Products**:
  - Top 20 selling products
  - Quantity sold
  - Revenue generated

- **Daily Trend**:
  - Day-by-day sales breakdown
  - Transaction count
  - Items dispensed

**Use Cases**:
- Monthly financial reporting
- Category performance evaluation
- Identify best-selling products
- Revenue trend analysis

**Filters**:
- Date Range (Start and End Date)

---

## 🚀 How to Access Reports

### Navigation
1. Login as **Pharmacist** or **Admin**
2. Go to Dashboard
3. Click on **"Reports"** card
4. Or navigate directly to: `/pharmacist/reports`

### Using the Reports Interface

#### Step 1: Select Report Type
Click on one of the four report cards at the top:
- 📦 Stock Status Report
- ⏰ Batch & Expiry Report
- 🚚 Issues/Dispensing Report
- 💰 Sales & Revenue Report

#### Step 2: Apply Filters
Each report has specific filters:
- Select filter criteria from dropdown menus
- Choose date ranges where applicable
- Apply category filters if needed

#### Step 3: Generate Report
- Click **"Generate"** button to fetch data
- View summary cards with key metrics
- Scroll through detailed tables

#### Step 4: Export Report (PDF)
- Click **"PDF"** button to download
- PDF includes:
  - Report header with generation date
  - Summary statistics
  - Detailed data tables
  - Formatted for printing

---

## 📋 Report Features

### Common Features
All reports include:
- ✅ Real-time data from database
- ✅ Summary statistics cards
- ✅ Filterable data
- ✅ Sortable tables
- ✅ PDF export capability
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

### Visual Indicators
- **Color-coded chips** for status
- **Summary cards** with visual hierarchy
- **Hover effects** on table rows
- **Icons** for quick recognition

---

## 🔧 Technical Implementation

### Backend API Endpoints

```
GET /api/reports/stock-status
GET /api/reports/batch-expiry
GET /api/reports/issues
GET /api/reports/sales-revenue
```

**Query Parameters**:
- `format`: `json` | `pdf` | `excel` (default: json)
- Additional filters specific to each report

### Frontend Components

```
client/src/pages/inventory/Reports.jsx                 (Main Dashboard)
client/src/pages/inventory/reports/
  ├── StockStatusReport.jsx
  ├── BatchExpiryReport.jsx
  ├── IssuesReport.jsx
  └── SalesRevenueReport.jsx
```

### API Integration

```javascript
import reportsAPI from '../../../api/reports';

// Fetch report data
const data = await reportsAPI.getStockStatusReport(filters);

// Download PDF
const blob = await reportsAPI.downloadStockStatusPDF(filters);
```

---

## 📊 Sample Data Insights

### Stock Status Report
```
Total Products: 23
In Stock: 18
Low Stock: 3
Out of Stock: 2
Total Value: Rs. 245,680.00
```

### Batch/Expiry Report
```
Total Batches: 15
Expired: 1
Critical (< 30 days): 2
Warning (< 90 days): 4
Value at Risk: Rs. 12,450.00
```

### Issues Report
```
Total Issues: 47
Total Amount: Rs. 89,234.50
Total Items: 156
Total Quantity: 523 units
```

### Sales/Revenue Report
```
Total Revenue: Rs. 125,500.00
Total Cost: Rs. 75,300.00
Total Profit: Rs. 50,200.00
Profit Margin: 40.0%
```

---

## 🎨 UI/UX Features

### Report Dashboard
- **Tab Navigation**: Switch between reports using tabs
- **Card Selection**: Click on report cards to activate
- **Sticky Headers**: Table headers stay visible while scrolling
- **Responsive Grid**: Adapts to different screen sizes

### Data Visualization
- **Summary Cards**: Quick metrics at a glance
- **Color Coding**:
  - Blue: Primary information
  - Green: Positive indicators (in stock, profit)
  - Orange: Warnings (low stock, expiring)
  - Red: Critical alerts (out of stock, expired)

### User Feedback
- **Loading Spinner**: Shows while fetching data
- **Error Alerts**: Clear error messages
- **Success Feedback**: Confirmation on PDF download
- **Empty States**: Friendly messages when no data

---

## 📈 Future Enhancements

### Phase 2 (Planned)
- [ ] Excel export (`.xlsx`)
- [ ] CSV export for data analysis
- [ ] Email scheduled reports
- [ ] Chart visualizations (line, bar, pie charts)
- [ ] Customizable report templates
- [ ] Saved filter presets

### Phase 3 (Advanced)
- [ ] Predictive analytics
- [ ] Automated alerts
- [ ] Comparative analysis (month-over-month)
- [ ] Custom report builder
- [ ] Dashboard widgets

---

## 🐛 Troubleshooting

### Report Not Loading
- **Check**: Internet connection
- **Check**: User permissions (Pharmacist/Admin only)
- **Check**: Browser console for errors
- **Solution**: Refresh page or re-login

### PDF Download Fails
- **Check**: Popup blocker settings
- **Check**: Browser download permissions
- **Solution**: Allow downloads for this site

### No Data Showing
- **Check**: Applied filters might be too restrictive
- **Check**: Date range validity
- **Solution**: Reset filters and try again

### Incorrect Totals
- **Check**: Ensure all inventory items have prices
- **Check**: Verify date range covers intended period
- **Solution**: Contact admin if data seems incorrect

---

## 📝 Best Practices

### Daily Operations
1. Run **Stock Status Report** every morning
2. Check **Batch/Expiry Report** weekly
3. Review **Issues Report** daily for reconciliation
4. Generate **Sales Report** monthly for accounting

### Monthly Tasks
1. Generate full Sales/Revenue report
2. Export reports to PDF for records
3. Review category performance
4. Identify slow-moving stock

### Compliance
1. Keep PDF records of all reports
2. Document expired medication disposal
3. Maintain audit trail
4. Regular inventory reconciliation

---

## 🔒 Security & Access Control

### Permissions
- **Pharmacist**: Full access to all reports
- **Admin**: Full access to all reports
- **Nurse**: Read-only access (Stock Status, Batch/Expiry, Issues)
- **Doctor**: No access to reports

### Data Privacy
- Patient names anonymized in exports (if configured)
- Secure API endpoints with authentication
- Audit logging for report access

---

## 📞 Support

For issues or feature requests:
- Contact: IT Department
- Email: support@osethra.hospital
- Phone: +94-XX-XXXXXXX

---

## ✅ Testing Checklist

Before going live:
- [ ] Test all 4 report types
- [ ] Verify filters work correctly
- [ ] Test PDF downloads
- [ ] Check on different screen sizes
- [ ] Validate calculations with manual count
- [ ] Test with different user roles
- [ ] Verify date range functionality
- [ ] Test error handling

---

## 📚 Related Documentation

- [Inventory Management Guide](./INVENTORY_MANAGEMENT_GUIDE.md)
- [Add Product Guide](./ADD_PRODUCT_GUIDE.md)
- [Pharmacist Dashboard Summary](./PHARMACIST_DASHBOARD_SUMMARY.md)

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
