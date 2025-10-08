const MedicalRequest = require('../Model/MedicalRequestModel');

// Get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await MedicalRequest.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Add new request
const addRequest = async (req, res) => {
  try {
    const request = new MedicalRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err });
  }
};

// Update request status
const updateRequest = async (req, res) => {
  try {
    const request = await MedicalRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err });
  }
};

// Delete request
const deleteRequest = async (req, res) => {
  try {
    await MedicalRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err });
  }
};

module.exports = {
  getAllRequests,
  addRequest,
  updateRequest,
  deleteRequest
};
