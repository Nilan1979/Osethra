// DoctorReferralsSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorReferralsSection.css';

const DoctorReferralsSection = ({ data, setData, onPatientSelect }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admittedPatients, setAdmittedPatients] = useState(new Set()); // Track admitted patients

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/treatments/');
      if (response.data.success) {
        const fetchedTreatments = response.data.data;
        
        // Sort treatments by creation date in descending order (newest first)
        const sortedTreatments = fetchedTreatments.sort((a, b) => 
          new Date(b.createdAt || b.appointmentId?.date) - new Date(a.createdAt || a.appointmentId?.date)
        );
        
        setTreatments(sortedTreatments);
        setData(sortedTreatments); // Update parent state
      } else {
        setError('Failed to fetch treatments data');
      }
    } catch (err) {
      setError('Error fetching treatments: ' + err.message);
      console.error('Error fetching treatments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (treatment, index) => {
    // Use the already displayed patient ID from the table
    const patientId = `P${(treatments.length - index).toString().padStart(3, '0')}`;
    
    // Prepare patient data for the form
    const patientData = {
      patientName: treatment.patientInfo.name,
      patientId: patientId, // Use the already generated patient ID
      age: treatment.patientInfo.age.toString(),
      gender: treatment.patientInfo.gender,
      address: treatment.patientInfo.address, // Include address
      condition: treatment.diagnosis,
      treatment: treatment.treatmentPlan,
      doctor: treatment.doctorId?.name || '', // Include doctor name
      prescription: treatment.prescriptions.map(p => 
        `${p.medicineName} - ${p.dosage}, ${p.frequency}, ${p.duration}${p.instructions ? ` (${p.instructions})` : ''}`
      ).join('; '), // Format prescription
      admitWard: getWardFromSpecialty(treatment.diagnosis),
      admittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      originalTreatment: treatment,
      onAdmissionSuccess: () => handleAdmissionSuccess(treatment._id) // Callback for success
    };

    // Call the callback function to pass data to parent component
    if (onPatientSelect) {
      onPatientSelect(patientData);
    }

    // Show confirmation
    alert(`Patient ${treatment.patientInfo.name} data has been prepared for admission form! Patient ID: ${patientId}`);
  };

  // Function to handle successful admission
  const handleAdmissionSuccess = (treatmentId) => {
    console.log('✅ Patient admitted successfully, treatment ID:', treatmentId);
    // Add to admitted patients set to show success status
    setAdmittedPatients(prev => new Set([...prev, treatmentId]));
  };

  // Check if patient is already admitted
  const isPatientAdmitted = (treatmentId) => {
    return admittedPatients.has(treatmentId);
  };

  // Helper function to determine ward based on diagnosis
  const getWardFromSpecialty = (diagnosis) => {
    const wardMap = {
      'Hypertension': 'Cardiology',
      'Diabetes': 'General',
      'Common Cold': 'General',
      'Viral Fever': 'Emergency',
      'Flu': 'General',
      'Surgery': 'Surgery',
      'Orthopedics': 'Orthopedics',
      'Neurology': 'Neurology',
      'Pediatrics': 'Pediatrics'
    };
    
    return wardMap[diagnosis] || 'General';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="doctor-referrals-section">
        <div className="section-container">
          <h2>Doctor Referrals Management</h2>
          <div className="loading-container">
            <p>Loading treatments data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-referrals-section">
        <div className="section-container">
          <h2>Doctor Referrals Management</h2>
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="refresh-btn" onClick={fetchTreatments}>
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-referrals-section">
      <div className="section-container">
        <h2>Doctor Referrals Management</h2>
        
        <div className="controls-row">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
          
          <div className="filter-controls">
            <select className="filter-select">
              <option value="">All Doctors</option>
              <option value="Gayan Fernando">Gayan Fernando</option>
            </select>
            
            <button className="refresh-btn" onClick={fetchTreatments}>
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="table-container">
          <h3>Patient Treatments ({treatments.length})</h3>
          
          {treatments.length === 0 ? (
            <div className="text-center p-15">
              <p>No treatments found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '80px' }}>Patient ID</th>
                    <th style={{ minWidth: '125px' }}>Patient Information</th>
                    <th style={{ minWidth: '100px' }}>Doctor</th>
                    <th style={{ minWidth: '125px' }}>Treatment Plan</th>
                    <th style={{ minWidth: '150px' }}>Prescriptions</th>
                    <th style={{ minWidth: '100px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((treatment, index) => {
                    // Generate patient ID for display (P001, P002, etc.)
                    const displayPatientId = `P${(treatments.length - index).toString().padStart(3, '0')}`;
                    
                    return (
                      <tr key={treatment._id}>
                        <td>
                          <strong style={{ 
                            color: '#1976d2', 
                            fontSize: '14px',
                            background: '#e3f2fd',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {displayPatientId}
                          </strong>
                        </td>
                        <td>
                          <div>
                            <strong>{treatment.patientInfo.name}</strong>
                            <br />
                            <small><strong>Age:</strong> {treatment.patientInfo.age}</small>
                            <br />
                            <small><strong>Gender:</strong> 
                              <span className={`status-badge ${treatment.patientInfo.gender === 'Male' ? 'status-active' : 'status-pending'}`}>
                                {treatment.patientInfo.gender}
                              </span>
                            </small>
                            <br />
                            <small><strong>Contact:</strong> {treatment.patientInfo.contact}</small>
                            <br />
                            <small><strong>Address:</strong> {treatment.patientInfo.address}</small>
                            <br />
                            <small><strong>Appointment:</strong> {treatment.appointmentId?.date ? formatDate(treatment.appointmentId.date) : 'N/A'}</small>
                            <br />
                            <small><strong>Diagnosis:</strong> 
                              <span className={`priority-badge ${
                                treatment.diagnosis === 'Hypertension' || treatment.diagnosis === 'Diabetes' 
                                  ? 'priority-high' 
                                  : treatment.diagnosis === 'Common Cold' || treatment.diagnosis === 'Viral Fever'
                                  ? 'priority-low'
                                  : 'priority-medium'
                              }`}>
                                {treatment.diagnosis}
                              </span>
                            </small>
                            <br />
                            <small><strong>Symptoms:</strong> 
                              {treatment.symptoms.map((symptom, index) => (
                                <span key={index} className="condition-badge">
                                  {symptom}
                                </span>
                              ))}
                            </small>
                          </div>
                        </td>
                        <td>
                          {treatment.doctorId?.name || 'N/A'}
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                            {treatment.treatmentPlan}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '250px' }}>
                            {treatment.prescriptions.map((prescription, index) => (
                              <div key={index} style={{ marginBottom: '8px', padding: '5px', background: '#f8f9fa', borderRadius: '4px' }}>
                                <strong>{prescription.medicineName}</strong>
                                <br />
                                <small>
                                  <strong>Dosage:</strong> {prescription.dosage}
                                </small>
                                <br />
                                <small>
                                  <strong>Frequency:</strong> {prescription.frequency}
                                </small>
                                <br />
                                <small>
                                  <strong>Duration:</strong> {prescription.duration}
                                </small>
                                {prescription.instructions && (
                                  <small>
                                    <br />
                                    <strong>Instructions:</strong> {prescription.instructions}
                                  </small>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            {isPatientAdmitted(treatment._id) ? (
                              <button 
                                className="action-btn"
                                style={{ 
                                  whiteSpace: 'nowrap',
                                  background: '#10b981',
                                  color: 'white',
                                  border: '1px solid #059669',
                                  cursor: 'default',
                                  fontWeight: '600'
                                }}
                                disabled
                              >
                                ✅ Added to System
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleAdd(treatment, index)}
                                className="action-btn edit-btn"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                📝 Admit Patient
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReferralsSection;