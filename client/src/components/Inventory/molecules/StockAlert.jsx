import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { 
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const StockAlert = ({ type = 'warning', product, onAction }) => {
  const alertConfig = {
    'low-stock': {
      severity: 'warning',
      icon: <WarningIcon />,
      title: 'Low Stock Alert',
      actionLabel: 'Reorder Now',
    },
    'out-of-stock': {
      severity: 'error',
      icon: <ErrorIcon />,
      title: 'Out of Stock',
      actionLabel: 'Order Immediately',
    },
    'expiry-warning': {
      severity: 'warning',
      icon: <WarningIcon />,
      title: 'Expiry Warning',
      actionLabel: 'Review Stock',
    },
    'expired': {
      severity: 'error',
      icon: <ErrorIcon />,
      title: 'Expired Product',
      actionLabel: 'Remove from Stock',
    },
  };

  const config = alertConfig[type] || alertConfig['warning'];

  return (
    <Alert 
      severity={config.severity} 
      icon={config.icon}
      sx={{ mb: 2, borderRadius: 2 }}
      action={
        onAction && (
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => onAction(product)}
            sx={{ fontWeight: 600 }}
          >
            {config.actionLabel}
          </Button>
        )
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>{config.title}</AlertTitle>
      <Box>
        <Typography variant="body2" fontWeight="600">
          {product.name}
        </Typography>
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          <Chip label={`SKU: ${product.sku}`} size="small" />
          {product.stock !== undefined && (
            <Chip label={`Stock: ${product.stock}`} size="small" />
          )}
          {product.category && (
            <Chip label={product.category} size="small" />
          )}
        </Box>
      </Box>
    </Alert>
  );
};

export default StockAlert;
