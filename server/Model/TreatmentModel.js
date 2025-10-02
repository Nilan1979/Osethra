const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  }
});

const treatmentSchema = new mongoose.Schema({
  // Patient information (can be from User or directly from appointment)
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional since patients might not be registered users
  },
  patientInfo: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true }
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  symptoms: [{
    type: String,
    required: true,
    trim: true
  }],
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatmentPlan: {
    type: String,
    required: true,
    trim: true
  },
  prescriptions: [prescriptionSchema],
  needsAdmission: {
    type: Boolean,
    default: false
  },
  admissionReason: {
    type: String,
    trim: true,
    default: ''
  },
  followUpDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
treatmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
treatmentSchema.index({ 'patientInfo.name': 1 });
treatmentSchema.index({ 'patientInfo.contact': 1 });
treatmentSchema.index({ doctorId: 1 });
treatmentSchema.index({ appointmentId: 1 });
treatmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Treatment', treatmentSchema);