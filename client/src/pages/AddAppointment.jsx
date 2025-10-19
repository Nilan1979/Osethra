import React, { useState, useEffect } from "react";
import { createAppointment } from "../api/appointments";
import { getDoctors } from "../services/userService";
import { getSchedulesByDoctor } from "../api/schedule";
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
  const navigate = useNavigate();
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
  const [schedules, setSchedules] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getDoctors();
        if (result.success) {
          setDoctors(result.data);
        } else {
          setError("Failed to load doctors list");
        }
      } catch {
        setError("Failed to load doctors list");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Helper function to format time
  const formatTime = React.useCallback((time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  // Helper function to update available times based on selected date
  const updateAvailableTimes = React.useCallback((scheduleList, selectedDate) => {
    const schedulesForDate = scheduleList.filter(s => 
      new Date(s.date).toISOString().split('T')[0] === selectedDate
    );

    const times = schedulesForDate.map(s => ({
      start: s.startTime,
      end: s.endTime,
      display: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`
    }));

    setAvailableTimes(times);
  }, [formatTime]);

  // Fetch doctor schedules when doctor is selected
  useEffect(() => {
    const fetchDoctorSchedules = async () => {
      if (!form.doctorId) {
        setSchedules([]);
        setAvailableDates([]);
        setAvailableTimes([]);
        return;
      }

      try {
        setLoadingSchedules(true);
        const response = await getSchedulesByDoctor(form.doctorId, {
          startDate: new Date().toISOString().split('T')[0],
          isAvailable: true
        });

        if (response.success && response.schedules) {
          setSchedules(response.schedules);
          
          // Extract unique dates
          const dates = [...new Set(response.schedules.map(s => 
            new Date(s.date).toISOString().split('T')[0]
          ))].sort();
          setAvailableDates(dates);

          // If a date is already selected, update times
          if (form.date) {
            updateAvailableTimes(response.schedules, form.date);
          }
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setError("Failed to load doctor's schedule");
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchDoctorSchedules();
  }, [form.doctorId, form.date, updateAvailableTimes]);

  // Update available times when date changes
  useEffect(() => {
    if (form.date && schedules.length > 0) {
      updateAvailableTimes(schedules, form.date);
    }
  }, [form.date, schedules, updateAvailableTimes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'doctor') {
      const selectedDoctor = doctors.find(doc => doc._id === value);
      if (selectedDoctor) {
        setForm(prev => ({
          ...prev,
          doctor: `Dr. ${selectedDoctor.name}`,
          doctorId: selectedDoctor._id,
          date: "", // Reset date when doctor changes
          time: ""  // Reset time when doctor changes
        }));
      }
    } else if (name === 'date') {
      // Reset time when date changes
      setForm(prev => ({ ...prev, [name]: value, time: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            {form.doctorId && availableDates.length === 0 && !loadingSchedules && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  This doctor has no available schedules. Please ask the doctor to add their availability in the Schedule Management page.
                </Alert>
              </Grid>
            )}
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
                select
                name="date"
                label="Appointment Date"
                fullWidth
                value={form.date}
                onChange={handleChange}
                required
                disabled={!form.doctorId || loadingSchedules || availableDates.length === 0}
                helperText={
                  (!form.doctorId ? "Please select a doctor first" : 
                   availableDates.length === 0 && form.doctorId ? "No available dates for this doctor" : "")
                }
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: loadingSchedules ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                  )
                }}
              >
                {availableDates.length > 0 ? (
                  availableDates.map(date => (
                    <MenuItem key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {form.doctorId ? "No available dates" : "Select a doctor first"}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="time"
                label="Appointment Time"
                fullWidth
                value={form.time}
                onChange={handleChange}
                required
                disabled={!form.date || availableTimes.length === 0}
                helperText={
                  (!form.date ? "Please select a date first" : 
                   availableTimes.length === 0 && form.date ? "No available times for this date" : "")
                }
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              >
                {availableTimes.length > 0 ? (
                  availableTimes.map((timeSlot, index) => (
                    <MenuItem key={index} value={timeSlot.start}>
                      {timeSlot.display}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {form.date ? "No available times" : "Select a date first"}
                  </MenuItem>
                )}
              </TextField>
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
