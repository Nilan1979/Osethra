import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth & Dashboard
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import NurseDashboard from './components/Dashboard/NurseDashboard';
import PharmacistDashboard from './components/Dashboard/PharmacistDashboard';
import ReceptionistDashboard from './components/Dashboard/ReceptionistDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Appointment Management
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import AppointmentsList from './pages/AppointmentsList';
import AddAppointment from './pages/AddAppointment';
import EditAppointment from './pages/EditAppointment';
import AppointmentDetails from './pages/AppointmentDetails';
import AddTreatment from './pages/AddTreatment';
import TreatmentView from './pages/TreatmentView';
import UpdateTreatment from './pages/UpdateTreatment';
import Footer from './components/Footer';
import { Container, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c5aa0',
      light: '#5c7bc8',
      dark: '#1e3f73',
    },
    secondary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2874a6',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (location.pathname === '/') {
    return (
      <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
        <Home />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Default Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/dashboard"
        element={
          <ProtectedRoute>
            <NurseDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/dashboard"
        element={
          <ProtectedRoute>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
             user?.role === 'doctor' ? <Navigate to="/doctor/dashboard" /> :
             user?.role === 'nurse' ? <Navigate to="/nurse/dashboard" /> :
             user?.role === 'pharmacist' ? <Navigate to="/pharmacist/dashboard" /> :
             user?.role === 'receptionist' ? <Navigate to="/appointments" /> :
             <UserDashboard />}
          </ProtectedRoute>
        }
      />

      {/* Appointment Management Routes */}
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsList /></ProtectedRoute>} />
      <Route path="/appointments/add" element={<ProtectedRoute><AddAppointment /></ProtectedRoute>} />
      <Route path="/appointments/:id/edit" element={<ProtectedRoute><EditAppointment /></ProtectedRoute>} />
      <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />
      
      {/* Treatment Routes */}
      <Route
        path="/add-treatment/:appointmentId"
        element={
          <ProtectedRoute>
            <AddTreatment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/treatment-view/:appointmentId"
        element={
          <ProtectedRoute>
            <TreatmentView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/update-treatment/:treatmentId"
        element={
          <ProtectedRoute>
            <UpdateTreatment />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh',
              width: '100%',
              bgcolor: 'background.default'
            }}
          >
            <NavBar />
            <Box 
              component="main" 
              sx={{ 
                flex: 1,
                width: '100%',
                pt: { xs: 2, sm: 3, md: 4 }
              }}
            >
              <AppRoutes />
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
