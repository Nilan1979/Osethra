const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    // Basic Information
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
        trim: true
    },
    category: { 
        type: String, 
        required: [true, 'Category is required']
    },
    description: { 
        type: String,
        trim: true
    },
    unit: { 
        type: String, 
        required: [true, 'Unit is required'],
        enum: ['pieces', 'boxes', 'bottles', 'vials', 'strips', 'packets', 'tablets', 'capsules', 'ml', 'liters', 'grams', 'kg']
    },
    barcode: { 
        type: String,
        trim: true,
        sparse: true,
        unique: true
    },
    
    // Manufacturing Details
    manufacturer: { 
        type: String,
        trim: true
    },
    
    // Prescription Requirement
    prescription: { 
        type: Boolean, 
        default: false 
    },
    
    // Status
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active'
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

// Indexes for performance optimization
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' }); // Text search
productSchema.index({ category: 1, status: 1 }); // Compound index for filtering

// Virtual for total stock (calculated from inventory items)
productSchema.virtual('totalStock', {
    ref: 'InventoryItem',
    localField: '_id',
    foreignField: 'product',
    justOne: false
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
