# 🗺️ Pharmacist Dashboard - Navigation Guide

## Dashboard Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    PHARMACIST DASHBOARD                      │
│                 /pharmacist/dashboard                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   PRODUCTS   │      │    ISSUES    │      │    ALERTS    │
│  MANAGEMENT  │      │  MANAGEMENT  │      │   & REPORTS  │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Page Routes

### 1. Main Dashboard
**Route**: `/pharmacist/dashboard`

**Features**:
- 📊 4 Statistics Cards (Products, Low Stock, Expired, Value)
- 🎯 4 Quick Action Cards
- ⚠️ Low Stock Alerts (Top 5)
- 📅 Expiry Warnings (Critical items)
- 📋 Recent Activities

**Actions**:
- "Add Product" → `/pharmacist/products/add`
- "New Issue" → `/pharmacist/issues/new`
- "Manage Products" → `/pharmacist/products`
- "Issue Products" → `/pharmacist/issues`
- "Stock Alerts" → `/pharmacist/alerts`
- "Reports" → `/pharmacist/reports`

---

### 2. Products Management
**Route**: `/pharmacist/products`

**Features**:
- 🔍 Advanced Search Bar
- 🏷️ Category Filter
- ✅ Status Filter
- 📊 Grid/List View Toggle
- 📄 Pagination (12 per page)

**Product Card Actions**:
- ✏️ Edit Product
- 🛒 Issue Product
- 🗑️ Delete Product

**Sample Products**:
```
1. Paracetamol 500mg     - Stock: 450/100  - $0.50
2. Amoxicillin 250mg     - Stock: 12/50    - $1.20 (LOW)
3. Surgical Gloves (M)   - Stock: 25/200   - $0.30 (LOW)
4. Face Masks (N95)      - Stock: 150/150  - $2.50
5. Insulin Vials         - Stock: 80/50    - $25.00
6. Syringes 5ml          - Stock: 500/200  - $0.15
```

---

### 3. Issue Management
**Route**: `/pharmacist/issues/new`

**Workflow** (4 Steps):

```
Step 1: SELECT TYPE           Step 2: PATIENT DETAILS
┌──────────────────┐         ┌──────────────────┐
│ □ Outpatient     │         │ Name:  _______   │
│ □ Inpatient      │    →    │ ID:    _______   │
│ □ Department     │         │ Ward:  _______   │
│ □ Emergency      │         │ Bed:   _______   │
└──────────────────┘         └──────────────────┘
                                      │
Step 4: REVIEW & CONFIRM     Step 3: SELECT PRODUCTS
┌──────────────────┐         ┌──────────────────┐
│ Patient: John D. │    ←    │ Search: [____]   │
│ ───────────────  │         │ ┌──────────────┐ │
│ Paracetamol x5   │         │ │ + Paracetamol│ │
│ Amoxicillin x10  │         │ │ + Amoxicillin│ │
│ ───────────────  │         │ └──────────────┘ │
│ Total: $17.50    │         │ Qty: [- 5 +]     │
│ [Issue Products] │         └──────────────────┘
└──────────────────┘
```

---

### 4. Stock Alerts
**Route**: `/pharmacist/alerts`

**Alert Categories** (Tabs):
```
┌─────────────────────────────────────────────────────┐
│  Low Stock (3) │ Out of Stock (2) │ Expiring (3) │ Expired (1) │
├─────────────────────────────────────────────────────┤
│ ⚠️ Amoxicillin 250mg                                │
│    Stock: 12 / 50    [■■□□□□] 24%                  │
│                                                      │
│ ⚠️ Surgical Gloves (M)                              │
│    Stock: 25 / 200   [■□□□□□] 12%                  │
│                                                      │
│ ⚠️ Ibuprofen 400mg                                  │
│    Stock: 30 / 80    [■■□□□□] 37%                  │
└─────────────────────────────────────────────────────┘
```

**Alert Severities**:
- 🔴 **Critical** (<50% of min stock)
- 🟠 **Warning** (50-100% of min stock)
- 🟢 **In Stock** (>100% of min stock)

---

## Component Hierarchy

```
PharmacistDashboard
│
├── Header (Gradient banner with stats)
├── StatCards (4 cards)
│   ├── Total Products
│   ├── Low Stock Alerts
│   ├── Expired Items
│   └── Inventory Value
│
├── QuickActions (4 cards)
│   ├── Manage Products
│   ├── Issue Products
│   ├── Stock Alerts
│   └── Reports
│
├── LowStockAlerts (List)
│   └── ProductCard (with progress bar)
│
├── ExpiryAlerts (List)
│   └── ProductCard (with countdown)
│
└── RecentActivities (Timeline)
    └── ActivityItem (with icon)
```

---

## User Workflows

### 🔄 Common Tasks

#### Task 1: Check Stock Levels
1. Login → Auto-redirect to dashboard
2. View "Low Stock Alerts" panel
3. Click alert → Navigate to product
4. Or click "Stock Alerts" → View all alerts

#### Task 2: Issue Medication to Patient
1. Dashboard → Click "New Issue" button
2. Select "Outpatient" type
3. Enter patient details
4. Search and add products
5. Adjust quantities
6. Review and confirm

#### Task 3: Add New Product
1. Dashboard → Click "Add Product"
2. Fill product details form
3. Set category and pricing
4. Set stock levels
5. Add expiry date
6. Submit

#### Task 4: Monitor Expiring Products
1. Dashboard → View "Expiry Alerts"
2. Or navigate to Stock Alerts page
3. Click "Expiry Warnings" tab
4. Review products with <30 days
5. Take action (remove/discount)

---

## Color Legend

### Status Colors
- 🟢 **Green (#2e7d32)**: In Stock, Active, Success
- 🟠 **Orange (#ed6c02)**: Low Stock, Warning
- 🔴 **Red (#d32f2f)**: Out of Stock, Critical, Expired
- 🔵 **Blue (#1976d2)**: Info, Issues, Reserved
- ⚪ **Gray (#757575)**: Inactive, Discontinued

### Category Colors
- 💊 **Medications**: Blue (#1976d2)
- 🏥 **Medical Supplies**: Green (#2e7d32)
- 🔬 **Laboratory**: Cyan (#0288d1)
- 😷 **PPE**: Orange (#ed6c02)
- 🔪 **Surgical**: Red (#d32f2f)
- ⚙️ **Equipment**: Purple (#9c27b0)

---

## Data Flow

```
User Action
    ↓
React Component
    ↓
API Service (inventory.js)
    ↓
Axios Config
    ↓
Backend API (to be implemented)
    ↓
Database
    ↓
Response → Update UI State
```

---

## Mock Data vs Real Data

### Currently Using Mock Data:
- ✅ Dashboard statistics
- ✅ Product listings
- ✅ Alert notifications
- ✅ Recent activities

### Ready for Backend Integration:
- API functions defined in `api/inventory.js`
- Error handling implemented
- Loading states configured
- Success/error notifications ready

---

## Keyboard Shortcuts (Future Feature)

- `Ctrl + K`: Quick search products
- `Ctrl + N`: New product
- `Ctrl + I`: New issue
- `Ctrl + A`: View alerts
- `Ctrl + R`: Generate report

---

**Last Updated**: October 2, 2025
**Version**: 1.0.0
**Status**: ✅ UI Complete, Ready for Backend Integration
