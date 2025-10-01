import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Stack,
  Grid,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import {
  LocalHospital,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

const Footer = () => {
  const [latestAppointments, setLatestAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/appointments/latest');
        setLatestAppointments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load latest appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAppointments();
  }, []);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
        color: 'white',
        width: '100%',
        mt: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospital 
                sx={{ 
                  fontSize: 36, 
                  mr: 2, 
                  color: '#ffffff',
                  background: 'linear-gradient(45deg, #666666, #999999)',
                  borderRadius: '8px',
                  p: 0.5
                }} 
              />
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: '300',
                    color: 'white',
                    letterSpacing: '2px'
                  }}
                >
                  OSETHRA HOSPITAL
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '1px'
                  }}
                >
                  Excellence in Healthcare
                </Typography>
              </Box>
            </Box>
            
            {/* Contact Info */}
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ fontSize: 18, mr: 1.5, color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  +94 11 543 0000
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ fontSize: 18, mr: 1.5, color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  info@osethrahospital.com
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: '600', 
                    mb: 2, 
                    color: 'rgba(255,255,255,0.9)',
                    letterSpacing: '1px',
                    fontSize: '0.8rem'
                  }}
                >
                  SERVICES
                </Typography>
                <Stack spacing={1}>
                  {['Emergency', 'Surgery', 'Cardiology', 'Pediatrics'].map((link) => (
                    <Link
                      key={link}
                      href="#"
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        '&:hover': { 
                          color: '#ffffff',
                          transform: 'translateX(2px)'
                        },
                        display: 'block',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: '600', 
                    mb: 2, 
                    color: 'rgba(255,255,255,0.9)',
                    letterSpacing: '1px',
                    fontSize: '0.8rem'
                  }}
                >
                  COMPANY
                </Typography>
                <Stack spacing={1}>
                  {['About', 'Careers', 'News', 'Contact'].map((link) => (
                    <Link
                      key={link}
                      href="#"
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        '&:hover': { 
                          color: '#ffffff',
                          transform: 'translateX(2px)'
                        },
                        display: 'block',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* Social Media & Emergency */}
          <Grid item xs={12} sm={4}>
            {/* Emergency Hotline */}
            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mb: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: '600', 
                  color: '#ff4444',
                  letterSpacing: '1px',
                  fontSize: '0.8rem',
                  mb: 0.5
                }}
              >
                EMERGENCY HOTLINE
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1.4rem'
                }}
              >
                +94 11 543 1088
              </Typography>
            </Box>

            {/* Latest Appointments */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: '600',
                  mb: 2,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '1px',
                  fontSize: '0.8rem'
                }}
              >
                LATEST APPOINTMENTS
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center">
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                </Box>
              ) : error ? (
                <Typography color="error" variant="body2">{error}</Typography>
              ) : (
                <Stack spacing={1}>
                  {latestAppointments.slice(0, 3).map((appointment) => (
                    <Box key={appointment._id} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                        {appointment.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Social Media */}
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: '600', 
                  mb: 1.5, 
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '1px',
                  fontSize: '0.8rem'
                }}
              >
                CONNECT WITH US
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  justifyContent: { xs: 'flex-start', md: 'flex-end' }
                }}
              >
                <IconButton 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.05)',
                    '&:hover': { 
                      color: '#1877F2', 
                      background: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  size="small"
                >
                  <Facebook sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.05)',
                    '&:hover': { 
                      color: '#1DA1F2', 
                      background: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  size="small"
                >
                  <Twitter sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.05)',
                    '&:hover': { 
                      color: '#E4405F', 
                      background: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  size="small"
                >
                  <Instagram sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.05)',
                    '&:hover': { 
                      color: '#0A66C2', 
                      background: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  size="small"
                >
                  <LinkedIn sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            mt: 4, 
            pt: 3,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.5px'
            }}
          >
            © {new Date().getFullYear()} OSETHRA HOSPITAL. All rights reserved. | 
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255,255,255,0.4)', 
                textDecoration: 'none', 
                ml: 1,
                '&:hover': { color: 'rgba(255,255,255,0.6)' }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255,255,255,0.4)', 
                textDecoration: 'none', 
                ml: 2,
                '&:hover': { color: 'rgba(255,255,255,0.6)' }
              }}
            >
              Terms of Service
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;