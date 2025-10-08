import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditPatientForm = ({ patient, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({ ...patient });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setFormData({ ...patient });
    setErrors({});
    setTouched({});
  }, [patient]);

  // Validation function
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'patientName':
        if (!value.trim()) {
          newErrors.patientName = 'Patient name is required';
        } else if (value.trim().length < 2) {
          newErrors.patientName = 'Name must be at least 2 characters';
        } else {
          delete newErrors.patientName;
        }
        break;
      
      case 'patientId':
        if (!value.trim()) {
          newErrors.patientId = 'Patient ID is required';
        } else {
          delete newErrors.patientId;
        }
        break;
      
      case 'age':
        if (value && (value < 0 || value > 120)) {
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
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/patients/edit/${patient._id}`, formData);
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating patient:', err);
      alert('Failed to update patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Internal CSS Styles
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px',
      backdropFilter: 'blur(5px)'
    },
    modal: {
      background: 'white',
      padding: '0',
      borderRadius: '16px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid #e1e5e9'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '25px 30px',
      margin: 0
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    formContent: {
      padding: '40px',
      maxHeight: 'calc(90vh - 100px)',
      overflowY: 'auto'
    },
    formSection: {
      marginBottom: '25px'
    },
    sectionTitle: {
      color: '#2c3e50',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '15px',
      paddingBottom: '8px',
      borderBottom: '2px solid #3498db'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '15px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      color: '#2c3e50',
      fontWeight: '600',
      marginBottom: '6px',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    requiredStar: {
      color: '#e74c3c'
    },
    input: {
      padding: '12px 14px',
      border: '2px solid #e8eeef',
      borderRadius: '8px',
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
      background: '#fafbfc',
      color: '#2c3e50',
      fontFamily: 'inherit',
      width: '100%',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#e74c3c',
      background: '#fdf2f2'
    },
    select: {
      padding: '12px 14px',
      border: '2px solid #e8eeef',
      borderRadius: '8px',
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
      background: '#fafbfc',
      color: '#2c3e50',
      fontFamily: 'inherit',
      width: '100%',
      boxSizing: 'border-box',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '10px',
      paddingRight: '40px'
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '0.8rem',
      marginTop: '4px',
      fontWeight: '500'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '25px',
      paddingTop: '20px',
      borderTop: '2px solid #ecf0f1'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
      fontFamily: 'inherit'
    },
    submitBtnDisabled: {
      background: 'linear-gradient(135deg, #bdc3c7, #95a5a6)',
      cursor: 'not-allowed',
      opacity: '0.6'
    },
    cancelBtn: {
      background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    closeBtn: {
      position: 'absolute',
      top: '15px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    patientInfo: {
      background: '#f8f9fa',
      padding: '12px 15px',
      borderRadius: '8px',
      marginBottom: '0px',
      borderLeft: '4px solid #3498db'
    },
    patientId: {
      fontWeight: '600',
      color: '#2c3e50'
    }
  };

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes modalAppear {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      input:focus, select:focus {
        outline: none;
        border-color: #3498db;
        background: white;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        transform: translateY(-1px);
      }
      button:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .submit-btn:hover:not(:disabled) {
        box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
      }
      .cancel-btn:hover {
        background: linear-gradient(135deg, #7f8c8d, #95a5a6);
        box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
      }
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }
      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!patient) return null;

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.modal,
        animation: 'modalAppear 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            ✏️ Edit Patient
          </h2>
          <button 
            type="button" 
            style={styles.closeBtn}
            onClick={onClose}
            className="close-btn"
          >
            ×
          </button>
        </div>

        {/* Patient Info */}
        <div style={styles.patientInfo}>
          Editing: <span style={styles.patientId}>{patient.patientName}</span> (ID: {patient.patientId})
        </div>

        <form onSubmit={handleSubmit} style={styles.formContent}>
          {/* Personal Information Section */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="patientName" style={styles.label}>
                  Full Name <span style={styles.requiredStar}>*</span>
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
                  style={{
                    ...styles.input,
                    ...(errors.patientName && styles.inputError)
                  }}
                />
                {errors.patientName && (
                  <span style={styles.errorText}>{errors.patientName}</span>
                )}
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="patientId" style={styles.label}>
                  Patient ID <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  id="patientId"
                  name="patientId"
                  type="text"
                  placeholder="Enter unique patient ID"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={formData.patientId || ''}
                  required
                  style={{
                    ...styles.input,
                    ...(errors.patientId && styles.inputError)
                  }}
                />
                {errors.patientId && (
                  <span style={styles.errorText}>{errors.patientId}</span>
                )}
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="age" style={styles.label}>Age</label>
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
                  style={{
                    ...styles.input,
                    ...(errors.age && styles.inputError)
                  }}
                />
                {errors.age && (
                  <span style={styles.errorText}>{errors.age}</span>
                )}
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="gender" style={styles.label}>Gender</label>
                <select
                  id="gender"
                  name="gender"
                  onChange={handleChange}
                  value={formData.gender || ''}
                  style={styles.select}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="bloodType" style={styles.label}>Blood Type</label>
                <select
                  id="bloodType"
                  name="bloodType"
                  onChange={handleChange}
                  value={formData.bloodType || ''}
                  style={styles.select}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Medical Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="condition" style={styles.label}>Medical Condition</label>
                <input
                  id="condition"
                  name="condition"
                  type="text"
                  placeholder="Primary medical condition"
                  onChange={handleChange}
                  value={formData.condition || ''}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="treatment" style={styles.label}>Treatment Plan</label>
                <input
                  id="treatment"
                  name="treatment"
                  type="text"
                  placeholder="Current treatment approach"
                  onChange={handleChange}
                  value={formData.treatment || ''}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="admitWard" style={styles.label}>Admit Ward</label>
                <select
                  id="admitWard"
                  name="admitWard"
                  onChange={handleChange}
                  value={formData.admitWard || ''}
                  style={styles.select}
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
                  <option value="Oncology">Oncology</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="status" style={styles.label}>Status</label>
                <select
                  id="status"
                  name="status"
                  onChange={handleChange}
                  value={formData.status || ''}
                  style={styles.select}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Critical">Critical</option>
                  <option value="Stable">Stable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admission Details Section */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Admission Details</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="admittedDate" style={styles.label}>Admitted Date</label>
                <input
                  id="admittedDate"
                  name="admittedDate"
                  type="date"
                  onChange={handleChange}
                  value={formData.admittedDate ? formData.admittedDate.slice(0,10) : ''}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="lastVisit" style={styles.label}>Last Visit Date</label>
                <input
                  id="lastVisit"
                  name="lastVisit"
                  type="date"
                  onChange={handleChange}
                  value={formData.lastVisit ? formData.lastVisit.slice(0,10) : ''}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button 
              type="button" 
              style={styles.cancelBtn}
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                ...styles.submitBtn,
                ...(isSubmitting && styles.submitBtnDisabled)
              }}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span style={styles.spinner}></span>
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