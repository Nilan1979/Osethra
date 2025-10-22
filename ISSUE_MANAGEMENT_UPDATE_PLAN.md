# Issue Management Update Plan

## Problem
The Issue Management system is still using the old Product model structure with `currentStock` field, but we've migrated to a new architecture where:
- **Product Model**: Contains only master data (name, SKU, category, etc.)
- **InventoryItem Model**: Contains batch-level stock data (quantity, batch number, expiry date, etc.)

## Required Updates

### Backend Changes

#### 1. Update IssueController.js - createIssue function
**Current:** Checks `product.currentStock` and deducts from it
**Needed:** 
- Fetch inventory items for each product
- Select appropriate batch (FEFO - First Expiry First Out)
- Deduct from InventoryItem quantity
- Handle multiple batches if needed

#### 2. Update IssueController.js - Stock Validation
**Current:** `if (product.currentStock < item.quantity)`
**Needed:**
- Aggregate total available stock from all inventory items
- Check against requested quantity
- Return detailed stock info (batches available)

#### 3. Update Issue Model
**Current:** Stores single batch per item
**Needed:** May need to store multiple batches if one batch isn't enough

### Frontend Changes

#### 1. Update IssueManagement.jsx - Product Fetching
**Current:** Fetches products with `currentStock`
**Needed:**
- Fetch products
- Fetch inventory items
- Calculate total available stock per product
- Group by product with batch details

#### 2. Update IssueManagement.jsx - Stock Display
**Current:** Shows `product.currentStock`
**Needed:**
- Show aggregated stock from all batches
- Display batch details when adding to cart
- Show expiry dates

#### 3. Update IssueManagement.jsx - Cart Management
**Current:** Simple product-based cart
**Needed:**
- Support batch selection
- Auto-select batches based on FEFO
- Show batch and expiry in cart

## Implementation Strategy

### Phase 1: Backend API Update (Priority: HIGH)
1. Create new `createIssueWithInventory` function
2. Implement FEFO batch selection logic
3. Update stock validation to use InventoryItems
4. Add transaction support for multi-batch deductions

### Phase 2: Frontend Update (Priority: HIGH)  
1. Update product fetching to include inventory data
2. Add batch selection UI
3. Update cart to show batch information
4. Implement automatic batch selection

### Phase 3: Testing (Priority: HIGH)
1. Test single-batch dispensing
2. Test multi-batch dispensing
3. Test stock validation
4. Test prescription integration

## Quick Fix (Temporary)
Add a virtual property to Product model that calculates current stock from inventory items.

## Recommended Approach
Full refactor to properly support the new inventory architecture with batch tracking.

