# 📦 Inventory Components Library

## Overview
This document catalogs all reusable inventory components following Atomic Design principles.

---

## 🔬 Atoms (Basic Building Blocks)

### 1. StockBadge
**File**: `components/Inventory/atoms/StockBadge.jsx`

**Purpose**: Display stock level status with color-coded badges

**Props**:
```javascript
{
  quantity: Number,    // Current stock quantity
  minStock: Number,    // Minimum stock threshold
  size: String        // 'small' | 'medium' | 'large' (default: 'medium')
}
```

**Usage**:
```jsx
<StockBadge quantity={45} minStock={100} size="small" />
```

**Output**:
- Quantity = 0: 🔴 "Out of Stock"
- Percentage < 50%: 🔴 "Critical"
- Percentage < 100%: 🟠 "Low Stock"
- Percentage >= 100%: 🟢 "In Stock"

---

### 2. CategoryChip
**File**: `components/Inventory/atoms/CategoryChip.jsx`

**Purpose**: Display product category with icon and color

**Props**:
```javascript
{
  category: String,     // Category name
  size: String,         // 'small' | 'medium' (default: 'small')
  variant: String       // 'filled' | 'outlined' (default: 'filled')
}
```

**Usage**:
```jsx
<CategoryChip category="Medications" size="small" variant="filled" />
```

**Categories**:
- 💊 **Medications** - Blue (#1976d2)
- 🏥 **Medical Supplies** - Green (#2e7d32)
- 🔬 **Laboratory** - Cyan (#0288d1)
- 😷 **PPE** - Orange (#ed6c02)
- 🔪 **Surgical Instruments** - Red (#d32f2f)
- ⚙️ **Equipment** - Purple (#9c27b0)

---

### 3. ExpiryDateBadge
**File**: `components/Inventory/atoms/ExpiryDateBadge.jsx`

**Purpose**: Display expiry date with countdown and urgency indicator

**Props**:
```javascript
{
  expiryDate: String,   // ISO date string (YYYY-MM-DD)
  size: String          // 'small' | 'medium' (default: 'small')
}
```

**Usage**:
```jsx
<ExpiryDateBadge expiryDate="2025-10-15" size="small" />
```

**Logic**:
- Already expired: 🔴 "Expired"
- Expires today: 🔴 "Expires Today"
- <= 7 days: 🔴 "Xd left"
- <= 30 days: 🟠 "Xd left"
- > 30 days: ⚪ "MM/DD/YYYY"

---

### 4. ProductStatus
**File**: `components/Inventory/atoms/ProductStatus.jsx`

**Purpose**: Display product status

**Props**:
```javascript
{
  status: String,       // 'active' | 'inactive' | 'discontinued' | 'reserved'
  size: String          // 'small' | 'medium' (default: 'small')
}
```

**Usage**:
```jsx
<ProductStatus status="active" size="small" />
```

**Statuses**:
- ✅ **Active** - Green (success)
- ⚪ **Inactive** - Gray (default)
- 🔴 **Discontinued** - Red (error)
- 🔵 **Reserved** - Blue (info)

---

### 5. QuantityInput
**File**: `components/Inventory/atoms/QuantityInput.jsx`

**Purpose**: Number input with increment/decrement buttons

**Props**:
```javascript
{
  value: Number,        // Current quantity
  onChange: Function,   // Callback(newValue)
  min: Number,          // Minimum value (default: 0)
  max: Number,          // Maximum value (default: 999999)
  label: String         // Input label (default: "Quantity")
}
```

**Usage**:
```jsx
<QuantityInput 
  value={5} 
  onChange={(qty) => setQuantity(qty)}
  min={1}
  max={100}
  label="Order Quantity"
/>
```

**Features**:
- [-] button decrements
- [+] button increments
- Direct input supported
- Min/max validation
- Buttons disable at limits

---

## 🧬 Molecules (Composite Components)

### 1. ProductCard
**File**: `components/Inventory/molecules/ProductCard.jsx`

**Purpose**: Display product information in card format

**Props**:
```javascript
{
  product: {
    id: String,
    name: String,
    sku: String,
    category: String,
    stock: Number,
    minStock: Number,
    unitPrice: Number,
    expiryDate: String,
    batchNumber: String,
    status: String
  },
  onEdit: Function,     // Callback(product)
  onDelete: Function,   // Callback(product)
  onIssue: Function     // Callback(product)
}
```

**Usage**:
```jsx
<ProductCard 
  product={productData}
  onEdit={(p) => handleEdit(p)}
  onDelete={(p) => handleDelete(p)}
  onIssue={(p) => handleIssue(p)}
/>
```

**Features**:
- Avatar with product initial
- Category chip
- Stock badge
- Expiry date badge
- Batch number chip
- Action buttons (Edit, Issue, Delete)
- Hover animation

---

### 2. ProductSearchBar
**File**: `components/Inventory/molecules/ProductSearchBar.jsx`

**Purpose**: Search input with clear functionality

**Props**:
```javascript
{
  value: String,            // Current search value
  onChange: Function,       // Callback(newValue)
  onClear: Function,        // Optional callback on clear
  placeholder: String       // Placeholder text (default: "Search products...")
}
```

**Usage**:
```jsx
<ProductSearchBar 
  value={searchTerm}
  onChange={setSearchTerm}
  onClear={() => console.log('Cleared')}
  placeholder="Search by name or SKU..."
/>
```

**Features**:
- Search icon prefix
- Clear button (appears when has value)
- Instant filtering
- Keyboard accessible

---

### 3. CategorySelector
**File**: `components/Inventory/molecules/CategorySelector.jsx`

**Purpose**: Dropdown for category selection

**Props**:
```javascript
{
  value: String,        // Selected category
  onChange: Function,   // Callback(newValue)
  label: String,        // Dropdown label (default: "Category")
  multiple: Boolean     // Allow multiple selection (default: false)
}
```

**Usage**:
```jsx
<CategorySelector 
  value={category}
  onChange={setCategory}
  label="Product Category"
  multiple={false}
/>
```

**Categories**:
- All Categories
- Medications
- Medical Supplies
- Equipment
- PPE
- Laboratory
- Surgical Instruments

---

### 4. StockAlert
**File**: `components/Inventory/molecules/StockAlert.jsx`

**Purpose**: Alert component for stock warnings

**Props**:
```javascript
{
  type: String,         // 'low-stock' | 'out-of-stock' | 'expiry-warning' | 'expired'
  product: {
    id: String,
    name: String,
    sku: String,
    stock: Number,
    category: String
  },
  onAction: Function    // Callback(product)
}
```

**Usage**:
```jsx
<StockAlert 
  type="low-stock"
  product={productData}
  onAction={(p) => handleReorder(p)}
/>
```

**Alert Types**:
- ⚠️ **Low Stock** - Warning severity, "Reorder Now" button
- 🔴 **Out of Stock** - Error severity, "Order Immediately" button
- ⚠️ **Expiry Warning** - Warning severity, "Review Stock" button
- 🔴 **Expired** - Error severity, "Remove from Stock" button

---

## 📋 Usage Examples

### Example 1: Product List with Cards
```jsx
import ProductCard from './components/Inventory/molecules/ProductCard';

function ProductList({ products }) {
  return (
    <Grid container spacing={2}>
      {products.map(product => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard 
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onIssue={handleIssue}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

### Example 2: Search and Filter Bar
```jsx
import ProductSearchBar from './components/Inventory/molecules/ProductSearchBar';
import CategorySelector from './components/Inventory/molecules/CategorySelector';

function FilterBar({ filters, onFiltersChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <ProductSearchBar 
          value={filters.search}
          onChange={(val) => onFiltersChange({ ...filters, search: val })}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <CategorySelector 
          value={filters.category}
          onChange={(val) => onFiltersChange({ ...filters, category: val })}
        />
      </Grid>
    </Grid>
  );
}
```

### Example 3: Alert Dashboard
```jsx
import StockAlert from './components/Inventory/molecules/StockAlert';

function AlertDashboard({ alerts }) {
  return (
    <Box>
      {alerts.lowStock.map(product => (
        <StockAlert 
          key={product.id}
          type="low-stock"
          product={product}
          onAction={handleReorder}
        />
      ))}
      {alerts.expired.map(product => (
        <StockAlert 
          key={product.id}
          type="expired"
          product={product}
          onAction={handleRemove}
        />
      ))}
    </Box>
  );
}
```

---

## 🎨 Styling Guidelines

### Colors
All components use the theme colors:
- **Primary**: `#2e7d32` (Green)
- **Warning**: `#ed6c02` (Orange)
- **Error**: `#d32f2f` (Red)
- **Info**: `#1976d2` (Blue)
- **Success**: `#2e7d32` (Green)

### Spacing
- Small components: 8px padding
- Medium components: 16px padding
- Large components: 24px padding

### Typography
- Font family: 'Inter', 'Roboto', sans-serif
- Headings: 600-700 weight
- Body: 400 weight
- Captions: 400 weight, smaller size

### Borders
- Border radius: 8-12px
- Border width: 1px
- Border color: `#e0e0e0`

---

## 🔧 Customization

### Extending Components

You can extend components with additional props:

```jsx
// Extended ProductCard with custom actions
<ProductCard 
  product={product}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onIssue={handleIssue}
  onView={handleView}           // Custom action
  showBatch={true}               // Custom prop
  highlightLowStock={true}       // Custom prop
/>
```

### Custom Styling

Override styles using `sx` prop:

```jsx
<StockBadge 
  quantity={45}
  minStock={100}
  sx={{ 
    fontSize: '1.2rem',
    padding: '8px 16px'
  }}
/>
```

---

## 📚 Related Documentation

- **Main Dashboard**: `PharmacistDashboard.jsx`
- **Pages**: `pages/inventory/`
- **API**: `api/inventory.js`
- **Guides**: 
  - `INVENTORY_MANAGEMENT_GUIDE.md`
  - `PHARMACIST_DASHBOARD_SUMMARY.md`
  - `PHARMACIST_NAVIGATION_GUIDE.md`

---

**Version**: 1.0.0
**Last Updated**: October 2, 2025
**Maintainer**: Development Team
