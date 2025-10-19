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
    item.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

// PDF Generator
const generatePDF = (patient) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Medical Record - ${patient.patientName}</title>
        <style>
          /* Professional Medical Report Styling */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #ffffff;
            margin: 0;
            padding: 25px;
          }
          
          /* Header Section */
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 25px;
            border-bottom: 3px double #00da91;
            background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0, 218, 145, 0.1);
          }
          
          .hospital-name {
            font-size: 28px;
            font-weight: 700;
            color: #059669;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .report-title {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .patient-badge {
            display: inline-block;
            background: #00da91;
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
          }
          
          .generation-info {
            font-size: 13px;
            color: #6b7280;
            margin-top: 15px;
          }
          
          /* Section Styling */
          .section {
            margin-bottom: 35px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .section-header {
            background: linear-gradient(135deg, #059669, #00da91);
            color: white;
            padding: 18px 25px;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-content {
            padding: 25px;
          }
          
          /* Table Styling */
          .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          
          .info-table tr {
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.2s ease;
          }
          
          .info-table tr:hover {
            background-color: #f8fffe;
          }
          
          .info-table tr:last-child {
            border-bottom: none;
          }
          
          .info-table td {
            padding: 14px 16px;
            vertical-align: top;
          }
          
          .info-table td:first-child {
            font-weight: 600;
            color: #374151;
            width: 35%;
            background: #f8fafc;
            border-right: 2px solid #e5e7eb;
          }
          
          .info-table td:last-child {
            color: #4b5563;
            background: #ffffff;
          }
          
          /* Status Badges */
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
            border: 1px solid;
          }
          
          .status-pending { background: #fef3c7; color: #92400e; border-color: #f59e0b; }
          .status-active { background: #d1fae5; color: #065f46; border-color: #10b981; }
          .status-completed { background: #dbeafe; color: #1e40af; border-color: #3b82f6; }
          .status-discharged { background: #e0e7ff; color: #4338ca; border-color: #6366f1; }
          
          /* Condition Badges */
          .condition-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #bbf7d0;
          }
          
          /* Footer */
          .footer {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .disclaimer {
            background: #fefce8;
            border: 1px solid #fef08a;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 11px;
            color: #854d0e;
          }
          
          /* Print Optimizations */
          @media print {
            body { padding: 15px; }
            .section { break-inside: avoid; }
            .header { margin-bottom: 25px; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="hospital-name"> OSETHRA HOSPITAL</div>
          <div class="report-title">Patient Medical Record</div>
          <div class="patient-badge">
            Patient ID: ${patient.patientId || 'N/A'}
          </div>
          <div class="generation-info">
            Generated on: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} | This is an official medical document
          </div>
        </div>
        
        <!-- Personal Information -->
        <div class="section">
          <div class="section-header">
            📋 Personal Information
          </div>
          <div class="section-content">
            <table class="info-table">
              <tr>
                <td>Patient ID</td>
                <td>${patient.patientId || 'Not assigned'}</td>
              </tr>
              <tr>
                <td>Full Name</td>
                <td><strong>${patient.patientName || 'Not provided'}</strong></td>
              </tr>
              <tr>
                <td>Age</td>
                <td>${patient.age ? patient.age + ' years' : 'Not specified'}</td>
              </tr>
              <tr>
                <td>Gender</td>
                <td>${patient.gender || 'Not specified'}</td>
              </tr>
              <tr>
                <td>Contact Address</td>
                <td>${patient.address || 'Not provided'}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Medical Information -->
        <div class="section">
          <div class="section-header">
            🏥 Medical Information
          </div>
          <div class="section-content">
            <table class="info-table">
              <tr>
                <td>Medical Condition</td>
                <td>
                  <span class="condition-badge">${patient.condition || 'Not diagnosed'}</span>
                </td>
              </tr>
              <tr>
                <td>Treatment Plan</td>
                <td>${patient.treatment || 'No treatment plan specified'}</td>
              </tr>
              <tr>
                <td>Current Prescription</td>
                <td>${patient.prescription || 'No prescription provided'}</td>
              </tr>
              <tr>
                <td>Assigned Ward</td>
                <td><strong>${patient.admitWard || 'Not assigned'}</strong></td>
              </tr>
              <tr>
                <td>Attending Doctor</td>
                <td>${patient.doctor || 'Not assigned'}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Admission Details -->
        <div class="section">
          <div class="section-header">
            📅 Admission Details
          </div>
          <div class="section-content">
            <table class="info-table">
              <tr>
                <td>Admission Date</td>
                <td>
                  ${patient.admittedDate ? 
                    new Date(patient.admittedDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 
                    'Not recorded'
                  }
                </td>
              </tr>
              <tr>
                <td>Current Status</td>
                <td>
                  <span class="status-badge status-${(patient.status || 'pending').toLowerCase()}">
                    ${patient.status || 'Pending'}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Duration of Stay</td>
                <td>
                  ${patient.admittedDate ? 
                    Math.floor((new Date() - new Date(patient.admittedDate)) / (1000 * 60 * 60 * 24)) + ' days' : 
                    'Not applicable'
                  }
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Additional Notes -->
        <div class="section">
          <div class="section-header">
            📝 Additional Notes
          </div>
          <div class="section-content">
            <table class="info-table">
              <tr>
                <td>Special Instructions</td>
                <td>${patient.treatment ? 'Follow prescribed treatment plan and attend scheduled follow-ups.' : 'No special instructions provided.'}</td>
              </tr>
              <tr>
                <td>Next Review Date</td>
                <td>${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="disclaimer">
            ⚠️ <strong>Confidential Medical Document</strong> - This record contains sensitive health information. 
            Unauthorized disclosure is prohibited by medical privacy laws. For official use only.
          </div>
          <p style="margin-top: 15px;">
            Medical Care Hospital • 123 Healthcare Avenue • Phone: (555) 123-HELP<br>
            License: MCH-2024-MED • Document ID: ${patient._id || 'N/A'}
          </p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  
  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
    // Optional: Close the window after printing
    // setTimeout(() => printWindow.close(), 500);
  }, 500);
};

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
  };

  const handleEditClose = () => {
    setEditingPatient(null);
  };

  const handleUpdated = () => {
    fetchPatients();
    handleEditClose();
  };

  return (
    <div className="section-container">
      <h2>Patient Records</h2>
      
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
      <div className="table-container" style={{ border: '2px solid #d1d5db', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#d1fae5' }}>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Patient ID</th>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Patient Name</th>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Age</th>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Gender</th>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Address</th>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Admitted Date</th>
              <th style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Condition</th>
              <th style={{ padding: '14px 16px', borderBottom: '2px solid #d1d5db', fontWeight: '600', color: '#059669' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #d1d5db', transition: 'all 0.3s ease' }}>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', fontWeight: '600' }}>{item.patientId}</td>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db' }}>{item.patientName}</td>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db' }}>{item.age || '-'}</td>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db' }}>{item.gender || '-'}</td>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db', maxWidth: '200px', wordWrap: 'break-word' }}>
                    {item.address || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db' }}>{item.admittedDate ? new Date(item.admittedDate).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '14px 16px', borderRight: '1px solid #d1d5db' }}>
                    <span 
                      className={`condition-badge condition-${(item.condition || 'unknown').toLowerCase().replace(' ', '-')}`}
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        display: 'inline-block',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        ...(item.condition?.toLowerCase() === 'viral fever' ? { background: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' } :
                            item.condition?.toLowerCase() === 'diabetes' ? { background: '#d1fae5', color: '#065f46', borderColor: '#10b981' } :
                            item.condition?.toLowerCase() === 'flu' ? { background: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6' } :
                            { background: '#e2e3e5', color: '#383d41', borderColor: '#6b7280' })
                      }}
                    >
                      {item.condition || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="actions-cell" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="action-btn edit-btn"
                        title="Edit Patient"
                        onClick={() => handleEditClick(item)}
                        style={{ 
                          padding: '8px 14px', 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: '1px solid #2563eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="action-btn pdf-btn"
                        title="Generate PDF"
                        onClick={() => generatePDF(item)}
                        style={{ 
                          padding: '8px 14px', 
                          background: '#00da91', 
                          color: 'white', 
                          border: '1px solid #059669',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        📄 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
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