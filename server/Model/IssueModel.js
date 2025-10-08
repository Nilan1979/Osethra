const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const issueItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative']
    },
    batchNumber: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    }
}, { _id: false });

const issueSchema = new Schema({
    issueNumber: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: [true, 'Issue type is required'],
        enum: ['outpatient', 'inpatient', 'department', 'emergency']
    },
    
    // Patient Information (for outpatient and inpatient)
    patient: {
        id: {
            type: String
        },
        name: {
            type: String
        },
        type: {
            type: String,
            enum: ['outpatient', 'inpatient']
        },
        bedNumber: {
            type: String
        },
        wardId: {
            type: String
        }
    },
    
    // Department Information (for department issues)
    department: {
        id: {
            type: String
        },
        name: {
            type: String
        }
    },
    
    // Items being issued
    items: [issueItemSchema],
    
    // Issue metadata
    issuedBy: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
    
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    status: {
        type: String,
        enum: ['pending', 'issued', 'partial', 'returned', 'cancelled'],
        default: 'issued'
    },
    
    notes: {
        type: String,
        trim: true
    },
    
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    
    // Link to prescription if applicable
    prescriptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Prescription'
    }
}, { 
    timestamps: true 
});

// Pre-save middleware to auto-generate issue number
issueSchema.pre('save', async function(next) {
    if (this.isNew && !this.issueNumber) {
        try {
            const year = new Date().getFullYear();
            const prefix = 'ISU';
            
            // Find the latest issue number for this year
            const latestIssue = await this.constructor.findOne({
                issueNumber: new RegExp(`^${prefix}-${year}-`)
            }).sort({ issueNumber: -1 });
            
            let sequence = 1;
            if (latestIssue) {
                const lastSequence = parseInt(latestIssue.issueNumber.split('-')[2]);
                sequence = lastSequence + 1;
            }
            
            this.issueNumber = `${prefix}-${year}-${String(sequence).padStart(5, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Indexes for performance
issueSchema.index({ issueNumber: 1 });
issueSchema.index({ type: 1, status: 1 });
issueSchema.index({ issueDate: -1 }); // For sorting by date
issueSchema.index({ 'issuedBy.id': 1 });
issueSchema.index({ 'patient.id': 1 });

module.exports = mongoose.model('Issue', issueSchema);
