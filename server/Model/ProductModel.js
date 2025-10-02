const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters'],
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    sku: { 
        type: String, 
        required: [true, 'SKU is required'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    category: { 
        type: String, 
        required: [true, 'Category is required'],
        index: true
    },
    description: { 
        type: String,
        trim: true
    },
    manufacturer: { 
        type: String,
        trim: true
    },
    supplier: { 
        type: String,
        trim: true
    },
    
    // Pricing Information
    buyingPrice: { 
        type: Number, 
        required: [true, 'Buying price is required'],
        min: [0.01, 'Buying price must be greater than 0']
    },
    sellingPrice: { 
        type: Number, 
        required: [true, 'Selling price is required'],
        min: [0.01, 'Selling price must be greater than 0'],
        validate: {
            validator: function(value) {
                return value >= this.buyingPrice;
            },
            message: 'Selling price must be greater than or equal to buying price'
        }
    },
    profitMargin: { 
        type: Number,
        default: 0
    },
    
    // Stock Information
    currentStock: { 
        type: Number, 
        required: [true, 'Current stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    minStock: { 
        type: Number, 
        required: [true, 'Minimum stock is required'],
        min: [0, 'Minimum stock cannot be negative']
    },
    maxStock: { 
        type: Number,
        min: [0, 'Maximum stock cannot be negative']
    },
    reorderPoint: { 
        type: Number,
        min: [0, 'Reorder point cannot be negative']
    },
    unit: { 
        type: String, 
        required: [true, 'Unit is required'],
        enum: ['pieces', 'boxes', 'bottles', 'vials', 'strips', 'packets', 'tablets', 'capsules', 'ml', 'liters', 'grams', 'kg']
    },
    
    // Product Details
    batchNumber: { 
        type: String,
        trim: true
    },
    manufactureDate: { 
        type: Date
    },
    expiryDate: { 
        type: Date,
        index: true,
        validate: {
            validator: function(value) {
                if (!value || !this.manufactureDate) return true;
                return value > this.manufactureDate;
            },
            message: 'Expiry date must be after manufacture date'
        }
    },
    storageLocation: { 
        type: String,
        trim: true
    },
    barcode: { 
        type: String,
        trim: true,
        sparse: true,
        unique: true
    },
    
    // Status and Flags
    prescription: { 
        type: Boolean, 
        default: false 
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active',
        index: true
    },
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
    }
}, { 
    timestamps: true 
});

// Pre-save middleware to calculate profit margin
productSchema.pre('save', function(next) {
    if (this.buyingPrice && this.sellingPrice) {
        this.profitMargin = ((this.sellingPrice - this.buyingPrice) / this.buyingPrice) * 100;
        this.profitMargin = Math.round(this.profitMargin * 100) / 100; // Round to 2 decimal places
    }
    next();
});

// Indexes for performance optimization
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' }); // Text search
productSchema.index({ category: 1, status: 1 }); // Compound index for filtering
productSchema.index({ currentStock: 1, minStock: 1 }); // For stock alerts
productSchema.index({ expiryDate: 1, status: 1 }); // For expiry alerts

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.currentStock === 0) return 'out-of-stock';
    if (this.currentStock <= this.minStock) return 'low-stock';
    if (this.currentStock < this.minStock * 1.5) return 'critical';
    return 'in-stock';
});

// Virtual for days until expiry
productSchema.virtual('daysUntilExpiry').get(function() {
    if (!this.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
