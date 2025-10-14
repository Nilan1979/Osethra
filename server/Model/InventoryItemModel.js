const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const inventoryItemSchema = new Schema({
    // Reference to Product Master
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    
    // Batch-specific Information
    batchNumber: { 
        type: String,
        required: [true, 'Batch number is required'],
        trim: true,
        uppercase: true
    },
    manufactureDate: { 
        type: Date,
        required: [true, 'Manufacture date is required']
    },
    expiryDate: { 
        type: Date,
        required: [true, 'Expiry date is required'],
        validate: {
            validator: function(value) {
                return value > this.manufactureDate;
            },
            message: 'Expiry date must be after manufacture date'
        }
    },
    
    // Stock Information
    quantity: { 
        type: Number, 
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    
    // Stock Thresholds (batch-specific)
    minStock: {
        type: Number,
        min: [0, 'Minimum stock cannot be negative'],
        default: 10,
        required: [true, 'Minimum stock threshold is required']
    },
    reorderPoint: {
        type: Number,
        min: [0, 'Reorder point cannot be negative'],
        default: 20,
        required: [true, 'Reorder point is required']
    },
    
    // Availability Status (auto-calculated)
    availability: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'],
        default: 'in-stock'
    },
    
    // Pricing Information (can vary per batch/purchase)
    buyingPrice: { 
        type: Number, 
        required: [true, 'Buying price is required'],
        min: [0.01, 'Buying price must be greater than 0']
    },
    sellingPrice: { 
        type: Number, 
        required: [true, 'Selling price is required'],
        min: [0.01, 'Selling price must be greater than 0']
    },
    
    // Storage Information
    storageLocation: { 
        type: String,
        trim: true
    },
    
    // Purchase/Receipt Information
    supplierName: {
        type: String,
        trim: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    receiptNumber: {
        type: String,
        trim: true
    },
    
    // Status
    status: { 
        type: String, 
        enum: ['available', 'reserved', 'expired', 'depleted'],
        default: 'available'
    },
    
    // Notes
    notes: { 
        type: String,
        trim: true
    },
    
    // Metadata
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Transaction History
    transactions: [{
        type: {
            type: String,
            enum: ['receipt', 'issue', 'return', 'adjustment', 'transfer']
        },
        quantity: Number,
        balanceAfter: Number,
        reference: String, // Issue number, receipt number, etc.
        date: {
            type: Date,
            default: Date.now
        },
        performedBy: {
            id: Schema.Types.ObjectId,
            name: String,
            role: String
        },
        notes: String
    }]
}, { 
    timestamps: true 
});

// Compound unique index to ensure batch + expiry + manufacture date combination is unique per product
inventoryItemSchema.index({ 
    product: 1, 
    batchNumber: 1, 
    expiryDate: 1, 
    manufactureDate: 1 
}, { 
    unique: true,
    name: 'unique_inventory_item'
});

// Indexes for performance
inventoryItemSchema.index({ product: 1, status: 1 });
inventoryItemSchema.index({ expiryDate: 1, status: 1 });
inventoryItemSchema.index({ quantity: 1, status: 1 });
inventoryItemSchema.index({ batchNumber: 1 });

// Pre-save middleware to check expiry status and calculate availability
inventoryItemSchema.pre('save', function(next) {
    const today = new Date();
    
    // Update expiry status
    if (this.expiryDate < today && this.status === 'available') {
        this.status = 'expired';
    }
    if (this.quantity === 0 && this.status === 'available') {
        this.status = 'depleted';
    }
    
    // Calculate and update availability based on quantity
    if (this.quantity === 0) {
        this.availability = 'out-of-stock';
    } else if (this.quantity <= this.minStock) {
        this.availability = 'low-stock';
    } else {
        this.availability = 'in-stock';
    }
    
    next();
});

// Virtual for days until expiry
inventoryItemSchema.virtual('daysUntilExpiry').get(function() {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for expiry status
inventoryItemSchema.virtual('expiryStatus').get(function() {
    const daysLeft = this.daysUntilExpiry;
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'expiring-soon';
    if (daysLeft <= 90) return 'expiring-warning';
    return 'good';
});

// Virtual for stock status (enhanced with reorder point)
inventoryItemSchema.virtual('stockStatus').get(function() {
    if (this.quantity === 0) return 'depleted';
    if (this.quantity <= this.minStock) return 'low';
    if (this.quantity <= this.reorderPoint) return 'reorder-soon';
    return 'adequate';
});

// Virtual for needs reorder
inventoryItemSchema.virtual('needsReorder').get(function() {
    return this.quantity <= this.reorderPoint && this.quantity > 0;
});

// Virtual for recommended reorder quantity
inventoryItemSchema.virtual('recommendedReorderQty').get(function() {
    if (this.quantity <= this.reorderPoint) {
        // Recommend ordering enough to reach double the reorder point
        return Math.max(this.reorderPoint * 2 - this.quantity, this.minStock);
    }
    return 0;
});

// Ensure virtuals are included in JSON
inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

// Static method to add stock
inventoryItemSchema.statics.addStock = async function(itemData, userId) {
    const InventoryItem = this;
    
    // Check if item with same batch/expiry/manufacture already exists
    const existingItem = await InventoryItem.findOne({
        product: itemData.product,
        batchNumber: itemData.batchNumber,
        expiryDate: itemData.expiryDate,
        manufactureDate: itemData.manufactureDate
    });
    
    if (existingItem) {
        // Update existing item
        existingItem.quantity += itemData.quantity;
        existingItem.updatedBy = userId;
        existingItem.transactions.push({
            type: 'receipt',
            quantity: itemData.quantity,
            balanceAfter: existingItem.quantity,
            reference: itemData.receiptNumber,
            performedBy: {
                id: userId
            },
            notes: itemData.notes
        });
        await existingItem.save();
        return existingItem;
    } else {
        // Create new item
        const newItem = new InventoryItem({
            ...itemData,
            createdBy: userId,
            transactions: [{
                type: 'receipt',
                quantity: itemData.quantity,
                balanceAfter: itemData.quantity,
                reference: itemData.receiptNumber,
                performedBy: {
                    id: userId
                },
                notes: 'Initial stock receipt'
            }]
        });
        await newItem.save();
        return newItem;
    }
};

// Static method to deduct stock
inventoryItemSchema.statics.deductStock = async function(itemId, quantity, userId, reference, notes) {
    const item = await this.findById(itemId);
    
    if (!item) {
        throw new Error('Inventory item not found');
    }
    
    if (item.quantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`);
    }
    
    item.quantity -= quantity;
    item.updatedBy = userId;
    item.transactions.push({
        type: 'issue',
        quantity: -quantity,
        balanceAfter: item.quantity,
        reference,
        performedBy: {
            id: userId
        },
        notes
    });
    
    await item.save();
    return item;
};

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
