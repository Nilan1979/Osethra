import React, { useState } from "react";
import { createAppointment } from "../api/appointments";
import { 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  MenuItem, 
  Typography, 
  Box,
  Card,
  CardContent,
  Container,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  alpha,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Person,
  Phone,
  Home,
  Cake,
  Transgender,
  MedicalServices,
  CalendarToday,
  Schedule,
  Description,
  LocalHospital,
  ArrowBack,
  Check
} from "@mui/icons-material";

const genders = ["Male", "Female", "Other"];
const doctors = ["Dr. Smith (Cardiology)", "Dr. Johnson (Pediatrics)", "Dr. Williams (Orthopedics)", "Dr. Brown (Dermatology)", "Dr. Davis (General)"];

// Background image
const backgroundImage = `
  linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.08) 100%),
  url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234caf50' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
`;

const steps = ['Patient Information', 'Appointment Details', 'Review & Confirm'];

export default function AddAppointment() {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: "", address: "", contact: "", age: "", gender: "", doctor: "", date: "", time: "", reason: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.contact || !form.doctor || !form.date || !form.time) {
      setError("Please fill all required fields (name, contact, doctor, date, time).");
      return;
    }

    try {
      await createAppointment(form);
      setSuccess("Appointment created successfully!");
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to create appointment. Please try again.");
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Patient Full Name"
                fullWidth
                value={form.name}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="contact"
                label="Contact Number"
                fullWidth
                value={form.contact}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Home Address"
                fullWidth
                value={form.address}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Home sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="age"
                label="Age"
                type="number"
                fullWidth
                value={form.age}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Cake sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="gender"
                label="Gender"
                fullWidth
                value={form.gender}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Transgender sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              >
                {genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="doctor"
                label="Select Doctor"
                fullWidth
                value={form.doctor}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <MedicalServices sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              >
                {doctors.map(doctor => <MenuItem key={doctor} value={doctor}>{doctor}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="date"
                label="Appointment Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.date}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="time"
                label="Appointment Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.time}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="reason"
                label="Reason for Visit / Medical Concerns"
                fullWidth
                multiline
                rows={4}
                value={form.reason}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Description sx={{ color: 'text.secondary', mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
              Review Appointment Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <InfoRow label="Patient Name" value={form.name} />
                <InfoRow label="Contact Number" value={form.contact} />
                <InfoRow label="Age" value={form.age} />
                <InfoRow label="Gender" value={form.gender} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Doctor" value={form.doctor} />
                <InfoRow label="Date" value={form.date} />
                <InfoRow label="Time" value={form.time} />
                <InfoRow label="Address" value={form.address} />
              </Grid>
              <Grid item xs={12}>
                <InfoRow label="Reason for Visit" value={form.reason} multiline />
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: backgroundImage,
        backgroundSize: 'cover',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header Card */}
        <Card 
          sx={{ 
            mb: 3, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.9)} 0%, ${alpha('#2E7D32', 0.9)} 100%)`,
            color: 'white',
            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative' }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <LocalHospital sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="700" gutterBottom>
                  New Appointment
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Schedule a new patient appointment
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#4CAF50', 0.1)}`,
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={activeStep === 0 ? () => navigate("/appointments") : handleBack}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  {activeStep === 0 ? 'Back to List' : 'Back'}
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Check />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 4,
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      Confirm Appointment
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Reusable Info Row Component for Review Step
const InfoRow = ({ label, value, multiline = false }) => (
  <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: 'rgba(76, 175, 80, 0.05)' }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: multiline ? 'pre-wrap' : 'nowrap' }}>
      {value || 'Not provided'}
    </Typography>
  </Box>
);