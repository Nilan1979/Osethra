import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import Layout from '../Layout/Layout';
import { useAuth } from '../../context/AuthContext';

const ReceptionistDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" gutterBottom>
                Receptionist Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome to the appointment management system
              </Typography>
            </Paper>
          </Grid>
          
          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Appointments
                </Typography>
                {/* Add appointments list component here */}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Patient Check-ins
                </Typography>
                {/* Add check-ins component here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ReceptionistDashboard;