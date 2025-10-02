import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
  FilterList as FilterIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import ProductCard from '../../components/Inventory/molecules/ProductCard';
import ProductSearchBar from '../../components/Inventory/molecules/ProductSearchBar';
import CategorySelector from '../../components/Inventory/molecules/CategorySelector';

const ProductsManagement = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Mock data - replace with API call
  const [products] = useState([
    {
      id: 1,
      name: 'Paracetamol 500mg',
      sku: 'MED-PAR-500',
      category: 'Medications',
      stock: 450,
      minStock: 100,
      unitPrice: 15.00,
      expiryDate: '2026-03-15',
      batchNumber: 'PAR2024-089',
      status: 'active',
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      sku: 'MED-AMO-250',
      category: 'Medications',
      stock: 12,
      minStock: 50,
      unitPrice: 35.00,
      expiryDate: '2025-12-20',
      batchNumber: 'AMO2024-156',
      status: 'active',
    },
    {
      id: 3,
      name: 'Surgical Gloves (Medium)',
      sku: 'SUP-GLV-M',
      category: 'Medical Supplies',
      stock: 25,
      minStock: 200,
      unitPrice: 10.00,
      expiryDate: '2027-06-10',
      batchNumber: 'GLV2024-234',
      status: 'active',
    },
    {
      id: 4,
      name: 'Face Masks (N95)',
      sku: 'PPE-MSK-N95',
      category: 'PPE',
      stock: 150,
      minStock: 150,
      unitPrice: 75.00,
      expiryDate: '2026-01-30',
      batchNumber: 'MSK2024-345',
      status: 'active',
    },
    {
      id: 5,
      name: 'Insulin Vials',
      sku: 'MED-INS-100',
      category: 'Medications',
      stock: 80,
      minStock: 50,
      unitPrice: 750.00,
      expiryDate: '2025-10-15',
      batchNumber: 'INS2024-456',
      status: 'active',
    },
    {
      id: 6,
      name: 'Syringes 5ml',
      sku: 'SUP-SYR-5',
      category: 'Medical Supplies',
      stock: 500,
      minStock: 200,
      unitPrice: 5.00,
      expiryDate: '2028-04-20',
      batchNumber: 'SYR2024-567',
      status: 'active',
    },
  ]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleEdit = (product) => {
    navigate(`/pharmacist/products/${product.id}/edit`);
  };

  const handleDelete = (product) => {
    // Implement delete functionality
    console.log('Delete product:', product);
  };

  const handleIssue = (product) => {
    navigate(`/pharmacist/issues/new?productId=${product.id}`);
  };

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Back Button */}
        <Box mb={2}>
          <IconButton
            onClick={() => navigate('/pharmacist/dashboard')}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'translateX(-4px)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Products Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage your inventory products and stock levels
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/pharmacist/products/add')}
              sx={{ 
                bgcolor: 'white', 
                color: '#2e7d32',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              Add New Product
            </Button>
          </Box>
        </Paper>

        {/* Filters */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <ProductSearchBar 
                  value={searchTerm} 
                  onChange={setSearchTerm} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <CategorySelector 
                  value={selectedCategory} 
                  onChange={setSelectedCategory} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    size="small"
                  >
                    More Filters
                  </Button>
                  <IconButton 
                    onClick={() => setViewMode('grid')} 
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                  >
                    <GridIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => setViewMode('list')} 
                    color={viewMode === 'list' ? 'primary' : 'default'}
                  >
                    <ListIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Products Grid/List */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </Typography>
          
          <Grid container spacing={3}>
            {paginatedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard 
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onIssue={handleIssue}
                />
              </Grid>
            ))}
          </Grid>

          {filteredProducts.length === 0 && (
            <Card elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Try adjusting your search or filter criteria
              </Typography>
            </Card>
          )}
        </Box>

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination 
              count={Math.ceil(filteredProducts.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default ProductsManagement;
