import React, { useState, useEffect } from "react";
import { createAppointment } from "../api/appointments";
import { getDoctors } from "../services/userService";
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
  useTheme,
  CircularProgress
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

const steps = ['Patient Information', 'Appointment Details', 'Review & Confirm'];

export default function AddAppointment() {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: "", 
    address: "", 
    contact: "", 
    age: "", 
    gender: "", 
    doctor: "", 
    doctorId: "", 
    date: "", 
    time: "", 
    reason: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    name: "",
    address: "",
    contact: "",
    age: "",
    gender: "",
    doctor: "",
    date: "",
    time: "",
    reason: ""
  });

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value?.trim()) return 'Patient name is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) {
          return 'Name must be between 2-50 characters and contain only letters';
        }
        break;
      case 'contact':
        if (!value?.trim()) return 'Contact number is required';
        if (!/^[0-9]{10}$/.test(value.trim())) {
          return 'Contact number must be 10 digits';
        }
        break;
      case 'age':
        if (!value) return 'Age is required';
        const age = parseInt(value);
        if (isNaN(age) || age < 0 || age > 150) {
          return 'Please enter a valid age between 0 and 150';
        }
        break;
      case 'gender':
        if (!value) return 'Gender is required';
        if (!genders.includes(value)) {
          return 'Please select a valid gender';
        }
        break;
      case 'address':
        if (!value?.trim()) return 'Address is required';
        if (value.length < 5) {
          return 'Address must be at least 5 characters long';                          
        }
        break;        
      case 'doctor':
        if (!value) return 'Doctor selection is required';
        break;
      case 'date':
        if (!value) return 'Appointment date is required';
        const appointmentDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
          return 'Appointment date cannot be in the past';
        }
        break;
      case 'time':
        if (!value) return 'Appointment time is required';
        const [hours, minutes] = value.split(':');
        const appointmentTime = new Date();
        appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const workStart = new Date().setHours(8, 0, 0, 0);
        const workEnd = new Date().setHours(17, 0, 0, 0);
        if (appointmentTime < workStart || appointmentTime > workEnd) {
          return 'Appointment time must be between 8:00 AM and 5:00 PM';
        }
        break;
      case 'reason':
        if (!value?.trim()) return 'Reason for appointment is required';
        if (value.length < 10) {
          return 'Please provide a more detailed reason (minimum 10 characters)';
        }
        break;
    }
    return '';
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getDoctors();
        if (result.success) {
          setDoctors(result.data);
        } else {
          setError("Failed to load doctors list");
        }
      } catch (err) {
        setError("Failed to load doctors list");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'doctor') {
      const selectedDoctor = doctors.find(doc => doc._id === value);
      if (selectedDoctor) {
        setForm(prev => ({
          ...prev,
          doctor: `Dr. ${selectedDoctor.name}`,
          doctorId: selectedDoctor._id
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateStep = (step) => {
    let isValid = true;
    const fieldsToValidate = step === 0
      ? ['name', 'contact', 'age', 'gender', 'address']
      : step === 1
      ? ['doctor', 'date', 'time', 'reason']
      : [];
    
    // Clear previous errors
    const newErrors = {};
    fieldsToValidate.forEach(field => {
      // Check for empty required fields
      if (!form[field] && field !== 'reason') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      } else {
        // Validate field value if not empty
        const error = validateField(field, form[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });
    
    setFormErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = () => {
    const isValid = validateStep(activeStep);
    if (!isValid) {
      setError('Please fill in all required fields correctly');
      return;
    }
    setActiveStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [field, value] of Object.entries(form)) {
      const fieldError = validateField(field, value);
      if (fieldError) {
        setError(`${fieldError}`);
        return;
      }
    }
    try {
      setLoading(true);
      await createAppointment(form);
      setSuccess("Appointment created successfully!");
      setError("");
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Patient Full Name"
                fullWidth
                value={form.name}
                onChange={handleChange}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
                }}
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
                error={!!formErrors.contact}
                helperText={formErrors.contact}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Home Address"
                fullWidth
                value={form.address}
                onChange={handleChange}
                required
                error={!!formErrors.address}
                helperText={formErrors.address}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Home sx={{ color: 'text.secondary', mr: 1 }} />
                }}
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
                required
                error={!!formErrors.age}
                helperText={formErrors.age}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Cake sx={{ color: 'text.secondary', mr: 1 }} />
                }}
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
                required
                error={!!formErrors.gender}
                helperText={formErrors.gender}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Transgender sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              >
                {genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="doctor"
                label="Select Doctor"
                fullWidth
                value={form.doctorId}
                onChange={handleChange}
                required
                disabled={loading}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: loading ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <MedicalServices sx={{ color: 'text.secondary', mr: 1 }} />
                  )
                }}
              >
                {doctors && doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} {doctor.contactNo && `(${doctor.contactNo})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No doctors available</MenuItem>
                )}
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
                error={!!formErrors.date}
                helperText={formErrors.date}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                }}
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
                error={!!formErrors.time}
                helperText={formErrors.time}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
                }}
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
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Description sx={{ color: 'text.secondary', mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                }}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box sx={reviewBoxStyle}>
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
        minHeight: 'calc(100vh - 64px)',
        background: `linear-gradient(135deg, rgba(76,175,80,0.12), rgba(56,142,60,0.2))`,
        backgroundSize: "cover",
        pt: 4,
        pb: 4
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 }, mt: 2 }}>
        <Card 
          sx={{ 
            mb: 3, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.9)} 0%, ${alpha('#2E7D32', 0.9)} 100%)`,
            color: 'white',
            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <LocalHospital sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  New Appointment
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Schedule a new patient appointment
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${alpha('#4CAF50', 0.1)}`,
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Stepper activeStep={activeStep} sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, px: { xs: 0, sm: 1 } }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontWeight: activeStep === index ? "700" : "400",
                        color: activeStep === index ? theme.palette.primary.main : "text.secondary",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiStepIcon-root.Mui-active": {
                        color: theme.palette.primary.main,
                        filter: "drop-shadow(0 0 6px rgba(76,175,80,0.6))",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={activeStep === 0 ? () => navigate("/appointments") : handleBack}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 3,
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }
                  }}
                >
                  {activeStep === 0 ? 'Back to List' : 'Back'}
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={nextBtnStyle(theme)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Check />}
                      sx={confirmBtnStyle(theme)}
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

// Helper Components & Styles
const InfoRow = ({ label, value, multiline }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: multiline ? 'pre-line' : 'nowrap' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(8px)",
    "&:hover fieldset": { borderColor: "#4CAF50" },
    "&.Mui-focused fieldset": { borderColor: "#2E7D32", borderWidth: 2 }
  },
  "& .MuiInputBase-input": {
    padding: "10px 14px"
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 12px) scale(1)"
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -6px) scale(0.75)"
  }
};

const reviewBoxStyle = {
  p: 3,
  borderRadius: 2,
  background: "rgba(250,250,250,0.8)",
  border: "1px solid rgba(76,175,80,0.15)",
  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.05)"
};

const nextBtnStyle = (theme) => ({
  borderRadius: 3,
  px: 4,
  py: 1.2,
  textTransform: "none",
  fontWeight: 600,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
  boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(76,175,80,0.4)",
  }
});

const confirmBtnStyle = (theme) => ({
  borderRadius: 3,
  px: 4,
  py: 1.2,
  textTransform: "none",
  fontWeight: 600,
  background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
  boxShadow: "0 4px 12px rgba(56,142,60,0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(56,142,60,0.4)",
  }
});
