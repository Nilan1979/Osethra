import React from 'react';
import { TextField, IconButton, Box } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const QuantityInput = ({ value, onChange, min = 0, max = 999999, label = "Quantity" }) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton 
        size="small" 
        onClick={handleDecrement} 
        disabled={value <= min}
        sx={{ 
          border: '1px solid #e0e0e0',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <TextField
        label={label}
        type="number"
        value={value}
        onChange={handleChange}
        inputProps={{ min, max, style: { textAlign: 'center' } }}
        sx={{ width: 100 }}
        size="small"
      />
      <IconButton 
        size="small" 
        onClick={handleIncrement} 
        disabled={value >= max}
        sx={{ 
          border: '1px solid #e0e0e0',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default QuantityInput;
