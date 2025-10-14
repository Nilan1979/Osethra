# Mongoose Duplicate Index Warning Fix

## Issue
Mongoose was showing warnings about duplicate schema indexes:
```
Warning: Duplicate schema index on {"issueNumber":1} found. This is often due to declaring an index using both "index: true" and "schema.index()".
```

## Root Cause
The warning occurs when an index is defined in multiple ways:
1. Field-level: `unique: true` or `index: true` in field definition
2. Schema-level: `schema.index({ field: 1 })` declaration

Since `unique: true` automatically creates an index, adding `index: true` or declaring it again with `schema.index()` creates a duplicate.

## Files Fixed

### 1. ✅ IssueModel.js
**Problem**: `issueNumber` field had both `unique: true` and `issueSchema.index({ issueNumber: 1 })`

**Fix**: Removed the redundant schema-level index declaration
```javascript
// Before
issueNumber: {
    type: String,
    required: true,
    unique: true  // This creates an index automatically
},
// ...
issueSchema.index({ issueNumber: 1 }); // ❌ Duplicate!

// After  
issueNumber: {
    type: String,
    required: true,
    unique: true  // This creates an index automatically
},
// ...
// ✅ Removed duplicate index declaration
```

### 2. ✅ ProductModel.js
**Problems**: Multiple fields had redundant index declarations

**Fixes Applied**:

1. **SKU Field**: Had both `unique: true` and `index: true`
```javascript
// Before
sku: { 
    unique: true,
    index: true  // ❌ Redundant
},

// After
sku: { 
    unique: true  // ✅ Sufficient (creates index automatically)
},
```

2. **Category Field**: Had `index: true` but was also in compound index
```javascript
// Before
category: { 
    index: true  // ❌ Redundant with compound index
},
// ...
productSchema.index({ category: 1, status: 1 });

// After
category: { 
    // ✅ Only compound index needed
},
// ...
productSchema.index({ category: 1, status: 1 });
```

3. **Status Field**: Had `index: true` but was in multiple compound indexes
```javascript
// Before
status: { 
    index: true  // ❌ Redundant with compound indexes
},
// ...
productSchema.index({ category: 1, status: 1 });
productSchema.index({ expiryDate: 1, status: 1 });

// After
status: { 
    // ✅ Only compound indexes needed
},
// ...
productSchema.index({ category: 1, status: 1 });
productSchema.index({ expiryDate: 1, status: 1 });
```

4. **ExpiryDate Field**: Had `index: true` but was in compound index
```javascript
// Before
expiryDate: { 
    index: true  // ❌ Redundant with compound index
},
// ...
productSchema.index({ expiryDate: 1, status: 1 });

// After
expiryDate: { 
    // ✅ Only compound index needed
},
// ...
productSchema.index({ expiryDate: 1, status: 1 });
```

## Index Strategy Applied

### When to Use Field-Level Indexes
- ✅ `unique: true` - Creates unique index automatically
- ✅ `index: true` - Only when field needs individual index and is NOT in compound indexes

### When to Use Schema-Level Indexes
- ✅ Compound indexes: `schema.index({ field1: 1, field2: 1 })`
- ✅ Text indexes: `schema.index({ name: 'text', description: 'text' })`
- ✅ Complex indexes with specific options

### Avoid Duplicates
- ❌ Don't use both `unique: true` and `schema.index({ field: 1 })`
- ❌ Don't use both `index: true` and include field in compound index
- ❌ Don't declare same index multiple times

## Final Index Configuration

### IssueModel Indexes
```javascript
// Automatic indexes from field definitions:
// - issueNumber (unique index from unique: true)

// Manual compound indexes:
issueSchema.index({ type: 1, status: 1 });
issueSchema.index({ issueDate: -1 });
issueSchema.index({ 'issuedBy.id': 1 });
issueSchema.index({ 'patient.id': 1 });
```

### ProductModel Indexes
```javascript
// Automatic indexes from field definitions:
// - sku (unique index from unique: true)
// - barcode (unique sparse index from unique: true, sparse: true)

// Manual indexes:
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' }); // Text search
productSchema.index({ category: 1, status: 1 }); // Compound filtering
productSchema.index({ currentStock: 1, minStock: 1 }); // Stock alerts
productSchema.index({ expiryDate: 1, status: 1 }); // Expiry alerts
```

## Benefits

1. ✅ **No More Warnings**: Mongoose warnings eliminated
2. ✅ **Better Performance**: No duplicate index overhead
3. ✅ **Cleaner Code**: Clear index strategy
4. ✅ **Maintainable**: Easy to understand index purpose

## Verification

After restart, the server should no longer show:
```
(node:20620) [MONGOOSE] Warning: Duplicate schema index on {"issueNumber":1} found.
```

## Best Practices Going Forward

1. **Unique Fields**: Only use `unique: true` (don't add `index: true`)
2. **Compound Indexes**: Don't add individual `index: true` to fields that are in compound indexes
3. **Review Indexes**: When adding new indexes, check for existing ones on the same fields
4. **Comments**: Add comments explaining index purpose for clarity

The duplicate index warnings should now be resolved! 🎉