const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const medicationSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true
    },
    dosage: {
        type: String,
        required: [true, 'Dosage is required'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true
    },
    instructions: {
        type: String,
        trim: true
    },
    frequency: {
        type: String,
        trim: true
    }
}, { _id: false });

const prescriptionSchema = new Schema({
    prescriptionNumber: {
        type: String,
        unique: true,
        sparse: true // Allow undefined during creation
    },
    
    // Patient Information
    patient: {
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other']
        },
        contactNo: {
            type: String
        }
    },
    
    // Doctor Information
    doctor: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        specialization: {
            type: String
        },
        licenseNumber: {
            type: String
        }
    },
    
    // Medications prescribed
    medications: [medicationSchema],
    
    // Prescription metadata
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    time: {
        type: String,
        required: true
    },
    
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'partial'],
        default: 'pending'
    },
    
    // Dispensing information
    dispensedBy: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String
        }
    },
    
    dispensedAt: {
        type: Date
    },
    
    // Additional information
    diagnosis: {
        type: String,
        trim: true
    },
    
    notes: {
        type: String,
        trim: true
    },
    
    // Reference to issue if medications were dispensed
    issueId: {
        type: Schema.Types.ObjectId,
        ref: 'Issue'
    },
    
    // Follow-up information
    followUpDate: {
        type: Date
    },
    
    priority: {
        type: String,
        enum: ['normal', 'urgent', 'emergency'],
        default: 'normal'
    }
}, { 
    timestamps: true 
});

// Pre-save middleware to auto-generate prescription number
prescriptionSchema.pre('save', async function(next) {
    if (this.isNew && !this.prescriptionNumber) {
        try {
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const prefix = 'RX';
            
            // Find the latest prescription number for this month
            const latestPrescription = await this.constructor.findOne({
                prescriptionNumber: new RegExp(`^${prefix}-${year}${month}-`)
            }).sort({ prescriptionNumber: -1 });
            
            let sequence = 1;
            if (latestPrescription) {
                const lastSequence = parseInt(latestPrescription.prescriptionNumber.split('-')[2]);
                sequence = lastSequence + 1;
            }
            
            this.prescriptionNumber = `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Indexes for performance
// prescriptionNumber already has index from unique: true
prescriptionSchema.index({ status: 1, date: -1 });
prescriptionSchema.index({ 'patient.id': 1 });
prescriptionSchema.index({ 'doctor.id': 1 });
prescriptionSchema.index({ date: -1 }); // For sorting by date

// Virtual for medication count
prescriptionSchema.virtual('medicationCount').get(function() {
    return this.medications ? this.medications.length : 0;
});

// Ensure virtuals are included in JSON
prescriptionSchema.set('toJSON', { virtuals: true });
prescriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
