import React, { useEffect, useState } from "react";
import { getAppointments, deleteAppointment, downloadPDF } from "../api/appointments";
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton, 
  Typography, 
  Box,
  TextField,
  Stack,
  Card,
  CardContent,
  Container,
  Chip,
  Avatar,
  InputAdornment,
  Tooltip,
  alpha,
  useTheme,
  Grid,
  Paper,
  Fade,
  Zoom,
  Slide
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  SearchOutlined,
  FileDownloadOutlined,
  Add,
  LocalHospital,
  Person,
  Phone,
  CalendarToday,
  Schedule,
  MedicalServices,
  TrendingUp,
  Group,
  AccessTime,
  CheckCircle
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

// Premium background with medical theme
const premiumBackground = `
  linear-gradient(135deg, 
    rgba(76, 175, 80, 0.08) 0%, 
    rgba(56, 142, 60, 0.12) 50%, 
    rgba(76, 175, 80, 0.05) 100%),
  url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234caf50' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")
`;

export default function AppointmentsList() {
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async (search) => {
    try {
      setLoading(true);
      const res = await getAppointments(search);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    load(searchTerm);
  };

  const handleExportPDF = async () => {
    try {
      const response = await downloadPDF();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'appointments.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    await deleteAppointment(id);
    load();
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

  // Statistics calculation
  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    today: appointments.filter(a => {
      const today = new Date().toDateString();
      const appointmentDate = new Date(a.date).toDateString();
      return appointmentDate === today;
    }).length
  };

  // Statistics data array - FIXED SYNTAX
  const statisticsData = [
    { 
      icon: <Group sx={{ fontSize: 24 }} />, 
      label: 'Total Appointments', 
      value: stats.total, 
      color: '#4FC3F7' 
    },
    { 
      icon: <CheckCircle sx={{ fontSize: 24 }} />, 
      label: 'Completed', 
      value: stats.completed, 
      color: '#4CAF50' 
    },
    { 
      icon: <AccessTime sx={{ fontSize: 24 }} />, 
      label: 'Scheduled', 
      value: stats.scheduled, 
      color: '#FF9800' 
    },
    { 
      icon: <TrendingUp sx={{ fontSize: 24 }} />, 
      label: "Today's", 
      value: stats.today, 
      color: '#E91E63' 
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: premiumBackground,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* Hero Section with Stats */}
        <Fade in timeout={800}>
          <Card 
            sx={{ 
              mb: 4, 
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.95)} 0%, ${alpha('#2E7D32', 0.95)} 100%)`,
              color: 'white',
              boxShadow: '0 20px 60px rgba(76, 175, 80, 0.3)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }
            }}
          >
            <CardContent sx={{ p: 4, position: 'relative' }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      <LocalHospital sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight="800" gutterBottom>
                        Appointments Dashboard
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                        Real-time Management & Patient Care Tracking
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      color="inherit"
                      startIcon={<FileDownloadOutlined />}
                      onClick={handleExportPDF}
                      sx={{ 
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Export Report
                    </Button>
                    <Button 
                      variant="contained" 
                      color="inherit"
                      startIcon={<Add />}
                      onClick={() => navigate("/appointments/add")}
                      sx={{ 
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1,
                        background: 'rgba(255,255,255,0.9)',
                        color: '#2E7D32',
                        boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'white',
                          boxShadow: '0 12px 30px rgba(255,255,255,0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      New Appointment
                    </Button>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    {statisticsData.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Zoom in timeout={1000 + (index * 200)}>
                          <Paper
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 3,
                              color: 'white',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                background: 'rgba(255,255,255,0.15)'
                              }
                            }}
                          >
                            <Box sx={{ color: stat.color, mb: 1 }}>
                              {stat.icon}
                            </Box>
                            <Typography variant="h4" fontWeight="700">
                              {stat.value}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {stat.label}
                            </Typography>
                          </Paper>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Search Section */}
        <Slide direction="up" in timeout={600}>
          <Card 
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#4CAF50', 0.1)}`,
              boxShadow: '0 15px 50px rgba(76, 175, 80, 0.15)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }}>
                <TextField
                  size="medium"
                  label="Search appointments by patient name, doctor, or contact..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  sx={{ 
                    flex: 1,
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'white',
                      fontSize: '1rem'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<SearchOutlined />}
                  onClick={handleSearch}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Search
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Slide>

        {/* Appointments Table Section */}
        <Fade in timeout={1000}>
          <Card 
            sx={{ 
              borderRadius: 3,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#4CAF50', 0.1)}`,
              boxShadow: '0 20px 60px rgba(76, 175, 80, 0.15)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Loading appointments...
                  </Typography>
                </Box>
              ) : (
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ 
                      background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.08)} 0%, ${alpha('#2E7D32', 0.08)} 100%)`,
                      borderBottom: `2px solid ${alpha('#4CAF50', 0.2)}`
                    }}>
                      {['Patient', 'Contact', 'Doctor', 'Date', 'Time', 'Status', 'Actions'].map((header, index) => (
                        <TableCell 
                          key={header}
                          sx={{ 
                            fontWeight: 700, 
                            color: '#2E7D32', 
                            py: 3,
                            fontSize: '1rem',
                            borderBottom: 'none'
                          }}
                          align={header === 'Actions' ? 'right' : 'left'}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment, index) => (
                      <Slide direction="up" in timeout={800 + (index * 100)} key={appointment._id}>
                        <TableRow 
                          sx={{ 
                            '&:hover': { 
                              background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.04)} 0%, ${alpha('#2E7D32', 0.04)} 100%)`,
                              transform: 'translateX(4px)'
                            },
                            transition: 'all 0.3s ease',
                            borderBottom: `1px solid ${alpha('#4CAF50', 0.1)}`
                          }}
                        >
                          <TableCell sx={{ py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                                }}
                              >
                                <Person sx={{ fontSize: 20 }} />
                              </Avatar>
                              <Box>
                                <Typography fontWeight="600" fontSize="1rem">
                                  {appointment.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Patient ID: {appointment._id?.slice(-6)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Phone sx={{ fontSize: 20, color: 'primary.main' }} />
                              <Typography fontWeight="500">{appointment.contact}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <MedicalServices sx={{ fontSize: 20, color: 'primary.main' }} />
                              <Typography fontWeight="500">{appointment.doctor}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <CalendarToday sx={{ fontSize: 20, color: 'primary.main' }} />
                              <Box>
                                <Typography fontWeight="500">
                                  {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  }) : 'Not set'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', { 
                                    weekday: 'short' 
                                  }) : ''}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
                              <Typography fontWeight="500">{appointment.time}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 3 }}>
                            <Chip 
                              label={appointment.status}
                              color={getStatusColor(appointment.status)}
                              size="medium"
                              sx={{ 
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: '0.8rem',
                                textTransform: 'capitalize'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 3 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton 
                                  onClick={() => navigate(`/appointments/${appointment._id}`)}
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    background: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': { 
                                      background: alpha(theme.palette.primary.main, 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <VisibilityOutlined />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Appointment">
                                <IconButton 
                                  onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
                                  sx={{ 
                                    color: theme.palette.info.main,
                                    background: alpha(theme.palette.info.main, 0.1),
                                    '&:hover': { 
                                      background: alpha(theme.palette.info.main, 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Appointment">
                                <IconButton 
                                  onClick={() => handleDelete(appointment._id)}
                                  sx={{ 
                                    color: theme.palette.error.main,
                                    background: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { 
                                      background: alpha(theme.palette.error.main, 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {appointments.length === 0 && !loading && (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <LocalHospital sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No appointments found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first appointment to get started'}
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => navigate("/appointments/add")}
                    sx={{ 
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5
                    }}
                  >
                    Create First Appointment
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}