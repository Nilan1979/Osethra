import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Box,
} from '@mui/material';

const CategorySelector = ({ value, onChange, label = "Category", multiple = false }) => {
  const categories = [
    'All Categories',
    'Medications',
    'Medical Supplies',
    'Equipment',
    'PPE',
    'Laboratory',
    'Surgical Instruments',
  ];

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        multiple={multiple}
        renderValue={multiple ? (selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => (
              <Chip key={val} label={val} size="small" />
            ))}
          </Box>
        ) : undefined}
        sx={{
          bgcolor: 'white',
        }}
      >
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategorySelector;
