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
      {showHeader && (
        <Header 
          showNavigation={showNavigation} 
          showContactInfo={showContactInfo} 
        />
      )}
      
      <Box component="main" sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Box>
      
      {showFooter && <Footer />}
    </Box>
  );
};

export default Layout;