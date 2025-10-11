// NurseDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TreatmentPlansSection from './TreatmentPlansSection';
import MedicalRequestsSection from './MedicalRequestsSection';
import PatientRecordsSection from './PatientRecordsSection';
import DoctorReferralsSection from './DoctorReferralsSection';
import './NurseDashboard.css';
import AddPatientForm from './AddPatientForm';

const NurseD = () => {
  const [activeCategory, setActiveCategory] = useState('treatmentPlans');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [medicalRequests, setMedicalRequests] = useState([]);
  const [doctorReferrals, setDoctorReferrals] = useState([]);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [patientCounter, setPatientCounter] = useState(1); // Track patient count

  const { logout } = useAuth();

  // Load patient counter from localStorage on component mount
  useEffect(() => {
    const savedCounter = localStorage.getItem('patientCounter');
    if (savedCounter) {
      setPatientCounter(parseInt(savedCounter));
    }
  }, []);

  // Function to handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to handle patient selection from referrals
  const handlePatientSelect = (patientData) => {
    setSelectedPatientData(patientData);
    setActiveCategory('patientForm');
  };

  // Function to generate sequential patient ID using MongoDB ObjectId
  const generatePatientId = () => {
    const newCounter = patientCounter;
    const patientId = `P${newCounter.toString().padStart(3, '0')}`;
    return patientId;
  };

  // Function to handle patient admission
  const handlePatientAdmitted = (admittedPatient) => {
    // Increment patient counter and save to localStorage
    const newCounter = patientCounter + 1;
    setPatientCounter(newCounter);
    localStorage.setItem('patientCounter', newCounter.toString());
    
    // Clear selected data
    setSelectedPatientData(null);
    
    // Show success message
    alert(`Patient ${admittedPatient.patientName} admitted successfully with ID: ${admittedPatient.patientId}`);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="nurse-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Nurse Dashboard</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            ☰
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button 
                className={`nav-btn ${activeCategory === 'doctorReferrals' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('doctorReferrals')}
              >
                🩺 Doctor Referrals
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeCategory === 'patientForm' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('patientForm')}
              >
                🧾 Patient Form
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeCategory === 'treatmentPlans' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('treatmentPlans')}
              >
                📋 Treatment Plans
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeCategory === 'patientRecords' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('patientRecords')}
              >
                📊 Patient Records
              </button>
            </li>
            <li>
              <button 
                className={`nav-btn ${activeCategory === 'medicalRequests' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('medicalRequests')}
              >
                💊 Medical Requests
              </button>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <h1>
            {activeCategory === 'treatmentPlans' && 'Treatment Plans Management'}
            {activeCategory === 'medicalRequests' && 'Medical Requests to Pharmacy'}
            {activeCategory === 'doctorReferrals' && 'Doctor Referrals Management'}
            {activeCategory === 'patientRecords' && 'Patient Records Overview'}
            {activeCategory === 'patientForm' && 'Patient Form Entry'}
          </h1>
          <div className="user-info">
            <span>Welcome, Nurse!</span>
          </div>
        </header>

        <div className="content-area">
          {activeCategory === 'treatmentPlans' && (
            <TreatmentPlansSection 
              data={treatmentPlans} 
              setData={setTreatmentPlans}
            />
          )}
          
          {activeCategory === 'medicalRequests' && (
            <MedicalRequestsSection 
              data={medicalRequests} 
              setData={setMedicalRequests}
            />
          )}
          
          {activeCategory === 'doctorReferrals' && (
            <DoctorReferralsSection 
              data={doctorReferrals} 
              setData={setDoctorReferrals}
              onPatientSelect={handlePatientSelect}
              generatePatientId={generatePatientId}
            />
          )}
          
          {activeCategory === 'patientRecords' && (
            <PatientRecordsSection />
          )}

          {activeCategory === 'patientForm' && (
            <AddPatientForm 
              prefillData={selectedPatientData}
              onAdmitted={handlePatientAdmitted}
              generatePatientId={generatePatientId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseD;