import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocalHospital,
  KeyboardArrowDown,
  AccountCircle,
  ExitToApp,
  Person,
  Dashboard,
  Settings,
  NotificationsActive
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for menu anchors
  const [excellenceAnchor, setExcellenceAnchor] = useState(null);
  const [servicesAnchor, setServicesAnchor] = useState(null);
  const [mediaAnchor, setMediaAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Helper function to get role color and icon
  const getRoleInfo = (role) => {
    const roleMap = {
      admin: { color: '#C41E3A', bgColor: '#FFE5EA', label: 'Admin', shadow: 'rgba(196, 30, 58, 0.4)' },
      doctor: { color: '#0077B6', bgColor: '#E0F4FF', label: 'Doctor', shadow: 'rgba(0, 119, 182, 0.4)' },
      nurse: { color: '#9B4DCA', bgColor: '#F5EBFF', label: 'Nurse', shadow: 'rgba(155, 77, 202, 0.4)' },
      receptionist: { color: '#FF8C00', bgColor: '#FFF4E6', label: 'Receptionist', shadow: 'rgba(255, 140, 0, 0.4)' },
      pharmacist: { color: '#2D8659', bgColor: '#E7F5EF', label: 'Pharmacist', shadow: 'rgba(45, 134, 89, 0.4)' },
      patient: { color: '#0891B2', bgColor: '#E0F7FA', label: 'Patient', shadow: 'rgba(8, 145, 178, 0.4)' }
    };
    return roleMap[role?.toLowerCase()] || { color: '#546E7A', bgColor: '#ECEFF1', label: role, shadow: 'rgba(84, 110, 122, 0.4)' };
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    if (user.name) {
      const names = user.name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleMenuClose = () => {
    setExcellenceAnchor(null);
    setServicesAnchor(null);
    setMediaAnchor(null);
    setProfileAnchor(null);
    setMobileMenuAnchor(null);
  };

  const handleExcellenceMenu = (event) => setExcellenceAnchor(event.currentTarget);
  const handleServicesMenu = (event) => setServicesAnchor(event.currentTarget);
  const handleMediaMenu = (event) => setMediaAnchor(event.currentTarget);
  const handleProfileMenu = (event) => setProfileAnchor(event.currentTarget);
  const handleMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);

  const menuItems = [
    {
      label: "About Us",
      path: "/about",
      hasDropdown: false
    },
    {
      label: "Centre of Excellence",
      path: "/excellence",
      hasDropdown: true,
      dropdownItems: [
        { label: "Cardiology", path: "/excellence/cardiology" },
        { label: "Neurology", path: "/excellence/neurology" },
        { label: "Oncology", path: "/excellence/oncology" },
        { label: "Orthopedics", path: "/excellence/orthopedics" }
      ]
    },
    {
      label: "Services/Clinics",
      path: "/services",
      hasDropdown: true,
      dropdownItems: [
        { label: "Emergency Care", path: "/services/emergency" },
        { label: "Surgery", path: "/services/surgery" },
        { label: "Diagnostics", path: "/services/diagnostics" },
        { label: "Therapy", path: "/services/therapy" }
      ]
    },
    {
      label: "International Patients",
      path: "/international",
      hasDropdown: false
    },
    {
      label: "News & Media",
      path: "/media",
      hasDropdown: true,
      dropdownItems: [
        { label: "Latest News", path: "/media/news" },
        { label: "Press Releases", path: "/media/press" },
        { label: "Health Articles", path: "/media/articles" }
      ]
    },
    {
      label: "Contact Us",
      path: "/contact",
      hasDropdown: false
    }
  ];

  const staffMenuItems = [
    { label: "Appointments", path: "/appointments" },
    { label: "Add Appointment", path: "/appointments/add" },
    { label: "Staff Portal", path: "/staff" }
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(135deg, #0b410fff 0%, #0d3b10ff 50%, #18381aff 100%)',
        boxShadow: '0 3px 15px rgba(27, 94, 32, 0.32)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1.5px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <Container maxWidth="xl">
        {/* Main Toolbar */}
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 0.8, minHeight: '60px !important' }}>
          {/* Logo and Brand */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                opacity: 0.9,
              }
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                bgcolor: "#FFFFFF",
                borderRadius: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 5px 14px rgba(0, 0, 0, 0.18)',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F5E9 100%)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.04)',
                  boxShadow: '0 7px 20px rgba(27, 94, 32, 0.38)',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                }
              }}
            >
              <LocalHospital sx={{ fontSize: 29, color: "#1B5E20", fontWeight: 700 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "#FFFFFF", 
                  fontWeight: 800,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  letterSpacing: '0.7px',
                  lineHeight: 1.15,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                OSETHRA HOSPITAL
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: "#A5D6A7", 
                  fontSize: { xs: '0.68rem', md: '0.74rem' },
                  fontWeight: 500,
                  letterSpacing: '0.45px',
                  display: 'block',
                  mt: 0.25,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                Excellence in Healthcare
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: 'nowrap', flex: 1, justifyContent: 'flex-end' }}>
              {/* Main Navigation */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                {/* About Us */}
                <Button
                  onClick={() => handleNavigation("/about")}
                  sx={{ 
                    color: "#FFFFFF",
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.7,
                    position: 'relative',
                    borderRadius: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: '#A5D6A7',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 2px 6px rgba(165, 214, 167, 0.5)',
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  About Us
                </Button>

                {/* Centre of Excellence */}
                <Button
                  endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                  onClick={handleExcellenceMenu}
                  sx={{ 
                    color: "#FFFFFF",
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.3,
                    py: 0.7,
                    position: 'relative',
                    borderRadius: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: '#A5D6A7',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 2px 6px rgba(165, 214, 167, 0.5)',
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Centre of Excellence
                </Button>

                {/* Services/Clinics */}
                <Button
                  endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                  onClick={handleServicesMenu}
                  sx={{ 
                    color: "#FFFFFF",
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.3,
                    py: 0.7,
                    position: 'relative',
                    borderRadius: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: '#A5D6A7',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 2px 6px rgba(165, 214, 167, 0.5)',
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Services/Clinics
                </Button>

                {/* International Patients */}
                <Button
                  onClick={() => handleNavigation("/international")}
                  sx={{ 
                    color: "#FFFFFF",
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.3,
                    py: 0.7,
                    position: 'relative',
                    borderRadius: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: '#A5D6A7',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 2px 6px rgba(165, 214, 167, 0.5)',
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  International Patients
                </Button>

                {/* News & Media */}
                <Button
                  endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                  onClick={handleMediaMenu}
                  sx={{ 
                    color: "#FFFFFF",
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.3,
                    py: 0.7,
                    position: 'relative',
                    borderRadius: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: '#A5D6A7',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 2px 6px rgba(165, 214, 167, 0.5)',
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  News & Media
                </Button>

                {/* Contact Us */}
                <Button
                  onClick={() => handleNavigation("/contact")}
                  sx={{ 
                    color: "#FFFFFF",
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.3,
                    py: 0.7,
                    position: 'relative',
                    borderRadius: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: '#A5D6A7',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 2px 6px rgba(165, 214, 167, 0.5)',
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Contact Us
                </Button>
              </Box>

              {/* Right Side - User Section or Login */}
              {user ? (
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  ml: 1.2,
                  pl: 1.2,
                  borderLeft: '1.5px solid rgba(255,255,255,0.25)',
                  flexShrink: 0
                }}>
                  {/* Role Badge */}
                  <Chip
                    label={getRoleInfo(user.role).label}
                    size="small"
                    sx={{
                      backgroundColor: getRoleInfo(user.role).color,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      height: 24,
                      px: 1,
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      boxShadow: `0 2px 8px ${getRoleInfo(user.role).shadow}`,
                      border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />

                  {/* User Info and Avatar */}
                  <Tooltip title="View Profile" arrow>
                    <Box
                      onClick={handleProfileMenu}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.35)',
                        }
                      }}
                    >
                      <Box sx={{ textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#FFFFFF', 
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            lineHeight: 1.2,
                            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                          }}
                        >
                          {user.name || user.email?.split('@')[0] || 'User'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#A5D6A7',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          {user.email || ''}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: getRoleInfo(user.role).color,
                          background: `linear-gradient(135deg, ${getRoleInfo(user.role).color} 0%, ${getRoleInfo(user.role).bgColor} 100%)`,
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          border: '2px solid rgba(255,255,255,0.5)',
                          boxShadow: `0 3px 10px ${getRoleInfo(user.role).shadow}`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.08)',
                            boxShadow: `0 4px 12px ${getRoleInfo(user.role).shadow}`,
                          }
                        }}
                      >
                        {getUserInitials()}
                      </Avatar>
                    </Box>
                  </Tooltip>
                </Box>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  variant="contained"
                  startIcon={<Person sx={{ fontSize: '1rem' }} />}
                  sx={{
                    ml: 1.2,
                    backgroundColor: '#FFFFFF',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F5E9 100%)',
                    color: '#1B5E20',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    px: 2,
                    py: 0.6,
                    flexShrink: 0,
                    borderRadius: '20px',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 3px 10px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    letterSpacing: '0.4px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 14px rgba(255, 255, 255, 0.4)',
                      border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          ) : (
            /* Mobile Navigation */
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              {user && (
                <Chip
                  label={getRoleInfo(user.role).label}
                  size="small"
                  sx={{
                    backgroundColor: getRoleInfo(user.role).bgColor,
                    color: getRoleInfo(user.role).color,
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                    mr: 0.5
                  }}
                />
              )}
              <IconButton
                onClick={handleMobileMenu}
                sx={{ 
                  color: "white",
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '6px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: '1.3rem' }} />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Dropdown Menus */}
      {/* Centre of Excellence Dropdown */}
      <Menu
        anchorEl={excellenceAnchor}
        open={Boolean(excellenceAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 0,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={() => handleNavigation("/excellence/cardiology")}>
          Cardiology
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/excellence/neurology")}>
          Neurology
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/excellence/oncology")}>
          Oncology
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/excellence/orthopedics")}>
          Orthopedics
        </MenuItem>
      </Menu>

      {/* Services/Clinics Dropdown */}
      <Menu
        anchorEl={servicesAnchor}
        open={Boolean(servicesAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 0,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={() => handleNavigation("/services/emergency")}>
          Emergency Care
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/services/surgery")}>
          Surgery
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/services/diagnostics")}>
          Diagnostics
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/services/therapy")}>
          Therapy
        </MenuItem>
      </Menu>

      {/* News & Media Dropdown */}
      <Menu
        anchorEl={mediaAnchor}
        open={Boolean(mediaAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 0,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={() => handleNavigation("/media/news")}>
          Latest News
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/media/press")}>
          Press Releases
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/media/articles")}>
          Health Articles
        </MenuItem>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 260,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'visible',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ 
          px: 2, 
          py: 2, 
          background: `linear-gradient(135deg, ${getRoleInfo(user?.role).color} 0%, ${getRoleInfo(user?.role).bgColor} 100%)`,
          borderBottom: '1px solid rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: getRoleInfo(user?.role).color,
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {user?.email || ''}
              </Typography>
              <Chip
                label={getRoleInfo(user?.role).label}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'white',
                  color: getRoleInfo(user?.role).color,
                  border: `1px solid ${getRoleInfo(user?.role).color}`
                }}
              />
            </Box>
          </Box>
        </Box>

        <MenuItem 
          onClick={() => handleNavigation("/dashboard")}
          sx={{ 
            py: 1.5, 
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <Dashboard sx={{ mr: 2, fontSize: 22, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Dashboard</Typography>
        </MenuItem>

        <MenuItem 
          onClick={() => handleNavigation("/profile")}
          sx={{ 
            py: 1.5, 
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <Person sx={{ mr: 2, fontSize: 22, color: 'info.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>My Profile</Typography>
        </MenuItem>

        <MenuItem 
          onClick={() => handleNavigation("/settings")}
          sx={{ 
            py: 1.5, 
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <Settings sx={{ mr: 2, fontSize: 22, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>Settings</Typography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            py: 1.5, 
            px: 2,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.lighter',
            }
          }}
        >
          <ExitToApp sx={{ mr: 2, fontSize: 22 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            minWidth: 280,
            maxHeight: '80vh',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        {/* Mobile User Info (if logged in) */}
        {user && (
          <>
            <Box sx={{ 
              px: 2, 
              py: 2, 
              background: `linear-gradient(135deg, ${getRoleInfo(user.role).color} 0%, ${getRoleInfo(user.role).bgColor} 100%)`,
              borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 45,
                    height: 45,
                    bgcolor: getRoleInfo(user.role).color,
                    color: 'white',
                    fontWeight: 700,
                    border: '3px solid white'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </Typography>
                  <Chip
                    label={getRoleInfo(user.role).label}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: 'white',
                      color: getRoleInfo(user.role).color
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {menuItems.map((item) => (
          <MenuItem 
            key={item.path} 
            onClick={() => handleNavigation(item.path)}
            sx={{ py: 1.5, px: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          </MenuItem>
        ))}

        {user && [
            <Divider key="divider" sx={{ my: 1 }} />,
            <MenuItem 
              key="dashboard"
              onClick={() => handleNavigation("/dashboard")}
              sx={{ py: 1.5, px: 2 }}
            >
              <Dashboard sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Dashboard</Typography>
            </MenuItem>,
            <MenuItem 
              key="profile"
              onClick={() => handleNavigation("/profile")}
              sx={{ py: 1.5, px: 2 }}
            >
              <Person sx={{ mr: 2, fontSize: 20, color: 'info.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>My Profile</Typography>
            </MenuItem>,
            <Divider key="divider-2" />,
            <MenuItem 
              key="logout"
              onClick={handleLogout}
              sx={{ py: 1.5, px: 2, color: 'error.main' }}
            >
              <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Logout</Typography>
            </MenuItem>
        ]}

        {!user && (
          <>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => handleNavigation("/login")} sx={{ py: 1.5, px: 2 }}>
              <Person sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Login</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default NavBar;