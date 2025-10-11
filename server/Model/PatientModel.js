const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientId: { type: String, required: true, unique: true },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },          // ✅ Add this field
  bloodType: { type: String },
  lastVisit: { type: Date },
  condition: { type: String },
  treatment: { type: String },
  admitWard: { type: String },
  doctor: { type: String },           // ✅ Add this field
  prescription: { type: String },     // ✅ Add this field
  admittedDate: { type: Date },
  status: { type: String, enum: ['Active', 'Completed', 'Pending', 'Discharged'], default: 'Pending' } // ✅ Add 'Discharged'
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);