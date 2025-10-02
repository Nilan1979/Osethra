import React from 'react';
import { Chip } from '@mui/material';
import { 
  CheckCircle as CheckIcon, 
  Warning as WarningIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';

const StockBadge = ({ quantity, minStock, size = 'medium' }) => {
  const percentage = (quantity / minStock) * 100;
  
  let color, icon, label;
  
  if (quantity === 0) {
    color = 'error';
    icon = <ErrorIcon fontSize="small" />;
    label = 'Out of Stock';
  } else if (percentage < 50) {
    color = 'error';
    icon = <ErrorIcon fontSize="small" />;
    label = 'Critical';
  } else if (percentage < 100) {
    color = 'warning';
    icon = <WarningIcon fontSize="small" />;
    label = 'Low Stock';
  } else {
    color = 'success';
    icon = <CheckIcon fontSize="small" />;
    label = 'In Stock';
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
};

export default StockBadge;
