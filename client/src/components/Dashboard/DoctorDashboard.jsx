import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Grid } from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import Layout from '../Layout/Layout';
import { useAuth } from '../../context/AuthContext';

// Reusable components
const StatusChip = ({ status }) => (
  <Chip 
    label={status}
    color={
      status === 'Completed' ? 'success' :
      status === 'Scheduled' ? 'primary' :
      'warning'
    }
    size="small"
  />
);

const AppointmentsTable = ({ data, showDate = false }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          {showDate && <TableCell>Date</TableCell>}
          <TableCell>Time</TableCell>
          <TableCell>Patient Name</TableCell>
          <TableCell>Age</TableCell>
          <TableCell>Gender</TableCell>
          <TableCell>Contact</TableCell>
          <TableCell>Address</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showDate ? 9 : 8} align="center">
              No appointments {showDate ? 'found' : 'scheduled for today'}
            </TableCell>
          </TableRow>
        ) : (
          data.map((appointment) => (
            <TableRow key={appointment._id}>
              {showDate && (
                <TableCell>
                  {format(new Date(appointment.date), 'MMM dd, yyyy')}
                </TableCell>
              )}
              <TableCell>{appointment.time}</TableCell>
              <TableCell><strong>{appointment.name}</strong></TableCell>
              <TableCell>{appointment.age}</TableCell>
              <TableCell>{appointment.gender}</TableCell>
              <TableCell>{appointment.contact}</TableCell>
              <TableCell>{appointment.address}</TableCell>
              <TableCell>{appointment.reason}</TableCell>
              <TableCell>
                <StatusChip status={appointment.status} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;

      try {
        const response = await axios.get(`http://localhost:5000/appointments/doctor/${user.id}`);
        setAppointments(response.data);
        
        // Calculate statistics
        const newStats = response.data.reduce((acc, app) => {
          acc.total++;
          acc[app.status.toLowerCase()]++;
          return acc;
        }, { total: 0, scheduled: 0, completed: 0, cancelled: 0 });
        
        setStats(newStats);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Get today's appointments
  const todayAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    const today = new Date();
    return appDate.toDateString() === today.toDateString();
  });

  // Stats card data
  const statsCards = [
    { title: 'Total Appointments', value: stats.total, color: 'primary.light' },
    { title: 'Scheduled', value: stats.scheduled, color: 'info.light' },
    { title: 'Completed', value: stats.completed, color: 'success.light' },
    { title: 'Cancelled', value: stats.cancelled, color: 'warning.light' }
  ];

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" gutterBottom>
                Welcome, {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your appointments and patient schedule
              </Typography>
            </Paper>
          </Grid>

          {/* Statistics Cards */}
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ bgcolor: card.color }}>
                <CardContent>
                  <Typography color="white" gutterBottom>{card.title}</Typography>
                  <Typography variant="h4" color="white">{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Today's Appointments */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Today's Appointments ({new Date().toLocaleDateString()})
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" m={3}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : todayAppointments.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No appointments scheduled for today. Enjoy your day!
                </Alert>
              ) : (
                <AppointmentsTable data={todayAppointments} />
              )}
            </Paper>
          </Grid>

          {/* All Appointments */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>All Appointments</Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" m={3}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <AppointmentsTable data={appointments} showDate={true} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default DoctorDashboard;