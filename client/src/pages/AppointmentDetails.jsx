import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointment, downloadIndividualPDF } from '../api/appointments';
import { 
  Paper, 
  Typography, 
  Grid, 
  Button, 
  Box,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Container,
  Chip,
  Avatar,
  Divider,
  Skeleton,
  Alert,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  FileDownloadOutlined,
  ArrowBack,
  EditOutlined,
  CalendarToday,
  Schedule,
  Person,
  Phone,
  Cake,
  Transgender,
  MedicalServices,
  Description,
  LocalHospital,
  VerifiedUser,
  AccessTime
} from '@mui/icons-material';

// Background image
const backgroundImage = `
  linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.08) 100%),
  url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234caf50' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
`;

export default function AppointmentDetails() {
  const theme = useTheme();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAppointment(id);
        setAppointment(response.data.appointment);
      } catch (error) {
        console.error('Error loading appointment:', error);
        setError('Failed to load appointment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadAppointment();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const response = await downloadIndividualPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      window.open(url);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointment-${appointment?.name}-${new Date().toLocaleDateString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      scheduled: 'primary',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'error',
      'no-show': 'warning',
      pending: 'secondary'
    };
    return statusColors[status?.toLowerCase()] || 'default';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      scheduled: <AccessTime />,
      confirmed: <VerifiedUser />,
      completed: <LocalHospital />,
      cancelled: <Description />,
      'no-show': <Schedule />,
      pending: <AccessTime />
    };
    return statusIcons[status?.toLowerCase()] || <AccessTime />;
  };

  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Skeleton 
          variant="rectangular" 
          height={120} 
          sx={{ borderRadius: 3 }}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton 
              variant="rectangular" 
              height={400} 
              sx={{ borderRadius: 3 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton 
              variant="rectangular" 
              height={400} 
              sx={{ borderRadius: 3 }}
            />
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          sx={{
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.dark, 0.1)} 100%)`,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '& .MuiAlert-icon': {
              color: theme.palette.error.main
            }
          }}
          action={
            <Button 
              variant="outlined"
              color="inherit" 
              size="small" 
              onClick={() => navigate('/appointments')}
              sx={{ borderRadius: 2 }}
            >
              Back to List
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Unable to Load Appointment
          </Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="warning"
          sx={{
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.dark, 0.1)} 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
          }}
          action={
            <Button 
              variant="outlined"
              color="inherit" 
              size="small" 
              onClick={() => navigate('/appointments')}
              sx={{ borderRadius: 2 }}
            >
              Back to List
            </Button>
          }
        >
          <Typography variant="h6">
            Appointment Not Found
          </Typography>
          <Typography variant="body2">
            The requested appointment could not be found in our system.
          </Typography>
        </Alert>
      </Container>
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
      <Container maxWidth="xl">
        {/* Header Section */}
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.9)} 0%, ${alpha('#2E7D32', 0.9)} 100%)`,
            color: 'white',
            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
            overflow: 'hidden',
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
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
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
                    Appointment Details
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9 }}>
                    OSETHRA Hospital Management System
                  </Typography>
                  <Chip
                    icon={getStatusIcon(appointment?.status)}
                    label={appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
                    color={getStatusColor(appointment?.status)}
                    variant="filled"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 1,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Download PDF Report">
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadOutlined />}
                    onClick={handleDownloadPDF}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                        borderColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Export PDF
                  </Button>
                </Tooltip>
                
                <Button
                  variant="contained"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(`/appointments/${id}/edit`)}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    background: 'rgba(255,255,255,0.9)',
                    color: '#2E7D32',
                    boxShadow: '0 4px 16px rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'white',
                      boxShadow: '0 6px 20px rgba(255,255,255,0.4)'
                    }
                  }}
                >
                  Edit Appointment
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Patient Information Card */}
          <Grid item xs={12} lg={8}>
            <Card 
              sx={{ 
                borderRadius: 3,
                height: '100%',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#4CAF50', 0.1)}`,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="600" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: 4,
                    color: theme.palette.primary.dark
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    }}
                  >
                    <Person />
                  </Avatar>
                  Patient Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem 
                      icon={<Person sx={{ color: theme.palette.primary.main }} />}
                      label="Patient Name"
                      value={appointment?.name || 'Not specified'}
                      primary
                      theme={theme}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <InfoItem 
                      icon={<Phone sx={{ color: theme.palette.primary.main }} />}
                      label="Contact Number"
                      value={appointment?.contact || 'Not specified'}
                      theme={theme}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <InfoItem 
                      icon={<Cake sx={{ color: theme.palette.primary.main }} />}
                      label="Age"
                      value={appointment?.age ? `${appointment.age} years` : 'Not specified'}
                      theme={theme}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <InfoItem 
                      icon={<Transgender sx={{ color: theme.palette.primary.main }} />}
                      label="Gender"
                      value={appointment?.gender || 'Not specified'}
                      theme={theme}
                    />
                  </Grid>
                </Grid>

                <Divider 
                  sx={{ 
                    my: 4,
                    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.3)} 50%, transparent 100%)`
                  }} 
                />

                {/* Appointment Reason */}
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="600" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 3,
                      color: theme.palette.primary.dark
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                      }}
                    >
                      <Description />
                    </Avatar>
                    Medical Consultation Details
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      background: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      minHeight: 120
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      color="text.primary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {appointment?.reason || 'No medical reason provided for this consultation.'}
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointment Details Card */}
          <Grid item xs={12} lg={4}>
            <Card 
              sx={{ 
                borderRadius: 3,
                height: '100%',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#4CAF50', 0.1)}`,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="600" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: 4,
                    color: theme.palette.primary.dark
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                    }}
                  >
                    <MedicalServices />
                  </Avatar>
                  Appointment Details
                </Typography>

                <Stack spacing={3}>
                  <InfoItem 
                    icon={<MedicalServices sx={{ color: theme.palette.secondary.main }} />}
                    label="Consulting Doctor"
                    value={appointment?.doctor || 'Not assigned'}
                    theme={theme}
                  />
                  
                  <InfoItem 
                    icon={<CalendarToday sx={{ color: theme.palette.secondary.main }} />}
                    label="Appointment Date"
                    value={appointment?.date ? new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not scheduled'}
                    theme={theme}
                  />
                  
                  <InfoItem 
                    icon={<Schedule sx={{ color: theme.palette.secondary.main }} />}
                    label="Scheduled Time"
                    value={appointment?.time || 'Not scheduled'}
                    theme={theme}
                  />
                  
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="600" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                    >
                      <VerifiedUser sx={{ color: theme.palette.secondary.main }} />
                      Appointment Status
                    </Typography>
                    <Chip 
                      icon={getStatusIcon(appointment?.status)}
                      label={appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
                      color={getStatusColor(appointment?.status)}
                      sx={{ 
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontSize: '0.9rem',
                        background: `linear-gradient(135deg, ${alpha(theme.palette[getStatusColor(appointment?.status)]?.main || theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette[getStatusColor(appointment?.status)]?.dark || theme.palette.primary.dark, 0.9)} 100%)`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette[getStatusColor(appointment?.status)]?.main || theme.palette.primary.main, 0.3)}`
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end', 
          mt: 4,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/appointments')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Back to Appointments
          </Button>
          
          <Button
            variant="contained"
            startIcon={<EditOutlined />}
            onClick={() => navigate(`/appointments/${id}/edit`)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            Edit Appointment Details
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

// Reusable Info Item Component
const InfoItem = ({ icon, label, value, primary = false, theme }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      background: alpha(theme.palette.background.paper, 0.6),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: alpha(theme.palette.background.paper, 0.8),
        borderColor: alpha(theme.palette.primary.main, 0.15),
        transform: 'translateY(-2px)'
      }
    }}
  >
    <Typography 
      variant="subtitle2" 
      color="text.secondary" 
      gutterBottom
      sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
    >
      {icon}
      {label}
    </Typography>
    <Typography 
      variant={primary ? "h6" : "body1"} 
      fontWeight={primary ? 700 : 500}
      color="text.primary"
      sx={{ 
        background: primary ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : 'none',
        backgroundClip: primary ? 'text' : 'none',
        WebkitBackgroundClip: primary ? 'text' : 'none',
        WebkitTextFillColor: primary ? 'transparent' : 'none'
      }}
    >
      {value}
    </Typography>
  </Box>
);