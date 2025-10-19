// server/Controllers/ScheduleController.js
const Schedule = require("../Model/ScheduleModel");
const User = require("../Model/UserModel");

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { doctorId, doctorName, doctorSpecialty, date, startTime, endTime, slotDuration, maxAppointments, notes } = req.body;

    // Validate required fields
    if (!doctorId || !doctorName || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields: doctorId, doctorName, date, startTime, endTime" 
      });
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    // Check for overlapping schedules
    const overlapping = await Schedule.findOne({
      doctorId,
      date: new Date(date),
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        success: false, 
        message: "This time slot overlaps with an existing schedule" 
      });
    }

    const schedule = new Schedule({
      doctorId,
      doctorName,
      doctorSpecialty: doctorSpecialty || "General",
      date: new Date(date),
      startTime,
      endTime,
      slotDuration: slotDuration || 30,
      maxAppointments: maxAppointments || 1,
      notes: notes || ""
    });

    await schedule.save();

    res.status(201).json({ 
      success: true, 
      message: "Schedule created successfully", 
      schedule 
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating schedule", 
      error: error.message 
    });
  }
};

// Get all schedules (for receptionists)
exports.getAllSchedules = async (req, res) => {
  try {
    const { date, doctorId, isAvailable } = req.query;
    
    let query = {};
    
    if (date) {
      query.date = new Date(date);
    }
    
    if (doctorId) {
      query.doctorId = doctorId;
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    }

    const schedules = await Schedule.find(query)
      .populate("doctorId", "name email role")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ 
      success: true, 
      count: schedules.length,
      schedules 
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching schedules", 
      error: error.message 
    });
  }
};

// Get schedules by doctor ID
exports.getSchedulesByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate, isAvailable } = req.query;

    let query = { doctorId };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    }

    const schedules = await Schedule.find(query)
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ 
      success: true, 
      count: schedules.length,
      schedules 
    });
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching doctor schedules", 
      error: error.message 
    });
  }
};

// Get a single schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id)
      .populate("doctorId", "name email role");

    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      schedule 
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching schedule", 
      error: error.message 
    });
  }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if schedule exists
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }

    // If updating time, check for overlaps
    if (updates.startTime || updates.endTime || updates.date) {
      const startTime = updates.startTime || schedule.startTime;
      const endTime = updates.endTime || schedule.endTime;
      const date = updates.date ? new Date(updates.date) : schedule.date;

      const overlapping = await Schedule.findOne({
        _id: { $ne: id },
        doctorId: schedule.doctorId,
        date: date,
        $or: [
          { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
          { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
      });

      if (overlapping) {
        return res.status(400).json({ 
          success: false, 
          message: "Updated time slot overlaps with an existing schedule" 
        });
      }
    }

    // Update the schedule
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Schedule updated successfully", 
      schedule: updatedSchedule 
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating schedule", 
      error: error.message 
    });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }

    await Schedule.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Schedule deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting schedule", 
      error: error.message 
    });
  }
};

// Get available schedules for a specific doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide doctorId and date" 
      });
    }

    const schedules = await Schedule.find({
      doctorId,
      date: new Date(date),
      isAvailable: true
    }).sort({ startTime: 1 });

    res.status(200).json({ 
      success: true, 
      count: schedules.length,
      schedules 
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching available slots", 
      error: error.message 
    });
  }
};

// Get all doctors who have schedules
exports.getDoctorsWithSchedules = async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = { isAvailable: true };
    
    if (date) {
      query.date = new Date(date);
    }

    const schedules = await Schedule.find(query)
      .populate("doctorId", "name email")
      .sort({ doctorName: 1 });

    // Get unique doctors
    const doctorsMap = new Map();
    schedules.forEach(schedule => {
      if (!doctorsMap.has(schedule.doctorId._id.toString())) {
        doctorsMap.set(schedule.doctorId._id.toString(), {
          _id: schedule.doctorId._id,
          name: schedule.doctorName,
          specialty: schedule.doctorSpecialty,
          email: schedule.doctorId.email
        });
      }
    });

    const doctors = Array.from(doctorsMap.values());

    res.status(200).json({ 
      success: true, 
      count: doctors.length,
      doctors 
    });
  } catch (error) {
    console.error("Error fetching doctors with schedules:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching doctors with schedules", 
      error: error.message 
    });
  }
};
