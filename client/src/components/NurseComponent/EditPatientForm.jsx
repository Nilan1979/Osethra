// EditPatientForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditPatientForm = ({ patient, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (patient) {
      setFormData({ 
        ...patient,
        admittedDate: patient.admittedDate ? patient.admittedDate.split('T')[0] : ''
      });
    }
    setErrors({});
    setTouched({});
  }, [patient]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'patientName':
        if (!value || !value.trim()) {
          newErrors.patientName = 'Patient name is required';
        } else if (value.trim().length < 2) {
          newErrors.patientName = 'Name must be at least 2 characters';
        } else {
          delete newErrors.patientName;
        }
        break;
      
      case 'age':
        if (value && (isNaN(value) || value < 0 || value > 120)) {
          newErrors.age = 'Age must be between 0 and 120';
        } else {
          delete newErrors.age;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.patientName || !formData.patientName.trim()) {
      setErrors({ patientName: 'Patient name is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare payload - match your backend expected fields
      const payload = {
        patientName: formData.patientName.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || '',
        address: formData.address || '',
        condition: formData.condition || '',
        admitWard: formData.admitWard || '',
        doctor: formData.doctor || '',
        status: formData.status || 'Pending',
        treatment: formData.treatment || '',
        prescription: formData.prescription || '',
        // Include patientId if your backend needs it
        patientId: formData.patientId || ''
      };

      console.log('🔄 Sending UPDATE request...');
      console.log('📤 Payload:', payload);
      console.log('🔗 URL:', `http://localhost:5000/api/patients/edit/${patient._id}`);

      // Use the correct endpoint: /edit/:id
      const response = await axios.put(
        `http://localhost:5000/api/patients/edit/${patient._id}`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('✅ Update successful:', response.data);
      
      onUpdated();
      onClose();
      
    } catch (err) {
      console.error('❌ UPDATE ERROR:', err);
      
      // Detailed error logging
      if (err.response) {
        // Server responded with error status
        console.error('📡 Server Response:', err.response.data);
        console.error('🔢 Status Code:', err.response.status);
        
        const serverMessage = err.response.data?.message || err.response.data?.error || 'Server error';
        alert(`Server Error (${err.response.status}): ${serverMessage}`);
        
      } else if (err.request) {
        // Request was made but no response received
        console.error('🌐 No Response Received');
        alert('Network Error: No response from server. Check if backend is running on port 5000.');
      } else {
        // Something else happened
        console.error('⚡ Request Setup Error:', err.message);
        alert(`Request Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="modal-overlay">
      <div className="edit-patient-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            ✏️ Edit Patient
          </h2>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="patient-info-bar">
          Editing: <span className="patient-name">{patient.patientName}</span> (ID: {patient.patientId})
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="patientName" className="form-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  placeholder="Enter patient's full name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={formData.patientName || ''}
                  required
                  className={errors.patientName ? 'form-input error' : 'form-input'}
                />
                {errors.patientName && (
                  <span className="error-text">{errors.patientName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="patientId" className="form-label">
                  Patient ID
                </label>
                <input
                  id="patientId"
                  name="patientId"
                  type="text"
                  value={formData.patientId || ''}
                  readOnly
                  className="form-input"
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small className="date-note">ID cannot be changed</small>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Age in years"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={formData.age || ''}
                  min="0"
                  max="120"
                  className={errors.age ? 'form-input error' : 'form-input'}
                />
                {errors.age && (
                  <span className="error-text">{errors.age}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  onChange={handleChange}
                  value={formData.gender || ''}
                  className="form-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Patient's address"
                  onChange={handleChange}
                  value={formData.address || ''}
                  className="form-input"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="form-section">
            <h3 className="section-title">Medical Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="condition" className="form-label">Medical Condition</label>
                <input
                  id="condition"
                  name="condition"
                  type="text"
                  placeholder="Primary medical condition"
                  onChange={handleChange}
                  value={formData.condition || ''}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="admitWard" className="form-label">Admit Ward</label>
                <select
                  id="admitWard"
                  name="admitWard"
                  onChange={handleChange}
                  value={formData.admitWard || ''}
                  className="form-select"
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

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="doctor" className="form-label">Doctor</label>
                <input
                  id="doctor"
                  name="doctor"
                  type="text"
                  placeholder="Doctor's name"
                  onChange={handleChange}
                  value={formData.doctor || ''}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  name="status"
                  onChange={handleChange}
                  value={formData.status || 'Pending'}
                  className="form-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="treatment" className="form-label">Treatment Plan</label>
                <textarea
                  id="treatment"
                  name="treatment"
                  placeholder="Current treatment approach"
                  onChange={handleChange}
                  value={formData.treatment || ''}
                  className="form-input"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="prescription" className="form-label">Prescription</label>
                <textarea
                  id="prescription"
                  name="prescription"
                  placeholder="Prescription details"
                  onChange={handleChange}
                  value={formData.prescription || ''}
                  className="form-input"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Admission Details Section */}
          <div className="form-section">
            <h3 className="section-title">Admission Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="admittedDate" className="form-label">Admitted Date</label>
                <input
                  id="admittedDate"
                  name="admittedDate"
                  type="date"
                  value={formData.admittedDate || ''}
                  readOnly
                  className="form-input"
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small className="date-note">Admission date cannot be changed</small>
              </div>
            </div>
          </div>

        

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={isSubmitting ? 'submit-btn disabled' : 'submit-btn'}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Updating...
                </>
              ) : (
                'Update Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientForm;