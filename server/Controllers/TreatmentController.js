const Treatment = require('../Model/TreatmentModel');
const User = require('../Model/UserModel');
const Appointment = require('../Model/AppointmentModel');

// Create a new treatment
const createTreatment = async (req, res) => {
  try {
    const {
      patientInfo, // Patient information from appointment
      doctorId,
      appointmentId,
      symptoms,
      diagnosis,
      treatmentPlan,
      prescriptions,
      needsAdmission,
      admissionReason,
      followUpDate
    } = req.body;

    // Validate required fields
    if (!patientInfo || !doctorId || !appointmentId || !symptoms || !diagnosis || !treatmentPlan) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientInfo, doctorId, appointmentId, symptoms, diagnosis, and treatmentPlan are required'
      });
    }

    // Validate patient info structure
    if (!patientInfo.name || !patientInfo.age || !patientInfo.gender || !patientInfo.contact || !patientInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'Complete patient information (name, age, gender, contact, address) is required'
      });
    }

    // Verify that the doctor exists and has the correct role
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID or user is not a doctor'
      });
    }

    // Verify that the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Create the treatment
    const treatment = new Treatment({
      patientInfo,
      doctorId,
      appointmentId,
      symptoms: symptoms.filter(symptom => symptom.trim() !== ''), // Remove empty symptoms
      diagnosis,
      treatmentPlan,
      prescriptions: prescriptions ? prescriptions.filter(p => p.medicineName.trim() !== '') : [], // Remove empty prescriptions
      needsAdmission: needsAdmission || false,
      admissionReason: needsAdmission ? admissionReason : '',
      followUpDate: followUpDate || null
    });

    const savedTreatment = await treatment.save();

    // Update appointment status to completed
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });

    // Populate the treatment with doctor details
    const populatedTreatment = await Treatment.findById(savedTreatment._id)
      .populate('doctorId', 'name email role')
      .populate('appointmentId');

    res.status(201).json({
      success: true,
      message: 'Treatment created successfully',
      data: populatedTreatment
    });

  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all treatments
const getAllTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find()
      .populate('doctorId', 'name email role')
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: treatments
    });
  } catch (error) {
    console.error('Error fetching all treatments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatments',
      error: error.message
    });
  }
};

// Get all treatments for a doctor
const getTreatmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const treatments = await Treatment.find({ doctorId })
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: treatments
    });
  } catch (error) {
    console.error('Error fetching treatments by doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all treatments for a patient (by patient name or contact)
const getTreatmentsByPatient = async (req, res) => {
  try {
    const { patientIdentifier } = req.params; // Can be name or contact

    const treatments = await Treatment.find({
      $or: [
        { 'patientInfo.name': new RegExp(patientIdentifier, 'i') },
        { 'patientInfo.contact': patientIdentifier }
      ]
    })
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'date time reason')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: treatments
    });
  } catch (error) {
    console.error('Error fetching treatments by patient:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get treatment by ID
const getTreatmentById = async (req, res) => {
  try {
    const { treatmentId } = req.params;

    const treatment = await Treatment.findById(treatmentId)
      .populate('doctorId', 'name email role')
      .populate('appointmentId');

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: treatment
    });
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update treatment
const updateTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const updateData = req.body;

    // Remove empty symptoms and prescriptions
    if (updateData.symptoms) {
      updateData.symptoms = updateData.symptoms.filter(symptom => symptom.trim() !== '');
    }
    if (updateData.prescriptions) {
      updateData.prescriptions = updateData.prescriptions.filter(p => p.medicineName.trim() !== '');
    }

    const treatment = await Treatment.findByIdAndUpdate(
      treatmentId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name email role')
      .populate('appointmentId');

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Treatment updated successfully',
      data: treatment
    });
  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete treatment
const deleteTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;

    const treatment = await Treatment.findByIdAndDelete(treatmentId);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Treatment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get treatment by appointment
const getTreatmentByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const treatment = await Treatment.findOne({ appointmentId })
      .populate('doctorId', 'name email role')
      .populate('appointmentId');

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'No treatment found for this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: treatment
    });
  } catch (error) {
    console.error('Error fetching treatment by appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createTreatment,
  getAllTreatments,
  getTreatmentsByDoctor,
  getTreatmentsByPatient,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
  getTreatmentByAppointment
};
