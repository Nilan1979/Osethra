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

const PharmacistDashboard = () => {
  const { user } = useAuth();

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" gutterBottom>
                Pharmacist Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome to your pharmacy management system
              </Typography>
            </Paper>
          </Grid>
          
          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Prescriptions
                </Typography>
                {/* Add prescriptions list component here */}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inventory Status
                </Typography>
                {/* Add inventory status component here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default PharmacistDashboard;