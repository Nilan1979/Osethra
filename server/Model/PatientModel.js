const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientId: { type: String, required: true, unique: true },
  age: { type: Number },
  gender: { type: String },
  bloodType: { type: String },
  lastVisit: { type: Date },
  condition: { type: String },
  treatment: { type: String },
  admitWard: { type: String },
  admittedDate: { type: Date },
  status: { type: String, enum: ['Active', 'Completed', 'Pending'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
