import React from 'react';
import { 
  TextField, 
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const ProductSearchBar = ({ value, onChange, onClear, placeholder = "Search products..." }) => {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={() => {
                onChange('');
                onClear && onClear();
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'white',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          },
        },
      }}
    />
  );
};

export default ProductSearchBar;
