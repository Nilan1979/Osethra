import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
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
import ProductHistory from '../../components/Inventory/ProductHistory';
import inventoryAPI from '../../api/inventory';

const ProductsManagement = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [historyDialog, setHistoryDialog] = useState({ open: false, productId: null, productName: '' });
  const itemsPerPage = 12;

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: itemsPerPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await inventoryAPI.products.getAll(params);
      
      console.log('API Response:', response.data); // Debug log
      
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalProducts(response.data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedCategory, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product) => {
    navigate(`/pharmacist/products/edit/${product._id}`);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await inventoryAPI.products.delete(product._id);
        fetchProducts(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleIssue = (product) => {
    navigate(`/pharmacist/issues/new?productId=${product._id}`);
  };

  const handleViewHistory = (product) => {
    setHistoryDialog({
      open: true,
      productId: product._id,
      productName: product.name
    });
  };

  const handleCloseHistory = () => {
    setHistoryDialog({ open: false, productId: null, productName: '' });
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Products Grid/List */}
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Showing {products.length} of {totalProducts} products
              </Typography>
              
              {viewMode === 'grid' ? (
                <Grid 
                  container 
                  spacing={3} 
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 3
                  }}
                >
                  {products.map((product) => (
                    <Box key={product._id}>
                      <ProductCard 
                        product={{
                          ...product,
                          id: product._id,
                          stock: product.currentStock,
                          unitPrice: product.sellingPrice,
                        }}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onIssue={handleIssue}
                        onViewHistory={handleViewHistory}
                      />
                    </Box>
                  ))}
                </Grid>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id}
                      product={{
                        ...product,
                        id: product._id,
                        stock: product.currentStock,
                        unitPrice: product.sellingPrice,
                      }}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onIssue={handleIssue}
                      onViewHistory={handleViewHistory}
                      viewMode="list"
                    />
                  ))}
                </Box>
              )}

              {products.length === 0 && (
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
            {totalPages > 0 && (
              <Box mt={4}>
                <Box display="flex" justifyContent="center" alignItems="center" gap={3} mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Page {page} of {totalPages}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="center">
                  <Pagination 
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Product History Dialog */}
      <ProductHistory
        open={historyDialog.open}
        onClose={handleCloseHistory}
        productId={historyDialog.productId}
        productName={historyDialog.productName}
      />
    </Layout>
  );
};

export default ProductsManagement;
