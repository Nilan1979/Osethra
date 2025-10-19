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
    
    // Show warning when marking as completed
    if (e.target.name === 'status' && e.target.value === 'Completed') {
      setError("Note: Marking an appointment as 'Completed' here does not create a treatment record. Treatments should be created through the doctor dashboard by adding treatment details.");
    }
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
        background: '#F0F9F0',
        backgroundSize: 'cover',
        py: { xs: 3, sm: 4, md: 5 }
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header Card */}
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4,
            background: '#4CAF50',
            color: 'white',
            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 12px 48px rgba(76, 175, 80, 0.3)'
            },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)'
            }
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
            borderRadius: 4,
            background: '#FFFFFF',
            border: '1px solid rgba(76, 175, 80, 0.1)',
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.08)',
            overflow: 'hidden',
            maxWidth: '800px',
            margin: '0 auto',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Alerts */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  backgroundColor: '#FEE2E2',
                  color: '#991B1B',
                  '& .MuiAlert-icon': {
                    color: '#991B1B',
                    fontSize: '1.25rem'
                  }
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  '& .MuiAlert-icon': {
                    color: '#065F46',
                    fontSize: '1.25rem'
                  }
                }}
              >
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Patient Information Section - READ ONLY */}
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      background: 'rgba(76, 175, 80, 0.03)',
                      border: `1px solid ${alpha('#4CAF50', 0.2)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease-in-out',
                      mb: 2,
                      '&:hover': {
                        boxShadow: `0 2px 12px ${alpha('#4CAF50', 0.08)}`
                      }
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
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            size="small"
                            label="Patient Name"
                            value={patientInfo.name}
                            fullWidth
                            InputProps={{
                              startAdornment: <Person sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                              readOnly: true
                            }}
                            sx={{ 
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 8,
                                backgroundColor: '#F5F9F5',
                                '& fieldset': {
                                  borderColor: 'rgba(76, 175, 80, 0.2)'
                                },
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main
                                }
                              },
                              '& .MuiInputBase-input': {
                                color: 'text.primary',
                                fontSize: '0.9rem',
                                padding: '12px 14px'
                              },
                              '& .MuiInputLabel-root': {
                                color: 'text.secondary',
                                fontSize: '0.9rem'
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
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                borderRadius: '8px'
                              },
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#4CAF50', 0.2)
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#4CAF50', 0.3)
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#4CAF50'
                                }
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
                      color: '#1E4620',
                      borderBottom: '2px solid rgba(76, 175, 80, 0.2)',
                      pb: 2,
                      mb: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      '& svg': {
                        color: '#4CAF50',
                        fontSize: 24
                      }
                    }}
                  >
                    <MedicalServices />
                    Appointment Details
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    size="small"
                    name="doctor"
                    label="Select Doctor *"
                    fullWidth
                    value={form.doctor}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <MedicalServices sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#F8FAFC',
                        '& fieldset': {
                          borderColor: 'transparent'
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: 'text.primary',
                        fontSize: '0.9rem',
                        padding: '12px 14px'
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        fontSize: '0.9rem'
                      }
                    }}
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
                <Grid item xs={12} 
                  sx={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    gap: 2, 
                    mt: 3,
                    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    pt: 3
                  }}
                >
                  <Button 
                    size="small"
                    variant="outlined" 
                    startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                    onClick={() => navigate("/appointments")}
                    disabled={submitting}
                    sx={{ 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 2,
                      py: 0.5,
                      fontSize: '0.875rem',
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="small"
                    variant="contained" 
                    type="submit" 
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Check sx={{ fontSize: 18 }} />}
                    disabled={submitting}
                    sx={{ 
                      borderRadius: 8,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      fontSize: '0.875rem',
                      backgroundColor: '#4CAF50',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.25)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#43A047',
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`
                      }
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