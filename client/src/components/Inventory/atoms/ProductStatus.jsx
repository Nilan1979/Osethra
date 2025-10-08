import React from 'react';
import { Chip } from '@mui/material';

const ProductStatus = ({ status, size = 'small' }) => {
  const statusConfig = {
    'active': { label: 'Active', color: 'success' },
    'inactive': { label: 'Inactive', color: 'default' },
    'discontinued': { label: 'Discontinued', color: 'error' },
    'reserved': { label: 'Reserved', color: 'info' },
  };

  const config = statusConfig[status] || statusConfig['inactive'];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

export default ProductStatus;
