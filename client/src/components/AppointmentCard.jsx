// src/components/AppointmentCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Button
} from "@mui/material";
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as DateIcon,
  Schedule as TimeIcon,
  LocalHospital as DoctorIcon, // ✅ This is correct
  LocationOn as AddressIcon,
  Notes as ReasonIcon,
  Flag as StatusIcon
} from "@mui/icons-material";

const AppointmentCard = ({ appointment, onEdit, onDelete, showActions = false }) => {
  if (!appointment) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
        <CardContent>
          <Typography color="textSecondary">No appointment data found</Typography>
        </CardContent>
      </Card>
    );
  }

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no show': return 'warning';
      default: return 'primary'; // scheduled
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time nicely
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        mt: 2,
        boxShadow: 3,
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      {/* Header Section with Status */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Appointment Details
          </Typography>
          <Chip
            label={appointment.status || 'Scheduled'}
            color={getStatusColor(appointment.status)}
            sx={{ color: 'white', fontWeight: 'bold' }}
          />
        </Box>
        {appointment._id && (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            ID: {appointment._id}
          </Typography>
        )}
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Patient Information Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            Patient Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>Name:</strong> {appointment.name || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>Contact:</strong> {appointment.contact || 'N/A'}
                </Typography>
              </Box>
            </Grid>

            {(appointment.age || appointment.gender) && (
              <>
                <Grid item xs={6} md={3}>
                  <Typography variant="body1">
                    <strong>Age:</strong> {appointment.age || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body1">
                    <strong>Gender:</strong> {appointment.gender || 'N/A'}
                  </Typography>
                </Grid>
              </>
            )}

            {appointment.address && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <AddressIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                  <Typography variant="body1">
                    <strong>Address:</strong> {appointment.address}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Appointment Details Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DoctorIcon />
            Appointment Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DoctorIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>Doctor:</strong> {appointment.doctor || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DateIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>Date:</strong> {formatDate(appointment.date)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimeIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>Time:</strong> {formatTime(appointment.time)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StatusIcon color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>Status:</strong> {appointment.status || 'Scheduled'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Reason for Visit */}
        {appointment.reason && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReasonIcon />
                Reason for Visit
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 1,
                  fontStyle: appointment.reason ? 'normal' : 'italic'
                }}
              >
                {appointment.reason || 'No reason provided'}
              </Typography>
            </Box>
          </>
        )}

        {/* Action Buttons */}
        {showActions && onEdit && onDelete && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={onEdit}
              >
                Edit Appointment
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={onDelete}
              >
                Delete Appointment
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ✅ Make sure this export is correct
export default AppointmentCard;