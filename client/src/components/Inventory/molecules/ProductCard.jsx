import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import StockBadge from '../atoms/StockBadge';
import CategoryChip from '../atoms/CategoryChip';
import ExpiryDateBadge from '../atoms/ExpiryDateBadge';

const ProductCard = ({ product, onEdit, onDelete, onIssue }) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardContent>
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
          <Box display="flex" gap={0.5}>
            {onEdit && (
              <IconButton size="small" onClick={() => onEdit(product)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onIssue && (
              <IconButton size="small" onClick={() => onIssue(product)} color="success">
                <CartIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton size="small" onClick={() => onDelete(product)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
          SKU: {product.sku || 'N/A'}
        </Typography>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <CategoryChip category={product.category} />
          <StockBadge quantity={product.stock} minStock={product.minStock} size="small" />
        </Box>

        {product.expiryDate && (
          <Box mb={2}>
            <ExpiryDateBadge expiryDate={product.expiryDate} />
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Stock
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {product.stock} / {product.minStock}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">
              Unit Price
            </Typography>
            <Typography variant="body1" fontWeight="600" color="primary">
              LKR {product.unitPrice?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
        </Box>

        {product.batchNumber && (
          <Box mt={1}>
            <Chip 
              label={`Batch: ${product.batchNumber}`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
