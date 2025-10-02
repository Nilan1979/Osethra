import React from 'react';
import { Chip } from '@mui/material';
import {
  Medication as MedicationIcon,
  MedicalServices as SuppliesIcon,
  Biotech as LabIcon,
  Masks as PPEIcon,
  Healing as SurgicalIcon,
  Category as DefaultIcon,
} from '@mui/icons-material';

const CategoryChip = ({ category, size = 'small', variant = 'filled' }) => {
  const getCategoryConfig = (cat) => {
    const categoryMap = {
      'Medications': { color: '#1976d2', icon: <MedicationIcon fontSize="small" /> },
      'Medical Supplies': { color: '#2e7d32', icon: <SuppliesIcon fontSize="small" /> },
      'Equipment': { color: '#9c27b0', icon: <SuppliesIcon fontSize="small" /> },
      'PPE': { color: '#ed6c02', icon: <PPEIcon fontSize="small" /> },
      'Laboratory': { color: '#0288d1', icon: <LabIcon fontSize="small" /> },
      'Surgical Instruments': { color: '#d32f2f', icon: <SurgicalIcon fontSize="small" /> },
    };

    return categoryMap[cat] || { color: '#757575', icon: <DefaultIcon fontSize="small" /> };
  };

  const config = getCategoryConfig(category);

  return (
    <Chip
      icon={config.icon}
      label={category}
      size={size}
      variant={variant}
      sx={{
        bgcolor: variant === 'filled' ? `${config.color}15` : 'transparent',
        color: config.color,
        borderColor: config.color,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  );
};

export default CategoryChip;
