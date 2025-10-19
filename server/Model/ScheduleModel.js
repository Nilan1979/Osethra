// server/Model/ScheduleModel.js
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialty: {
    type: String,
    default: "General"
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  slotDuration: {
    type: Number,
    default: 30 // Duration in minutes
  },
  maxAppointments: {
    type: Number,
    default: 1 // Number of appointments per slot
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ""
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

// Index for faster queries
scheduleSchema.index({ doctorId: 1, date: 1 });

// Update the updatedAt timestamp before saving
scheduleSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Schedule", scheduleSchema);
