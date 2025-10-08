// PatientRecordsSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditPatientForm from './EditPatientForm';

const PatientRecordsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientRecords, setPatientRecords] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/patients');
      setPatientRecords(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  // Filter search
  const filteredData = patientRecords.filter(item =>
    item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Optional: view or history actions
  const handleView = (id) => {
    alert(`View details for patient ID: ${id}`);
  };

  const handleHistory = (id) => {
    alert(`Show medical history for patient ID: ${id}`);
  };

    const handleEditClick = (patient) => {
    setEditingPatient(patient);
  };

    const handleEditClose = () => {
    setEditingPatient(null);
  };

    const handleUpdated = () => {
    fetchPatients(); // refresh after update
  };

  return (
    <div className="section-container">
      {/* Search bar */}
      <div className="controls-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search patient records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      {/* Data table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Patient ID</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Type</th>
              <th>Last Visit</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item._id}>
                  <td>{item.patientName}</td>
                  <td>{item.patientId}</td>
                  <td>{item.age || '-'}</td>
                  <td>{item.gender || '-'}</td>
                  <td>{item.bloodType || '-'}</td>
                  <td>{item.lastVisit ? new Date(item.lastVisit).toLocaleDateString() : '-'}</td>
                  <td>
                    <span
                      className={`condition-badge condition-${(item.condition || 'unknown').toLowerCase()}`}
                    >
                      {item.condition || 'Unknown'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      title="Edit Patient"
                      onClick={() => handleEditClick(item)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn history-btn"
                      title="Medical History"
                      onClick={() => handleHistory(item._id)}
                    >
                      📋
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '10px' }}>
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editingPatient && (
        <EditPatientForm
          patient={editingPatient}
          onClose={handleEditClose}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default PatientRecordsSection;
