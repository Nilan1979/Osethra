import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ 
      background: 'linear-gradient(135deg, #2c5aa0 0%, #1e3f73 100%)',
      color: 'white',
      pt: 6,
      pb: 3,
      mt: 'auto'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h4" component="div" sx={{ 
              fontWeight: 800,
              mb: 2,
              fontSize: '2.5rem'
            }}>
              MED<span style={{ color: '#3498db' }}>IN</span>
            </Typography>
            <Typography variant="body2" sx={{ 
              mb: 3,
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.6
            }}>
              Leading the way in medical excellence. We provide comprehensive healthcare 
              services with a commitment to caring for life and delivering the highest 
              quality medical care to our patients.
            </Typography>
            
            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                sx={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    background: '#3498db',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    background: '#3498db',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    background: '#3498db',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    background: '#3498db',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              mb: 3,
              color: '#3498db'
            }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Home', 'About Us', 'Services', 'Doctors', 'News', 'Contact'].map((item) => (
                <Link 
                  key={item}
                  href="#" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    '&:hover': { 
                      color: '#3498db',
                      transform: 'translateX(5px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              mb: 3,
              color: '#3498db'
            }}>
              Our Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                'Emergency Care',
                'General Medicine',
                'Cardiology',
                'Pediatrics',
                'Surgery',
                'Laboratory'
              ].map((service) => (
                <Link 
                  key={service}
                  href="#" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    '&:hover': { 
                      color: '#3498db',
                      transform: 'translateX(5px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {service}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              mb: 3,
              color: '#3498db'
            }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationIcon sx={{ color: '#3498db', fontSize: '1.5rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  0123 Some Place<br />
                  Medical District, City 12345
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon sx={{ color: '#3498db', fontSize: '1.5rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  (+254) 717 783 146<br />
                  Emergency 24/7
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon sx={{ color: '#3498db', fontSize: '1.5rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  info@medin.com<br />
                  support@medin.com
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ClockIcon sx={{ color: '#3498db', fontSize: '1.5rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  09:00 - 20:00<br />
                  Every Day
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 4,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }} />

        {/* Bottom Footer */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            © 2025 MEDIN Healthcare. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: '#3498db' }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: '#3498db' }
              }}
            >
              Terms of Service
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: '#3498db' }
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;