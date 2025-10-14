import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

const ProductCard = ({ product, onEdit, onDelete, onAddInventory, onViewInventory, viewMode = 'grid' }) => {
  // Determine if prescription is required
  const requiresPrescription = product.prescription === true || product.prescription === 'yes';
  
  if (viewMode === 'list') {
    return (
      <Card
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                width: 56,
                height: 56,
              }}
            >
              {product.name.charAt(0)}
            </Avatar>

            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h6" fontWeight="600">
                  {product.name}
                </Typography>
                <Chip
                  icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                  label={product.category}
                  size="small"
                  sx={{
                    bgcolor: '#f5f5f5',
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
                {requiresPrescription && (
                  <Chip
                    label="Prescription Required"
                    size="small"
                    color="warning"
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                )}
                <Chip
                  label={product.status || 'Active'}
                  size="small"
                  color={product.status === 'active' ? 'success' : 'default'}
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                SKU: {product.sku || 'N/A'}
                {product.manufacturer && ` • Manufacturer: ${product.manufacturer}`}
                {product.unit && ` • Unit: ${product.unit}`}
              </Typography>
            </Box>

            <Box display="flex" gap={0.5}>
              {onAddInventory && (
                <Tooltip title="Add Inventory">
                  <IconButton size="small" onClick={() => onAddInventory(product)} color="success">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onViewInventory && (
                <Tooltip title="View Inventory">
                  <IconButton size="small" onClick={() => onViewInventory(product)} color="info">
                    <InventoryIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onEdit && (
                <Tooltip title="Edit Product">
                  <IconButton size="small" onClick={() => onEdit(product)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Delete Product">
                  <IconButton size="small" onClick={() => onDelete(product)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Avatar
            sx={{
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              width: 48,
              height: 48,
            }}
          >
            {product.name.charAt(0)}
          </Avatar>
          <Chip
            label={product.status || 'Active'}
            size="small"
            color={product.status === 'active' ? 'success' : 'default'}
            sx={{ fontSize: '0.7rem', height: 22 }}
          />
        </Box>

        <Typography
          variant="h6"
          fontWeight="600"
          gutterBottom
          sx={{
            minHeight: '64px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4
          }}
        >
          {product.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
          SKU: {product.sku || 'N/A'}
        </Typography>

        <Box display="flex" gap={1} mb={1.5} flexWrap="wrap" sx={{ minHeight: '32px' }}>
          <Chip
            icon={<CategoryIcon sx={{ fontSize: 16 }} />}
            label={product.category}
            size="small"
            sx={{
              bgcolor: '#f5f5f5',
              fontSize: '0.75rem',
              height: 24
            }}
          />
          {requiresPrescription && (
            <Chip
              label="Rx"
              size="small"
              color="warning"
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }}
            />
          )}
        </Box>

        <Box sx={{ mb: 1.5 }}>
          {product.manufacturer && (
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>Manufacturer:</strong> {product.manufacturer}
            </Typography>
          )}
          {product.unit && (
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>Unit:</strong> {product.unit}
            </Typography>
          )}
          {product.barcode && (
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>Barcode:</strong> {product.barcode}
            </Typography>
          )}
        </Box>

        <Box flex={1} />

        {product.description && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '32px'
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={0.5} mt={2} justifyContent="center" borderTop="1px solid #e0e0e0" pt={1.5}>
          {onAddInventory && (
            <Tooltip title="Add Inventory">
              <IconButton size="small" onClick={() => onAddInventory(product)} color="success">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onViewInventory && (
            <Tooltip title="View Inventory">
              <IconButton size="small" onClick={() => onViewInventory(product)} color="info">
                <InventoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit Product">
              <IconButton size="small" onClick={() => onEdit(product)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete Product">
              <IconButton size="small" onClick={() => onDelete(product)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
