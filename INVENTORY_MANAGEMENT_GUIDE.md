# 📦 Inventory Management System - Frontend Development Guide

## 🏥 Overview

This comprehensive guide provides detailed instructions for developing the Inventory Management module for the Hospital Management System. The module will handle medical supplies, equipment, and pharmaceutical inventory with complete CRUD operations, category management, and issue tracking for both outpatients and admitted patients.

## 🎯 Core Requirements

### Essential Features
1. **Product Management**
   - Add new products with detailed information
   - Edit existing product details
   - View product information and history
   - Delete products (with proper validation)

2. **Category Management**
   - Create new product categories
   - Manage category hierarchies
   - Assign products to categories
   - Category-based filtering and reporting

3. **Issue Management**
   - Issue products to outpatients (walk-in patients)
   - Issue products to admitted patients (inpatient tracking)
   - Track issue history and returns
   - Generate issue receipts and documentation

4. **Stock Management**
   - Real-time stock level monitoring
   - Low stock alerts and notifications
   - Automated reorder point management
   - Stock movement tracking (in/out/transfer)

## 🏗️ Architecture Implementation

### Component Structure (Atomic Design)

```
src/components/
├── atoms/
│   ├── StockBadge.jsx           # Stock level indicator
│   ├── CategoryChip.jsx         # Category display chip
│   ├── ProductStatus.jsx        # Product status indicator
│   ├── QuantityInput.jsx        # Quantity input field
│   └── ExpiryDateBadge.jsx      # Expiry date indicator
├── molecules/
│   ├── ProductCard.jsx          # Product information card
│   ├── CategorySelector.jsx     # Category selection dropdown
│   ├── StockAlert.jsx           # Stock alert component
│   ├── IssueForm.jsx            # Product issue form
│   └── ProductSearchBar.jsx     # Advanced product search
├── organisms/
│   ├── ProductsTable.jsx        # Main products data table
│   ├── CategoryManager.jsx      # Category management section
│   ├── IssueTracker.jsx         # Issue tracking table
│   ├── InventoryDashboard.jsx   # Dashboard overview
│   └── StockAlertsPanel.jsx     # Stock alerts panel
└── templates/
    ├── InventoryLayout.jsx      # Inventory-specific layout
    └── ProductDetailLayout.jsx  # Product detail view layout
```

### Page Structure

```
src/pages/inventory/
├── InventoryDashboard.jsx       # Main inventory overview
├── ProductsManagement.jsx       # Products CRUD operations
├── CategoriesManagement.jsx     # Category management
├── IssueManagement.jsx          # Product issue tracking
├── StockAlerts.jsx              # Low stock alerts
├── ProductDetail.jsx            # Individual product details
└── Reports.jsx                  # Inventory reports
```

## 📋 Feature Implementation Guide

### 1. Product Management

#### Add New Product Form
```jsx
// ProductAddForm.jsx
const ProductAddForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    sku: '',
    barcode: '',
    manufacturer: '',
    supplier: '',
    unitPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minimumStock: 0,
    reorderPoint: 0,
    expiryDate: null,
    batchNumber: '',
    location: '',
    status: 'active'
  });

  const categories = [
    'Medications',
    'Medical Supplies',
    'Equipment',
    'PPE',
    'Laboratory',
    'Surgical Instruments'
  ];
};
```

#### Product Data Model
```javascript
const productSchema = {
  id: String,
  name: String,
  description: String,
  category: {
    id: String,
    name: String,
    subcategory: String
  },
  sku: String,
  barcode: String,
  manufacturer: String,
  supplier: {
    id: String,
    name: String,
    contact: String
  },
  pricing: {
    unitPrice: Number,
    sellingPrice: Number,
    discount: Number
  },
  stock: {
    currentQuantity: Number,
    minimumStock: Number,
    reorderPoint: Number,
    reservedQuantity: Number
  },
  details: {
    expiryDate: Date,
    batchNumber: String,
    location: String,
    storageConditions: String
  },
  status: String, // 'active', 'inactive', 'discontinued'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String
};
```

### 2. Category Management

#### Category Structure
```jsx
// CategoryManager.jsx
const CategoryManager = () => {
  const categoryTypes = [
    {
      id: 'medications',
      name: 'Medications',
      subcategories: [
        'Antibiotics',
        'Pain Relievers',
        'Cardiovascular',
        'Respiratory',
        'Diabetes Care'
      ]
    },
    {
      id: 'medical-supplies',
      name: 'Medical Supplies',
      subcategories: [
        'Disposables',
        'Wound Care',
        'IV Supplies',
        'Laboratory Supplies'
      ]
    },
    {
      id: 'equipment',
      name: 'Medical Equipment',
      subcategories: [
        'Diagnostic Equipment',
        'Monitoring Devices',
        'Surgical Equipment',
        'Rehabilitation Equipment'
      ]
    }
  ];
};
```

### 3. Issue Management System

#### Issue Types
- **Outpatient Issues**: Direct sales to walk-in patients
- **Inpatient Issues**: Supplies for admitted patients
- **Department Issues**: Internal department transfers
- **Emergency Issues**: Critical/urgent supply requests

#### Issue Tracking Data Model
```javascript
const issueSchema = {
  id: String,
  issueNumber: String, // Auto-generated
  type: String, // 'outpatient', 'inpatient', 'department', 'emergency'
  patient: {
    id: String,
    name: String,
    type: String, // 'outpatient', 'inpatient'
    bedNumber: String, // for inpatients
    wardId: String // for inpatients
  },
  department: {
    id: String,
    name: String
  },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    batchNumber: String,
    expiryDate: Date
  }],
  issuedBy: {
    id: String,
    name: String,
    role: String
  },
  issuedTo: String,
  issueDate: Date,
  dueDate: Date, // for returns if applicable
  status: String, // 'pending', 'issued', 'partial', 'returned'
  notes: String,
  totalAmount: Number
};
```

### 4. Dashboard Components

#### Inventory Statistics
```jsx
// InventoryStats.jsx
const inventoryStats = [
  {
    title: 'Total Products',
    value: '1,234',
    icon: 'inventory',
    color: 'primary',
    trend: '+5.2%'
  },
  {
    title: 'Low Stock Alerts',
    value: '23',
    icon: 'warning',
    color: 'warning',
    trend: '-12%'
  },
  {
    title: 'Expired Items',
    value: '8',
    icon: 'error',
    color: 'error',
    trend: '+2'
  },
  {
    title: 'Total Value',
    value: '$2,45,680',
    icon: 'monetization_on',
    color: 'success',
    trend: '+8.1%'
  }
];
```

## 🎨 UI/UX Design Guidelines

### Color Coding System
- **Green**: In stock, available
- **Yellow/Orange**: Low stock warning
- **Red**: Out of stock, expired
- **Blue**: Reserved, issued
- **Gray**: Inactive, discontinued

### Status Indicators
```jsx
const statusColors = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'error',
  'expired': 'error',
  'reserved': 'info',
  'discontinued': 'default'
};
```

### Responsive Design
- **Desktop**: Full feature table with all columns
- **Tablet**: Condensed view with essential information
- **Mobile**: Card-based layout with collapsible details

## 🔧 Technical Implementation

### State Management
```jsx
// useInventory.js
const useInventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // CRUD operations
  const addProduct = async (productData) => { /* */ };
  const updateProduct = async (id, productData) => { /* */ };
  const deleteProduct = async (id) => { /* */ };
  const issueProduct = async (issueData) => { /* */ };
  
  return {
    products,
    categories,
    issues,
    alerts,
    loading,
    filters,
    setFilters,
    addProduct,
    updateProduct,
    deleteProduct,
    issueProduct
  };
};
```

### API Integration
```javascript
// inventoryAPI.js
const inventoryAPI = {
  // Products
  getProducts: (params) => api.get('/inventory/products', { params }),
  getProduct: (id) => api.get(`/inventory/products/${id}`),
  createProduct: (data) => api.post('/inventory/products', data),
  updateProduct: (id, data) => api.put(`/inventory/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/inventory/products/${id}`),
  
  // Categories
  getCategories: () => api.get('/inventory/categories'),
  createCategory: (data) => api.post('/inventory/categories', data),
  updateCategory: (id, data) => api.put(`/inventory/categories/${id}`, data),
  
  // Issues
  createIssue: (data) => api.post('/inventory/issues', data),
  getIssues: (params) => api.get('/inventory/issues', { params }),
  updateIssueStatus: (id, status) => api.patch(`/inventory/issues/${id}/status`, { status }),
  
  // Reports
  getStockAlerts: () => api.get('/inventory/alerts'),
  getInventoryReport: (params) => api.get('/inventory/reports', { params })
};
```

## 📊 Data Tables Configuration

### Products Table Columns
```javascript
const productColumns = [
  { field: 'sku', headerName: 'SKU', width: 120 },
  { field: 'name', headerName: 'Product Name', flex: 1 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'currentStock', headerName: 'Stock', width: 100 },
  { field: 'minStock', headerName: 'Min Stock', width: 100 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => <StockBadge status={params.value} />
  },
  { field: 'unitPrice', headerName: 'Unit Price', width: 120 },
  { field: 'expiryDate', headerName: 'Expiry', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 200,
    renderCell: (params) => (
      <ActionButtons
        actions={[
          { label: 'Edit', icon: 'edit', onClick: () => handleEdit(params.row) },
          { label: 'Issue', icon: 'send', onClick: () => handleIssue(params.row) },
          { label: 'Delete', icon: 'delete', onClick: () => handleDelete(params.row) }
        ]}
      />
    )
  }
];
```

## 🔍 Search and Filter System

### Advanced Search Features
- **Text Search**: Product name, SKU, barcode
- **Category Filter**: Multi-level category selection
- **Status Filter**: Stock status, expiry status
- **Price Range**: Min/max price filtering
- **Date Range**: Expiry date, creation date
- **Supplier Filter**: Filter by supplier/manufacturer

### Filter Component
```jsx
// InventoryFilters.jsx
const InventoryFilters = ({ filters, onFiltersChange }) => {
  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <ProductSearchBar
            value={filters.search}
            onChange={(value) => onFiltersChange({ ...filters, search: value })}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <CategorySelector
            value={filters.category}
            onChange={(value) => onFiltersChange({ ...filters, category: value })}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <StatusFilter
            value={filters.status}
            onChange={(value) => onFiltersChange({ ...filters, status: value })}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={(dates) => onFiltersChange({ ...filters, ...dates })}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
```

## 📱 Mobile Optimization

### Mobile-First Components
```jsx
// MobileProductCard.jsx
const MobileProductCard = ({ product }) => {
  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              SKU: {product.sku}
            </Typography>
            <CategoryChip category={product.category} />
          </Box>
          <StockBadge 
            quantity={product.currentStock} 
            minStock={product.minStock} 
          />
        </Box>
        
        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="body2">
            Price: ${product.unitPrice}
          </Typography>
          <Typography variant="body2">
            Expires: {formatDate(product.expiryDate)}
          </Typography>
        </Box>
        
        <Box mt={2}>
          <ActionButtons
            actions={[
              { label: 'Edit', onClick: () => handleEdit(product.id) },
              { label: 'Issue', onClick: () => handleIssue(product.id) }
            ]}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
```

## 🚨 Alert System

### Stock Alert Types
```javascript
const alertTypes = {
  LOW_STOCK: {
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Stock is below minimum threshold'
  },
  OUT_OF_STOCK: {
    type: 'error',
    title: 'Out of Stock',
    message: 'Product is completely out of stock'
  },
  EXPIRY_WARNING: {
    type: 'warning',
    title: 'Expiry Warning',
    message: 'Product will expire within 30 days'
  },
  EXPIRED: {
    type: 'error',
    title: 'Expired Product',
    message: 'Product has passed expiry date'
  },
  REORDER_POINT: {
    type: 'info',
    title: 'Reorder Point Reached',
    message: 'Product has reached reorder point'
  }
};
```

## 📄 Report Generation

### Report Types
1. **Stock Summary Report**: Current stock levels across all categories
2. **Movement Report**: Product issues and receipts over time period
3. **Expiry Report**: Products expiring within specified timeframe
4. **Value Report**: Inventory valuation and cost analysis
5. **Issue Report**: Patient/department issue history
6. **Supplier Report**: Supplier performance and procurement analysis

### Report Component
```jsx
// ReportGenerator.jsx
const ReportGenerator = () => {
  const reportTypes = [
    { value: 'stock-summary', label: 'Stock Summary' },
    { value: 'movement', label: 'Stock Movement' },
    { value: 'expiry', label: 'Expiry Report' },
    { value: 'valuation', label: 'Inventory Valuation' },
    { value: 'issues', label: 'Issue History' }
  ];

  const handleGenerateReport = async (reportType, parameters) => {
    const reportData = await inventoryAPI.generateReport(reportType, parameters);
    // Handle report generation and download
  };
};
```

## 🧪 Testing Strategy

### Unit Tests
- Component rendering tests
- Form validation tests
- Calculation logic tests
- API integration tests

### Integration Tests
- Complete workflow tests (add product → issue product)
- Form submission and data persistence
- Search and filter functionality
- Real-time updates and notifications

### E2E Tests
- Complete inventory management workflows
- Multi-user scenarios (concurrent access)
- Data consistency across operations
- Report generation and export

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up basic component structure
- [ ] Implement product data model
- [ ] Create basic CRUD operations
- [ ] Set up routing and navigation

### Phase 2: Core Features (Week 3-4)
- [ ] Product management interface
- [ ] Category management system
- [ ] Basic search and filtering
- [ ] Stock level monitoring

### Phase 3: Issue Management (Week 5-6)
- [ ] Issue creation and tracking
- [ ] Patient/department assignment
- [ ] Issue history and reporting
- [ ] Return/adjustment handling

### Phase 4: Advanced Features (Week 7-8)
- [ ] Advanced reporting system
- [ ] Real-time alerts and notifications
- [ ] Mobile optimization
- [ ] Data export functionality

### Phase 5: Testing & Polish (Week 9-10)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] Documentation completion

## 📚 Development Resources

### Required Dependencies
```json
{
  "dependencies": {
    "@mui/x-data-grid": "^6.0.0",
    "@mui/x-date-pickers": "^6.0.0",
    "react-hook-form": "^7.0.0",
    "yup": "^1.0.0",
    "react-query": "^3.39.0",
    "recharts": "^2.5.0"
  }
}
```

### Useful Utilities
- **Date Formatting**: dayjs for date manipulations
- **Form Validation**: react-hook-form + yup
- **Data Fetching**: react-query for API state management
- **Charts**: recharts for inventory analytics
- **Export**: xlsx for Excel export functionality

## 🎯 Success Metrics

### Key Performance Indicators
- **Functionality**: All CRUD operations working correctly
- **Performance**: Page load times < 2 seconds
- **Usability**: User task completion rate > 95%
- **Reliability**: Error rate < 1%
- **Responsiveness**: Works seamlessly on all device sizes

### Quality Checklist
- [ ] All forms have proper validation
- [ ] Error states are handled gracefully
- [ ] Loading states provide user feedback
- [ ] Data is properly cached and synchronized
- [ ] Components are accessible (WCAG compliant)
- [ ] Mobile experience is optimized
- [ ] Performance metrics meet requirements

---

## 🤝 Next Steps

1. **Start with Foundation Phase**: Set up the basic component structure
2. **Follow Atomic Design**: Build components from atoms up to organisms
3. **Implement Incrementally**: Focus on one feature at a time
4. **Test Continuously**: Write tests as you develop features
5. **Gather Feedback**: Regular reviews and user testing

This guide provides the comprehensive foundation for building a robust, scalable, and user-friendly Inventory Management System. Follow the atomic design principles, maintain consistency with the existing architecture, and focus on creating an intuitive user experience for healthcare professionals.

---

**Ready to build an amazing inventory management system! 🚀**