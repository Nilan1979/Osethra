import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  KeyboardArrowDown,
  AccountCircle,
  ExitToApp,
  LocalHospital,
  Info,
  ContactMail,
  Star,
  MedicalServices,
  Public,
  Newspaper,
  Menu as MenuIcon
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

export default function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [aboutAnchor, setAboutAnchor] = useState(null);
  const [servicesAnchor, setServicesAnchor] = useState(null);
  const [excellenceAnchor, setExcellenceAnchor] = useState(null);
  const [mediaAnchor, setMediaAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleAboutMenu = (event) => {
    setAboutAnchor(event.currentTarget);
  };

  const handleServicesMenu = (event) => {
    setServicesAnchor(event.currentTarget);
  };

  const handleExcellenceMenu = (event) => {
    setExcellenceAnchor(event.currentTarget);
  };

  const handleMediaMenu = (event) => {
    setMediaAnchor(event.currentTarget);
  };

  const handleProfileMenu = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAboutAnchor(null);
    setServicesAnchor(null);
    setExcellenceAnchor(null);
    setMediaAnchor(null);
    setProfileAnchor(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    handleMenuClose();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

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
      elevation={1}
      sx={{ 
        background: 'linear-gradient(135deg, #075e02ff 0%, #014e85ff 100%)',
        borderRadius: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        {/* Logo and Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 45,
              height: 45,
              bgcolor: "white",
              color: "#2E7D32",
              borderRadius: 1
            }}
          >
            <LocalHospital />
          </Avatar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              color: "white", 
              textDecoration: "none",
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            OSETHRA HOSPITAL
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Main Navigation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {/* About Us */}
              <Button
                onClick={() => handleNavigation("/about")}
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                About Us
              </Button>

              {/* Centre of Excellence */}
              <Button
                endIcon={<KeyboardArrowDown />}
                onClick={handleExcellenceMenu}
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Centre of Excellence
              </Button>

              {/* Services/Clinics */}
              <Button
                endIcon={<KeyboardArrowDown />}
                onClick={handleServicesMenu}
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Services/Clinics
              </Button>

              {/* International Patients */}
              <Button
                onClick={() => handleNavigation("/international")}
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                International Patients
              </Button>

              {/* News & Media */}
              <Button
                endIcon={<KeyboardArrowDown />}
                onClick={handleMediaMenu}
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                News & Media
              </Button>

              {/* Contact Us */}
              <Button
                onClick={() => handleNavigation("/contact")}
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Contact Us
              </Button>
            </Box>

            {/* Staff Menu */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
              <Button
                component={RouterLink}
                to="/appointments"
                sx={{ 
                  color: "white",
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Appointments
              </Button>
            </Box>

            {/* Profile Menu */}
            <IconButton
              onClick={handleProfileMenu}
              sx={{ 
                color: "white",
                ml: 1,
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        ) : (
          /* Mobile Navigation */
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleMobileMenu}
              sx={{ 
                color: "white",
                borderRadius: 0
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>

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
            mt: 1,
            borderRadius: 0,
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={() => handleNavigation("/profile")}>
          <AccountCircle sx={{ mr: 2, fontSize: 20 }} />
          My Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
          Logout
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
            borderRadius: 0,
            minWidth: 250
          }
        }}
      >
        {menuItems.map((item) => (
          <MenuItem 
            key={item.path} 
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </MenuItem>
        ))}
        <Divider />
        {staffMenuItems.map((item) => (
          <MenuItem 
            key={item.path} 
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}