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

const ProductCard = ({ product, onEdit, onDelete, onIssue, viewMode = 'grid' }) => {
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
                <CategoryChip category={product.category} />
                <StockBadge quantity={product.stock} minStock={product.minStock} size="small" />
                {product.expiryDate && <ExpiryDateBadge expiryDate={product.expiryDate} />}
              </Box>
              <Typography variant="body2" color="text.secondary">
                SKU: {product.sku || 'N/A'}
                {product.batchNumber && ` • Batch: ${product.batchNumber}`}
              </Typography>
            </Box>

            <Box display="flex" gap={3} alignItems="center">
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block">
                  Stock
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {product.stock} / {product.minStock}
                </Typography>
              </Box>
              
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block">
                  Unit Price
                </Typography>
                <Typography variant="h6" fontWeight="600" color="primary">
                  LKR {product.unitPrice?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Box>

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
        minHeight: '380px',
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
          <CategoryChip category={product.category} />
          <StockBadge quantity={product.stock} minStock={product.minStock} size="small" />
        </Box>

        <Box sx={{ minHeight: '40px', mb: 1.5 }}>
          {product.expiryDate && (
            <ExpiryDateBadge expiryDate={product.expiryDate} />
          )}
        </Box>

        <Box flex={1} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
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

        <Box sx={{ minHeight: '32px', mt: 1 }}>
          {product.batchNumber && (
            <Chip 
              label={`Batch: ${product.batchNumber}`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
