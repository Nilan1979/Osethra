import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showNavigation = true, 
  showContactInfo = true 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <Box component="main" sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Add this
        minHeight: '100vh' // Add this
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;