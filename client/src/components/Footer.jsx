import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import {
  LocalHospital,
  Phone,
  Email,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        color: 'white',
        width: '100%',
        mt: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 8, pl: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={6} alignItems="flex-start" justifyContent="center">
          
          {/* LEFT SECTION (Brand + Contact Info) */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pr: { xs: 1, sm: 2 } }}>
            {/* Brand */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <LocalHospital
                sx={{
                  fontSize: 40,
                  mb: 2,
                  color: '#fff',
                  background: 'linear-gradient(45deg, #ff6a00, #ee0979)',
                  borderRadius: '12px',
                  p: 1,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#fff',
                    letterSpacing: '2px',
                  }}
                >
                  OSETHRA HOSPITAL
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    letterSpacing: '1px',
                  }}
                >
                  Excellence in Healthcare
                </Typography>
              </Box>
            </Box>

            {/* Contact Info */}
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ fontSize: 20, mr: 1.5, color: '#ffcc70' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  +94 11 543 0000
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ fontSize: 20, mr: 1.5, color: '#ffcc70' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  info@osethrahospital.com
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* CENTER SECTION (Services + Company Links) */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={4} justifyContent="center">
              {/* Services */}
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: '600',
                    mb: 2,
                    color: '#ffcc70',
                    fontSize: '0.9rem',
                  }}
                >
                  SERVICES
                </Typography>
                <Stack spacing={1.5}>
                  {['Emergency', 'Surgery', 'Cardiology', 'Pediatrics'].map((link) => (
                    <Button
                      key={link}
                      href="#"
                      variant="outlined"
                      size="small"
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          borderColor: '#ffcc70',
                          color: '#ffcc70',
                          transform: 'translateX(3px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {link}
                    </Button>
                  ))}
                </Stack>
              </Grid>

              {/* Company */}
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: '600',
                    mb: 2,
                    color: '#ffcc70',
                    fontSize: '0.9rem',
                  }}
                >
                  COMPANY
                </Typography>
                <Stack spacing={1.5}>
                  {['About', 'Careers', 'News', 'Contact'].map((link) => (
                    <Button
                      key={link}
                      href="#"
                      variant="outlined"
                      size="small"
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          borderColor: '#ffcc70',
                          color: '#ffcc70',
                          transform: 'translateX(3px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {link}
                    </Button>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT SECTION (Emergency Hotline + Social Media) */}
          <Grid item xs={12} md={4}>
            {/* Emergency */}
            <Box sx={{ textAlign: 'center', mb: 3, pr: { xs: 1, sm: 2 } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: '600',
                  color: '#ff4444',
                  fontSize: '0.9rem',
                  mb: 0.5,
                }}
              >
                EMERGENCY HOTLINE
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '700',
                  color: '#fff',
                  fontSize: '1.6rem',
                  textShadow: '0 0 6px rgba(255,0,0,0.7)',
                }}
              >
                +94 11 543 1088
              </Typography>
            </Box>

            {/* Social Media */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: '600',
                  mb: 1.5,
                  color: '#ffcc70',
                  fontSize: '0.9rem',
                }}
              >
                CONNECT WITH US
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'center',
                }}
              >
                {[
                  { icon: <Facebook />, color: '#1877F2' },
                  { icon: <Twitter />, color: '#1DA1F2' },
                  { icon: <Instagram />, color: '#E4405F' },
                  { icon: <LinkedIn />, color: '#0A66C2' },
                ].map((item, i) => (
                  <IconButton
                    key={i}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      '&:hover': {
                        color: item.color,
                        background: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    size="small"
                  >
                    {item.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* BOTTOM SECTION */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            mt: 6,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.5px',
            }}
          >
            © {new Date().getFullYear()} OSETHRA HOSPITAL. All rights reserved. |
            <Link
              href="#"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                ml: 1,
                '&:hover': { color: 'rgba(255,255,255,0.8)' },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                ml: 2,
                '&:hover': { color: 'rgba(255,255,255,0.8)' },
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
