const Patient = require('../Model/PatientModel');

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new patient
exports.addPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.json(savedPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a patient
exports.updatePatient = async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a patient
exports.deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
