import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const ExpiryDateBadge = ({ expiryDate, size = 'small' }) => {
  const getDaysUntilExpiry = (date) => {
    const today = new Date();
    const expiry = new Date(date);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry(expiryDate);
  
  let color, icon, label, tooltipText;
  
  if (daysLeft < 0) {
    color = 'error';
    icon = <ErrorIcon fontSize="small" />;
    label = 'Expired';
    tooltipText = `Expired ${Math.abs(daysLeft)} days ago`;
  } else if (daysLeft === 0) {
    color = 'error';
    icon = <ErrorIcon fontSize="small" />;
    label = 'Expires Today';
    tooltipText = 'Expires today!';
  } else if (daysLeft <= 7) {
    color = 'error';
    icon = <WarningIcon fontSize="small" />;
    label = `${daysLeft}d left`;
    tooltipText = `Expires in ${daysLeft} days`;
  } else if (daysLeft <= 30) {
    color = 'warning';
    icon = <WarningIcon fontSize="small" />;
    label = `${daysLeft}d left`;
    tooltipText = `Expires in ${daysLeft} days`;
  } else {
    color = 'default';
    icon = <CalendarIcon fontSize="small" />;
    label = new Date(expiryDate).toLocaleDateString();
    tooltipText = `Expires on ${new Date(expiryDate).toLocaleDateString()}`;
  }

  return (
    <Tooltip title={tooltipText}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size={size}
        sx={{ fontWeight: 500 }}
      />
    </Tooltip>
  );
};

export default ExpiryDateBadge;
