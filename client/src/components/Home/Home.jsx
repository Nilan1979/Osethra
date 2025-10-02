import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import './Home.css';

const services = [
  { title: 'Emergency Care', description: '24/7 medical emergency services.', icon: '🚑' },
  { title: 'Heart Surgery', description: 'Advanced cardiac treatment.', icon: '❤️' },
  { title: 'Pediatrics', description: 'Expert child healthcare.', icon: '🧸' },
];

const Home = () => {
  return (
    <Box className="home-container">
      {/* Hero Section */}
      <Box className="hero-section">
        <Container className="hero-content">
          <Box className="hero-text">
            <Typography variant="h2" className="hero-title">
              Your Health, <span className="highlight">Our Priority</span>
            </Typography>
            <Typography variant="subtitle1" className="hero-subtitle">
             Experience Premium Healthcare with State-of-the-Art Facilities, Highly Skilled Doctors, Advanced Medical Technology, Comprehensive Treatments, and Personalized, Compassionate Patient Care Tailored to Your Wellbeing
            </Typography>
            <Button variant="contained" className="hero-button">Learn More</Button>
          </Box>
          <Box className="hero-image">
            <img src="/12.png" alt="Doctor" />
          </Box>
        </Container>
        <div className="floating-shapes">
          <span className="shape shape1"></span>
          <span className="shape shape2"></span>
          <span className="shape shape3"></span>
        </div>
      </Box>

      {/* Services Section */}
      <Container className="services-section">
        <Typography variant="h4" className="section-title">Our Healthcare Services</Typography>
        <Grid container spacing={4} className="services-grid">
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className="service-card">
                <div className="service-icon-wrapper">
                  <span className="service-icon">{service.icon}</span>
                </div>
                <CardContent>
                  <Typography variant="h6" className="service-title">{service.title}</Typography>
                  <Typography variant="body2" className="service-desc">{service.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
 
      
    </Box>
  );
};

export default Home;







