const mongoose = require('mongoose');

const MedicalRequestSchema = new mongoose.Schema({
  wardname: { type: String, required: true },
  medication: { type: String, required: true },
  quantity: { type: Number, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  date: { type: Date, default: Date.now }
});

const MedicalRequest = mongoose.model('MedicalRequest', MedicalRequestSchema);
module.exports = MedicalRequest;
