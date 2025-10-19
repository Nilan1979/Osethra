// server/Routes/ScheduleRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  getSchedulesByDoctor,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getAvailableSlots,
  getDoctorsWithSchedules
} = require("../Controllers/ScheduleController");
const { authenticate } = require("../Middleware/authMiddleware");

// Public routes (for receptionists to view)
router.get("/available-slots", getAvailableSlots);
router.get("/doctors-with-schedules", getDoctorsWithSchedules);

// Protected routes
router.post("/", authenticate, createSchedule);
router.get("/", authenticate, getAllSchedules);
router.get("/doctor/:doctorId", authenticate, getSchedulesByDoctor);
router.get("/:id", authenticate, getScheduleById);
router.put("/:id", authenticate, updateSchedule);
router.delete("/:id", authenticate, deleteSchedule);

module.exports = router;
