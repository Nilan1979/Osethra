// src/pages/EditAppointment.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppointment, updateAppointment } from "../api/appointments";
import {
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Container,
  Avatar,
  alpha,
  useTheme,
  InputAdornment
} from "@mui/material";
import {
  ArrowBack,
  MedicalServices,
  CalendarToday,
  Schedule,
  Description,
  LocalHospital,
  Check,
  Update,
  Person,
  Phone,
  Cake,
  Transgender,
  Lock
} from "@mui/icons-material";

const statusOptions = ["Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"];
const doctors = ["Dr. Smith (Cardiology)", "Dr. Johnson (Pediatrics)", "Dr. Williams (Orthopedics)", "Dr. Brown (Dermatology)", "Dr. Davis (General)"];

// Background image
const backgroundImage = `
  linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.08) 100%),
  url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234caf50' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
`;

export default function EditAppointment() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    doctor: "", 
    date: "", 
    time: "", 
    reason: "",
    status: "Scheduled"
  });

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    contact: "",
    age: "",
    gender: "",
    address: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load appointment data
  const loadAppointment = async () => {
    try {
      setLoading(true);
      const res = await getAppointment(id);
      const appointment = res.data.appointment;
      
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : "";
      
      // Set patient info (read-only)
      setPatientInfo({
        name: appointment.name || "",
        contact: appointment.contact || "",
        age: appointment.age || "",
        gender: appointment.gender || "",
        address: appointment.address || ""
      });

      // Set editable appointment details
      setForm({
        doctor: appointment.doctor || "",
        date: formattedDate,
        time: appointment.time || "",
        reason: appointment.reason || "",
        status: appointment.status || "Scheduled"
      });
    } catch (err) {
      console.error("Error loading appointment:", err);
      setError("Failed to load appointment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation - only validate editable fields
    if (!form.doctor || !form.date || !form.time) {
      setError("Please fill all required fields (doctor, date, time).");
      return;
    }

    try {
      setSubmitting(true);
      
      // Only send editable fields to the API
      const updateData = {
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        reason: form.reason,
        status: form.status
      };
      
      await updateAppointment(id, updateData);
      setSuccess("Appointment details updated successfully!");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
      
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError("Failed to update appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !patientInfo.name) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: backgroundImage,
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading appointment data...</Typography>
        </Card>
      </Box>
    );
  }

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
                  Edit Appointment Details
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Update appointment scheduling and medical details
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
              <Grid container spacing={4}>
                {/* Patient Information Section - READ ONLY */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      background: 'rgba(76, 175, 80, 0.03)',
                      border: `1px solid ${alpha('#4CAF50', 0.2)}`
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: theme.palette.primary.dark,
                          mb: 3
                        }}
                      >
                        <Lock sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                        Patient Information (Read Only)
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Patient Name"
                            value={patientInfo.name}
                            fullWidth
                            InputProps={{
                              startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />,
                              readOnly: true
                            }}
                            sx={{ 
                              mb: 2,
                              '& .MuiInputBase-input': {
                                color: 'text.secondary',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Contact Number"
                            value={patientInfo.contact}
                            fullWidth
                            InputProps={{
                              startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />,
                              readOnly: true
                            }}
                            sx={{ 
                              mb: 2,
                              '& .MuiInputBase-input': {
                                color: 'text.secondary',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Age"
                            value={patientInfo.age}
                            fullWidth
                            InputProps={{
                              startAdornment: <Cake sx={{ color: 'text.secondary', mr: 1 }} />,
                              readOnly: true
                            }}
                            sx={{ 
                              mb: 2,
                              '& .MuiInputBase-input': {
                                color: 'text.secondary',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Gender"
                            value={patientInfo.gender}
                            fullWidth
                            InputProps={{
                              startAdornment: <Transgender sx={{ color: 'text.secondary', mr: 1 }} />,
                              readOnly: true
                            }}
                            sx={{ 
                              mb: 2,
                              '& .MuiInputBase-input': {
                                color: 'text.secondary',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField 
                            label="Address"
                            value={patientInfo.address}
                            fullWidth
                            multiline
                            rows={2}
                            InputProps={{
                              startAdornment: <Description sx={{ color: 'text.secondary', mr: 1, mt: 1, alignSelf: 'flex-start' }} />,
                              readOnly: true
                            }}
                            sx={{ 
                              '& .MuiInputBase-input': {
                                color: 'text.secondary',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Appointment Details Section - EDITABLE */}
                <Grid item xs={12}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      color: theme.palette.primary.dark,
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      pb: 1,
                      mb: 3
                    }}
                  >
                    Appointment Details (Editable)
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    name="doctor"
                    label="Select Doctor *"
                    fullWidth
                    value={form.doctor}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <MedicalServices sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                    sx={{ mb: 3 }}
                  >
                    {doctors.map(doctor => (
                      <MenuItem key={doctor} value={doctor}>{doctor}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    name="status"
                    label="Appointment Status"
                    fullWidth
                    value={form.status}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Update sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                    sx={{ mb: 3 }}
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="date"
                    label="Appointment Date *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={form.date}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="time"
                    label="Appointment Time *"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={form.time}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="reason"
                    label="Medical Notes & Reason for Visit"
                    fullWidth
                    multiline
                    rows={4}
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Update medical notes, consultation details, or reason for visit..."
                    InputProps={{
                      startAdornment: <Description sx={{ color: 'text.secondary', mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/appointments")}
                    disabled={submitting}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 4,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    type="submit" 
                    startIcon={submitting ? <CircularProgress size={20} /> : <Check />}
                    disabled={submitting}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    {submitting ? 'Updating...' : 'Update Appointment'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}