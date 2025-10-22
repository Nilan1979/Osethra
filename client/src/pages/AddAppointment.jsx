import React, { useState, useEffect } from "react";
import { createAppointment, getAppointments } from "../api/appointments";
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
    doctorSpecialty: "",
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
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    contact: "",
    address: "",
    age: "",
    gender: "",
    doctor: "",
    date: "",
    time: "",
    reason: ""
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getDoctors();
        if (result.success) {
          console.log('👨‍⚕️ Doctors fetched:', result.data);
          console.log('First doctor specialty:', result.data[0]?.specialty);
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

  // Real-time validation functions
  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          errorMsg = "Name is required";
        } else if (value.trim().length < 3) {
          errorMsg = "Name must be at least 3 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errorMsg = "Name should only contain letters";
        }
        break;

      case "contact":
        if (!value.trim()) {
          errorMsg = "Contact number is required";
        } else if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ""))) {
          errorMsg = "Contact number must be 10 digits";
        }
        break;

      case "address":
        if (!value.trim()) {
          errorMsg = "Address is required";
        } else if (value.trim().length < 5) {
          errorMsg = "Address must be at least 5 characters";
        }
        break;

      case "age":
        const ageNum = parseInt(value);
        if (!value) {
          errorMsg = "Age is required";
        } else if (isNaN(ageNum) || ageNum < 1) {
          errorMsg = "Age must be a positive number";
        } else if (ageNum > 150) {
          errorMsg = "Please enter a valid age";
        }
        break;

      case "gender":
        if (!value) {
          errorMsg = "Gender is required";
        }
        break;

      case "doctor":
        if (!value) {
          errorMsg = "Please select a doctor";
        }
        break;

      case "date":
        if (!value) {
          errorMsg = "Appointment date is required";
        }
        break;

      case "time":
        if (!value) {
          errorMsg = "Appointment time is required";
        }
        break;

      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));

    return errorMsg === "";
  };

  // Helper function to format time
  const formatTime = React.useCallback((time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  // Helper function to generate 30-minute time slots
  const generateTimeSlots = React.useCallback((startTime, endTime, bookedSlots = []) => {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let totalGenerated = 0;
    let totalBooked = 0;
    
    while (currentHour * 60 + currentMin < endMinutes) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      totalGenerated++;
      
      // Check if this slot is not booked
      const isBooked = bookedSlots.some(bookedTime => {
        // Compare time strings (both should be in HH:MM format)
        return bookedTime === timeString;
      });
      
      if (isBooked) {
        totalBooked++;
        console.log(`🚫 HIDING SLOT: ${timeString} (already booked - will NOT appear in dropdown)`);
      } else {
        // Calculate end time for this slot (30 minutes later)
        let slotEndHour = currentHour;
        let slotEndMin = currentMin + 30;
        
        if (slotEndMin >= 60) {
          slotEndHour += 1;
          slotEndMin -= 60;
        }
        
        const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;
        
        slots.push({
          start: timeString,
          end: slotEndTime,
          display: `${formatTime(timeString)} - ${formatTime(slotEndTime)}`
        });
      }
      
      // Move to next 30-minute slot
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
    }
    
    console.log(`📊 SUMMARY: Generated ${totalGenerated} total slots, ${totalBooked} HIDDEN (booked), ${slots.length} VISIBLE (available)`);
    console.log(`✅ VISIBLE SLOTS (will appear in dropdown):`, slots.map(s => s.display).join(', '));
    return slots;
  }, [formatTime]);

  // Helper function to update available times based on selected date
  const updateAvailableTimes = React.useCallback((scheduleList, selectedDate, appointments = []) => {
    const schedulesForDate = scheduleList.filter(s => 
      new Date(s.date).toISOString().split('T')[0] === selectedDate
    );

    // Get all booked time slots for this date (normalize to HH:MM format)
    const appointmentsForDate = appointments.filter(apt => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      const isMatchingDate = aptDate === selectedDate;
      const isNotCancelled = apt.status !== 'Cancelled';
      return isMatchingDate && isNotCancelled;
    });
    
    console.log('📅 Selected date:', selectedDate);
    console.log('📋 Total appointments for this doctor:', appointments.length);
    console.log('📋 Appointments on selected date:', appointmentsForDate.length);
    
    const bookedSlots = appointmentsForDate
      .map(apt => {
        // Normalize time format to HH:MM (24-hour format)
        const time = apt.time || '';
        // If time is already in HH:MM format, use it
        if (time.match(/^\d{2}:\d{2}$/)) {
          return time;
        }
        // If time has seconds (HH:MM:SS), remove them
        if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return time.substring(0, 5);
        }
        return time;
      })
      .filter(time => time); // Remove empty strings

    console.log('🚫 Booked time slots that will be HIDDEN:', bookedSlots);

    let allSlots = [];
    
    // Generate 30-minute slots for each schedule period
    schedulesForDate.forEach(schedule => {
      const slots = generateTimeSlots(schedule.startTime, schedule.endTime, bookedSlots);
      allSlots = [...allSlots, ...slots];
    });

    // Remove duplicate slots and sort by time
    const uniqueSlots = Array.from(
      new Map(allSlots.map(slot => [slot.start, slot])).values()
    ).sort((a, b) => a.start.localeCompare(b.start));

    console.log('Available time slots:', uniqueSlots.length, 'slots');
    setAvailableTimes(uniqueSlots);
  }, [generateTimeSlots]);

  // Fetch doctor schedules when doctor is selected
  useEffect(() => {
    const fetchDoctorSchedules = async () => {
      if (!form.doctorId) {
        setSchedules([]);
        setAvailableDates([]);
        setAvailableTimes([]);
        setExistingAppointments([]);
        setError("");
        return;
      }

      try {
        setLoadingSchedules(true);
        setError("");
        
        // Fetch doctor's schedules
        const response = await getSchedulesByDoctor(form.doctorId, {
          startDate: new Date().toISOString().split('T')[0],
          isAvailable: true
        });

        console.log("Schedule API Response:", response);

        if (response && response.success && response.schedules) {
          if (response.schedules.length === 0) {
            // Doctor has no schedules
            setSchedules([]);
            setAvailableDates([]);
            setAvailableTimes([]);
            console.log("No schedules found for this doctor");
          } else {
            setSchedules(response.schedules);
            
            // Extract unique dates
            const dates = [...new Set(response.schedules.map(s => 
              new Date(s.date).toISOString().split('T')[0]
            ))].sort();
            setAvailableDates(dates);
            
            console.log("Available dates:", dates);

            // Fetch all appointments for this doctor
            try {
              const appointmentsResponse = await getAppointments();
              console.log("📡 Appointments API Response:", appointmentsResponse);
              console.log("📡 Response data structure:", appointmentsResponse.data);
              
              // The API returns { appointments: [...] }
              const allAppointments = appointmentsResponse.data?.appointments || appointmentsResponse.data || [];
              console.log("📋 All appointments from API:", allAppointments.length);
              
              if (allAppointments && allAppointments.length > 0) {
                // Filter appointments for this doctor (match by doctorId)
                const doctorAppointments = allAppointments.filter(apt => {
                  // Match by doctorId (primary) or by doctor name (fallback)
                  const matchesId = apt.doctorId && apt.doctorId.toString() === form.doctorId.toString();
                  const matchesName = apt.doctor && form.doctor && 
                    apt.doctor.toLowerCase().includes(form.doctor.toLowerCase().replace('dr. ', ''));
                  
                  console.log(`Checking appointment: ${apt._id}, doctorId: ${apt.doctorId}, matches: ${matchesId || matchesName}`);
                  return matchesId || matchesName;
                });
                
                setExistingAppointments(doctorAppointments);
                console.log("✅ Doctor's existing appointments:", doctorAppointments.length, "appointments found");
                console.log("📅 Appointment dates and times:", doctorAppointments.map(a => ({ 
                  date: a.date, 
                  time: a.time, 
                  status: a.status 
                })));
                
                // If a date is already selected, update times with booked slots filtered
                if (form.date) {
                  updateAvailableTimes(response.schedules, form.date, doctorAppointments);
                }
              } else {
                setExistingAppointments([]);
                console.log("ℹ️ No appointments found in the system");
              }
            } catch (aptError) {
              console.error("❌ Error fetching appointments:", aptError);
              console.error("Error details:", aptError.response?.data || aptError.message);
              // Continue without filtering appointments - show all slots
              setExistingAppointments([]);
            }
          }
        } else {
          // Invalid response format
          console.error("Invalid response format:", response);
          setSchedules([]);
          setAvailableDates([]);
          setAvailableTimes([]);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        console.error("Error details:", error.response?.data || error.message);
        setError("Failed to load doctor's schedule. Please make sure you are logged in.");
        setSchedules([]);
        setAvailableDates([]);
        setAvailableTimes([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchDoctorSchedules();
  }, [form.doctorId, form.doctor]);

  // Update available times when date changes
  useEffect(() => {
    if (form.date && schedules.length > 0) {
      updateAvailableTimes(schedules, form.date, existingAppointments);
    }
  }, [form.date, schedules, existingAppointments, updateAvailableTimes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate the field in real-time
    validateField(name, value);
    
    if (name === 'doctor') {
      const selectedDoctor = doctors.find(doc => doc._id === value);
      if (selectedDoctor) {
        setForm(prev => ({
          ...prev,
          doctor: `Dr. ${selectedDoctor.name || selectedDoctor.fullName}`,
          doctorId: selectedDoctor._id,
          doctorSpecialty: selectedDoctor.specialty || "General Practice",
          date: "", // Reset date when doctor changes
          time: ""  // Reset time when doctor changes
        }));
        validateField('doctor', selectedDoctor._id);
      }
    } else if (name === 'date') {
      // Reset time when date changes
      setForm(prev => ({ ...prev, [name]: value, time: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    // Validate current step fields before proceeding
    let isValid = true;
    
    if (activeStep === 0) {
      // Validate patient information
      isValid = validateField('name', form.name) &&
                validateField('contact', form.contact) &&
                validateField('address', form.address) &&
                validateField('age', form.age) &&
                validateField('gender', form.gender);
    } else if (activeStep === 1) {
      // Validate appointment details
      isValid = validateField('doctor', form.doctorId) &&
                validateField('date', form.date) &&
                validateField('time', form.time);
    }
    
    if (isValid) {
      setActiveStep((prev) => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields correctly');
    }
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
                error={!!validationErrors.name}
                helperText={validationErrors.name}
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
                error={!!validationErrors.contact}
                helperText={validationErrors.contact || "Enter 10-digit phone number"}
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
                error={!!validationErrors.address}
                helperText={validationErrors.address}
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
                error={!!validationErrors.age}
                helperText={validationErrors.age}
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
                error={!!validationErrors.gender}
                helperText={validationErrors.gender}
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
            {form.date && existingAppointments.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  ℹ️ Already booked time slots are automatically hidden from the list. Only available slots are shown below.
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
                error={!!validationErrors.doctor}
                helperText={validationErrors.doctor}
                sx={{
                  ...textFieldStyle,
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  }
                }}
                InputProps={{
                  startAdornment: loading ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <MedicalServices sx={{ color: 'text.secondary', mr: 1 }} />
                  )
                }}
                SelectProps={{
                  renderValue: (selected) => {
                    const selectedDoctor = doctors.find(doc => doc._id === selected);
                    if (selectedDoctor) {
                      return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Dr. {selectedDoctor.name || selectedDoctor.fullName}
                          </Typography>
                          {selectedDoctor.specialty && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              🩺 {selectedDoctor.specialty}
                            </Typography>
                          )}
                        </Box>
                      );
                    }
                    return '';
                  }
                }}
              >
                {doctors && doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <MenuItem 
                      key={doctor._id} 
                      value={doctor._id}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Dr. {doctor.name || doctor.fullName}
                        </Typography>
                        {doctor.specialty && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            🩺 {doctor.specialty}
                          </Typography>
                        )}
                        {doctor.contactNo && (
                          <Typography variant="caption" color="text.secondary">
                            📞 {doctor.contactNo}
                          </Typography>
                        )}
                      </Box>
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
                error={!!validationErrors.date}
                helperText={
                  validationErrors.date ||
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
                label="Appointment Time (30-min slots)"
                fullWidth
                value={form.time}
                onChange={handleChange}
                required
                disabled={!form.date || availableTimes.length === 0}
                error={!!validationErrors.time}
                helperText={
                  validationErrors.time ||
                  (!form.date ? "Please select a date first" : 
                   availableTimes.length === 0 && form.date ? "⚠️ All time slots are booked for this date" : 
                   `✅ ${availableTimes.length} available slots (booked slots are automatically hidden)`)
                }
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <Schedule sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              >
                {availableTimes.length > 0 ? (
                  availableTimes.map((timeSlot, index) => (
                    <MenuItem key={index} value={timeSlot.start}>
                      ✓ {timeSlot.display}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {form.date ? "All time slots are booked" : "Select a date first"}
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
        // Find the selected time slot to display full time range
        const selectedTimeSlot = availableTimes.find(slot => slot.start === form.time);
        const timeDisplay = selectedTimeSlot ? selectedTimeSlot.display : form.time;
        
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
                {form.doctorSpecialty && (
                  <InfoRow label="Specialization" value={form.doctorSpecialty} />
                )}
                <InfoRow label="Date" value={form.date} />
                <InfoRow label="Time Slot (30 minutes)" value={timeDisplay} />
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

            {error && !error.includes("Failed to load doctor's schedule") && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {error && error.includes("Failed to load doctor's schedule") && activeStep === 1 && (
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
