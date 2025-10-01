import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton
} from '@mui/material';
import {
  Phone as PhoneIcon,
  AccessTime as ClockIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = ({ showNavigation = true, showContactInfo = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {/* Contact Info Header */}
      {showContactInfo && (
        <AppBar position="static" sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#333',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 800,
                    color: '#2c5aa0',
                    fontSize: '2.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleHomeClick}
                >
                  MED<span style={{ color: '#3498db' }}>IN</span>
                </Typography>
              </Box>

              {/* Contact Info */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ 
                    color: '#3498db',
                    background: '#e3f2fd',
                    padding: '8px',
                    borderRadius: '50%',
                    fontSize: '1.2rem'
                  }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      letterSpacing: 1
                    }}>
                      EMERGENCY
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#2c5aa0',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      (+254) 717 783 146
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClockIcon sx={{ 
                    color: '#3498db',
                    background: '#e3f2fd',
                    padding: '8px',
                    borderRadius: '50%',
                    fontSize: '1.2rem'
                  }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      letterSpacing: 1
                    }}>
                      WORK HOUR
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#2c5aa0',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      09:00 - 20:00 Everyday
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ 
                    color: '#3498db',
                    background: '#e3f2fd',
                    padding: '8px',
                    borderRadius: '50%',
                    fontSize: '1.2rem'
                  }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: '#666',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      letterSpacing: 1
                    }}>
                      LOCATION
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#2c5aa0',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      0123 Some Place
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      )}

      {/* Navigation Header */}
      {showNavigation && (
        <AppBar position="static" sx={{ 
          background: '#2c5aa0',
          boxShadow: '0 2px 10px rgba(44, 90, 160, 0.3)'
        }}>
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Button 
                  color="inherit" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '12px 16px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                  onClick={handleHomeClick}
                >
                  Home
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '12px 16px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  About us
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '12px 16px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Services
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '12px 16px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Doctors
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '12px 16px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  News
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    padding: '12px 16px',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Contact
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton color="inherit">
                  <SearchIcon />
                </IconButton>
                
                {user ? (
                  <>
                    <Button 
                      variant="outlined"
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        padding: '8px 20px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '25px',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'white'
                        }
                      }}
                      onClick={handleDashboardClick}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="contained"
                      sx={{
                        background: '#3498db',
                        color: 'white',
                        padding: '10px 24px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '25px',
                        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
                        '&:hover': {
                          background: '#2980b9',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)'
                        }
                      }}
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained"
                    sx={{
                      background: '#3498db',
                      color: 'white',
                      padding: '10px 24px',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '25px',
                      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
                      '&:hover': {
                        background: '#2980b9',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)'
                      }
                    }}
                    onClick={handleLoginClick}
                  >
                    Login
                  </Button>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      )}
    </>
  );
};

export default Header;