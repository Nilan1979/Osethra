import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const appointmentCards = [
    { 
      icon: CalendarIcon, 
      text: 'Book an Appointment',
      color: 'primary',
      delay: 100
    },
    { 
      icon: PeopleIcon, 
      text: 'Book an Appointment',
      color: 'secondary',
      delay: 200
    },
    { 
      icon: PaymentIcon, 
      text: 'Book an Appointment',
      color: 'tertiary',
      delay: 300
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="hero-content">
                <Typography variant="overline" className="hero-tagline">
                  CARING FOR LIFE
                </Typography>
                <Typography variant="h2" component="h1" className="hero-title">
                  Leading the Way<br />
                  in Medical Excellence
                </Typography>
                
                <Button 
                  variant="contained" 
                  size="large" 
                  className="services-button"
                  sx={{ mt: 4, mb: 6 }}
                >
                  Our Services
                </Button>

                {/* Appointment Cards */}
                <Grid container spacing={2}>
                  {appointmentCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                      <Grid item xs={12} md={4} key={index}>
                        <Zoom in timeout={card.delay}>
                          <Card 
                            className={`appointment-card appointment-card-${card.color}`}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                            sx={{
                              transform: hoveredCard === index ? 'translateY(-8px)' : 'translateY(0)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                              <IconComponent className="appointment-icon" />
                              <Typography variant="body1" className="appointment-text">
                                {card.text}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box className="hero-image">
                  <Box className="doctor-image-container">
                    <Box className="doctor-image-bg"></Box>
                    <Box className="doctor-image">
                      {/* Doctor image will be a CSS background */}
                    </Box>
                    <Box className="floating-elements">
                      <Box className="floating-element floating-element-1"></Box>
                      <Box className="floating-element floating-element-2"></Box>
                      <Box className="floating-element floating-element-3"></Box>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default Home;