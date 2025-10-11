// AddPatientForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddPatientForm = ({ onAdded, prefillData }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    age: '',
    gender: '',
    address: '',
    condition: '',
    admitWard: '',
    treatment: '',
    doctor: '',
    prescription: '',
    admittedDate: '',
    status: 'Pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle prefill data from Doctor Referrals and set current date
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    if (prefillData) {
      // Use the patientId that comes from DoctorReferralsSection
      const patientId = prefillData.patientId || '';
      
      // Extract address from original treatment data if available
      const address = prefillData.originalTreatment?.patientInfo?.address || '';
      
      // Extract doctor name from original treatment data
      const doctor = prefillData.originalTreatment?.doctorId?.name || '';
      
      // Format prescriptions from original treatment data
      const prescription = prefillData.originalTreatment?.prescriptions 
        ? prefillData.originalTreatment.prescriptions.map(p => 
            `${p.medicineName} - ${p.dosage}, ${p.frequency}, ${p.duration}${p.instructions ? ` (${p.instructions})` : ''}`
          ).join('; ')
        : '';

      setFormData({
        patientName: prefillData.patientName || '',
        patientId: patientId, // Use the pre-filled patient ID
        age: prefillData.age || '',
        gender: prefillData.gender || '',
        address: address,
        condition: prefillData.condition || '',
        admitWard: prefillData.admitWard || '',
        treatment: prefillData.treatment || '',
        doctor: doctor,
        prescription: prescription,
        admittedDate: currentDate,
        status: prefillData.status || 'Pending'
      });
    } else {
      // Set current date even when no prefill data
      setFormData(prev => ({
        ...prev,
        admittedDate: currentDate
      }));
    }
  }, [prefillData]);

  const handleChange = (e) => {
    // Prevent changing patientId if it's from prefill data
    if (e.target.name === 'patientId' && prefillData) {
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        admittedDate: formData.admittedDate ? new Date(formData.admittedDate).toISOString() : undefined
      };

      await axios.post('http://localhost:5000/api/patients/add', payload);

      setShowSuccess(true);
      
      // Call the success callback to update button in referrals table
      if (prefillData && prefillData.onAdmissionSuccess) {
        prefillData.onAdmissionSuccess();
      }

      // Call the original onAdded callback if provided
      if (typeof onAdded === 'function') {
        onAdded();
      }

      // Reset form with current date
      const currentDate = new Date().toISOString().split('T')[0];
      setFormData({
        patientName: '',
        patientId: '',
        age: '',
        gender: '',
        address: '',
        condition: '',
        admitWard: '',
        treatment: '',
        doctor: '',
        prescription: '',
        admittedDate: currentDate,
        status: 'Pending'
      });

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('This Patient already exists. ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    setFormData({
      patientName: '',
      patientId: '',
      age: '',
      gender: '',
      address: '',
      condition: '',
      admitWard: '',
      treatment: '',
      doctor: '',
      prescription: '',
      admittedDate: currentDate,
      status: 'Pending'
    });
  };

  return (
    <div className="add-patient-container">
      <div className="form-header">
        <h2 className="header-title">Add New Patient</h2>
        <p className="header-subtitle">Enter patient details to add to the system</p>
      </div>

      {showSuccess && (
        <div className="success-message">
          ✅ Patient added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="patient-form">
        {/* Personal Information Section */}
        <div className="form-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientName">Full Name *</label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                placeholder="Enter patient's full name"
                onChange={handleChange}
                value={formData.patientName}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="patientId">Patient ID *</label>
              <input
                id="patientId"
                name="patientId"
                type="text"
                placeholder="Auto-generated patient ID"
                value={formData.patientId}
                required
                readOnly
                style={{ 
                  background: '#f3f4f6', 
                  cursor: 'not-allowed',
                  color: '#1f2937',
                  fontWeight: '600'
                }}
              />
              {prefillData && (
                <small className="readonly-note" style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Auto-generated from referral system
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                placeholder="Age in years"
                onChange={handleChange}
                value={formData.age}
                min="0"
                max="120"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                onChange={handleChange}
                value={formData.gender}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter patient's full address"
                onChange={handleChange}
                value={formData.address}
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="form-section">
          <h3 className="section-title">Medical Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="condition">Medical Condition</label>
              <input
                id="condition"
                name="condition"
                type="text"
                placeholder="Enter medical condition"
                onChange={handleChange}
                value={formData.condition}
              />
            </div>

            <div className="form-group">
              <label htmlFor="admitWard">Admit Ward</label>
              <select
                id="admitWard"
                name="admitWard"
                onChange={handleChange}
                value={formData.admitWard}
              >
                <option value="">Select Ward</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Emergency">Emergency</option>
                <option value="ICU">ICU</option>
                <option value="General">General</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="doctor">Doctor</label>
              <input
                id="doctor"
                name="doctor"
                type="text"
                placeholder="Enter doctor's name"
                onChange={handleChange}
                value={formData.doctor}
              />
            </div>

            <div className="form-group">
              <label htmlFor="treatment">Treatment Plan</label>
              <textarea
                id="treatment"
                name="treatment"
                placeholder="Enter treatment details"
                onChange={handleChange}
                value={formData.treatment}
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="prescription">Prescription</label>
              <textarea
                id="prescription"
                name="prescription"
                placeholder="Enter prescription details"
                onChange={handleChange}
                value={formData.prescription}
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                onChange={handleChange}
                value={formData.status}
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admission Details Section */}
        <div className="form-section no-border">
          <h3 className="section-title">Admission Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="admittedDate">Admitted Date</label>
              <input
                id="admittedDate"
                name="admittedDate"
                type="date"
                onChange={handleChange}
                value={formData.admittedDate}
                readOnly
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
              />
              <small className="date-note">Current date (auto-filled)</small>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Adding Patient...
              </>
            ) : (
              'Add Patient to System'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientForm;