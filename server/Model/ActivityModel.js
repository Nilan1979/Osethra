const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'product_added',
            'product_updated',
            'product_deleted',
            'issue_created',
            'issue_updated',
            'prescription_created',
            'prescription_dispensed',
            'stock_adjusted',
            'category_added',
            'category_deleted',
            'low_stock_alert',
            'expiry_alert'
        ],
        index: true
    },
    
    description: {
        type: String,
        required: true,
        trim: true
    },
    
    // User who performed the action
    user: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    
    // Reference to the entity affected
    entityType: {
        type: String,
        enum: ['Product', 'Issue', 'Prescription', 'Category'],
        index: true
    },
    
    entityId: {
        type: Schema.Types.ObjectId,
        index: true
    },
    
    entityName: {
        type: String,
        trim: true
    },
    
    // Additional metadata
    metadata: {
        type: Schema.Types.Mixed
    },
    
    // Severity for alerts
    severity: {
        type: String,
        enum: ['info', 'warning', 'error', 'success'],
        default: 'info'
    },
    
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { 
    timestamps: false // We're using timestamp field instead
});

// Index for efficient querying
activitySchema.index({ timestamp: -1 }); // For sorting by recent first
activitySchema.index({ type: 1, timestamp: -1 }); // For filtering by type
activitySchema.index({ 'user.id': 1, timestamp: -1 }); // For user-specific activities

// Auto-delete activities older than 90 days (optional, can be configured)
activitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('Activity', activitySchema);
