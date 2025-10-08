import React, { useState } from 'react';
import axios from 'axios';

const AddPatientForm = ({ onAdded }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    age: '',
    gender: '',
    bloodType: '',
    lastVisit: '',
    condition: '',
    treatment: '',
    admitWard: '',
    admittedDate: '',
    status: 'Pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:5000/api/patients/add', formData);
      setShowSuccess(true);
      if (typeof onAdded === 'function') {
      onAdded();
    }

      
      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        age: '',
        gender: '',
        bloodType: '',
        lastVisit: '',
        condition: '',
        treatment: '',
        admitWard: '',
        admittedDate: '',
        status: 'Pending'
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      patientName: '',
      patientId: '',
      age: '',
      gender: '',
      bloodType: '',
      lastVisit: '',
      condition: '',
      treatment: '',
      admitWard: '',
      admittedDate: '',
      status: 'Pending'
    });
  };

  // Internal CSS Styles
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '30px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '40px',
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    },
    headerTitle: {
      color: '#2c3e50',
      fontSize: '2.2rem',
      marginBottom: '10px',
      fontWeight: '700',
      margin: '0'
    },
    headerSubtitle: {
      color: '#7f8c8d',
      fontSize: '1.1rem',
      margin: '0'
    },
    successMessage: {
      background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '10px',
      marginBottom: '25px',
      textAlign: 'center',
      fontWeight: '600',
      boxShadow: '0 5px 15px rgba(46, 204, 113, 0.3)',
      animation: 'slideIn 0.5s ease'
    },
    patientForm: {
      background: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
    },
    formSection: {
      marginBottom: '40px',
      paddingBottom: '30px',
      borderBottom: '2px solid #ecf0f1'
    },
    sectionTitle: {
      color: '#34495e',
      fontSize: '1.4rem',
      marginBottom: '25px',
      paddingBottom: '10px',
      borderBottom: '2px solid #3498db',
      display: 'inline-block',
      fontWeight: '600',
      margin: '0 0 25px 0'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '25px',
      marginBottom: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      color: '#2c3e50',
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '0.95rem'
    },
    input: {
      padding: '14px 16px',
      border: '2px solid #e8eeef',
      borderRadius: '10px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: '#fafbfc',
      color: '#2c3e50',
      fontFamily: 'inherit'
    },
    select: {
      padding: '14px 16px',
      border: '2px solid #e8eeef',
      borderRadius: '10px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: '#fafbfc',
      color: '#2c3e50',
      fontFamily: 'inherit',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 15px center',
      backgroundSize: '12px',
      paddingRight: '45px'
    },
    formActions: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'flex-end',
      marginTop: '30px',
      paddingTop: '25px',
      borderTop: '2px solid #ecf0f1'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      color: 'white',
      border: 'none',
      padding: '16px 32px',
      borderRadius: '10px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)',
      fontFamily: 'inherit'
    },
    resetBtn: {
      background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
      color: 'white',
      border: 'none',
      padding: '16px 24px',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    // Media queries as inline styles aren't supported, so we'll use conditionals
    responsive: {
      formRow: window.innerWidth <= 768 ? { gridTemplateColumns: '1fr', gap: '15px' } : {},
      formActions: window.innerWidth <= 768 ? { flexDirection: 'column-reverse' } : {},
      fullWidth: window.innerWidth <= 768 ? { width: '100%', justifyContent: 'center' } : {}
    }
  };

  // Add CSS animations to head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      input:focus, select:focus {
        outline: none;
        border-color: #3498db;
        background: white;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        transform: translateY(-2px);
      }
      input::placeholder {
        color: #bdc3c7;
      }
      button:hover:not(:disabled) {
        transform: translateY(-2px);
      }
      .submit-btn:hover:not(:disabled) {
        box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
        background: linear-gradient(135deg, #2980b9, #3498db);
      }
      .reset-btn:hover {
        background: linear-gradient(135deg, #7f8c8d, #95a5a6);
        box-shadow: 0 5px 15px rgba(149, 165, 166, 0.3);
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

  return (
    <div style={styles.container}>
      <div style={styles.formHeader}>
        <h2 style={styles.headerTitle}>Add New Patient</h2>
        <p style={styles.headerSubtitle}>Enter patient details to add to the system</p>
      </div>

      {showSuccess && (
        <div style={styles.successMessage}>
          ✅ Patient added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.patientForm}>
        {/* Personal Information Section */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          <div style={{...styles.formRow, ...styles.responsive.formRow}}>
            <div style={styles.formGroup}>
              <label htmlFor="patientName" style={styles.label}>
                Full Name *
              </label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                placeholder="Enter patient's full name"
                onChange={handleChange}
                value={formData.patientName}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="patientId" style={styles.label}>
                Patient ID *
              </label>
              <input
                id="patientId"
                name="patientId"
                type="text"
                placeholder="Enter unique patient ID"
                onChange={handleChange}
                value={formData.patientId}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={{...styles.formRow, ...styles.responsive.formRow}}>
            <div style={styles.formGroup}>
              <label htmlFor="age" style={styles.label}>Age</label>
              <input
                id="age"
                name="age"
                type="number"
                placeholder="Age in years"
                onChange={handleChange}
                value={formData.age}
                min="0"
                max="120"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="gender" style={styles.label}>Gender</label>
              <select
                id="gender"
                name="gender"
                onChange={handleChange}
                value={formData.gender}
                style={styles.select}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="bloodType" style={styles.label}>Blood Type</label>
              <select
                id="bloodType"
                name="bloodType"
                onChange={handleChange}
                value={formData.bloodType}
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
              </select>
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Medical Information</h3>
          <div style={{...styles.formRow, ...styles.responsive.formRow}}>
            <div style={styles.formGroup}>
              <label htmlFor="condition" style={styles.label}>Medical Condition</label>
              <input
                id="condition"
                name="condition"
                type="text"
                placeholder="Enter medical condition"
                onChange={handleChange}
                value={formData.condition}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="treatment" style={styles.label}>Treatment Plan</label>
              <input
                id="treatment"
                name="treatment"
                type="text"
                placeholder="Enter treatment details"
                onChange={handleChange}
                value={formData.treatment}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{...styles.formRow, ...styles.responsive.formRow}}>
            <div style={styles.formGroup}>
              <label htmlFor="admitWard" style={styles.label}>Admit Ward</label>
              <select
                id="admitWard"
                name="admitWard"
                onChange={handleChange}
                value={formData.admitWard}
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
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="status" style={styles.label}>Status</label>
              <select
                id="status"
                name="status"
                onChange={handleChange}
                value={formData.status}
                style={styles.select}
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
        <div style={{...styles.formSection, borderBottom: 'none', marginBottom: '30px'}}>
          <h3 style={styles.sectionTitle}>Admission Details</h3>
          <div style={{...styles.formRow, ...styles.responsive.formRow}}>
            <div style={styles.formGroup}>
              <label htmlFor="admittedDate" style={styles.label}>Admitted Date</label>
              <input
                id="admittedDate"
                name="admittedDate"
                type="date"
                onChange={handleChange}
                value={formData.admittedDate}
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
                value={formData.lastVisit}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{...styles.formActions, ...styles.responsive.formActions}}>
          <button 
            type="button" 
            style={{...styles.resetBtn, ...styles.responsive.fullWidth}}
            onClick={handleReset}
            className="reset-btn"
          >
            Clear Form
          </button>
          <button 
            type="submit" 
            style={{...styles.submitBtn, ...styles.responsive.fullWidth}}
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? (
              <>
                <span style={styles.spinner}></span>
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