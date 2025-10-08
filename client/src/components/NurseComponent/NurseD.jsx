// NurseDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import TreatmentPlansSection from './TreatmentPlansSection';
import MedicalRequestsSection from './MedicalRequestsSection';
import PatientRecordsSection from './PatientRecordsSection';
import './NurseDashboard.css';
import AddPatientForm from './AddPatientForm';

const NurseD = () => {
  const [activeCategory, setActiveCategory] = useState('treatmentPlans');
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const [treatmentPlans, setTreatmentPlans] = useState([]);

  // Sample data for medical requests
  const [medicalRequests, setMedicalRequests] = useState([]);

  //You had a category for doctorReferrals but no state for it — add this if needed
  const [doctorReferrals, setDoctorReferrals] = useState([]);

  const { logout } = useAuth();

  // Function to handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

const handleLogout = () => {
  const confirmLogout = window.confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    logout();           // clears auth state + localStorage + axios headers
    navigate('/login'); // redirect to login page
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
                className={`nav-btn ${activeCategory === 'treatmentPlans' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('treatmentPlans')}
              >
                📋 Treatment Plans
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
                className={`nav-btn ${activeCategory === 'patientForm' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('patientForm')}
              >
                🧾 Patient Form
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
            />
          )}
          
          {activeCategory === 'patientRecords' && (
            <PatientRecordsSection />
          )}

          {activeCategory === 'patientForm' && (
           <AddPatientForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseD;
