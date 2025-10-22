import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { productsAPI, categoriesAPI } from '../../api/inventory';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [categories, setCategories] = useState([]);

  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    sku: '',
    category: '',
    description: '',
    unit: 'pieces',
    barcode: '',
    // Manufacturing Details
    manufacturer: '',
    // Prescription Requirement
    prescription: false,
    // Status
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const units = [
    'pieces',
    'boxes',
    'bottles',
    'vials',
    'strips',
    'packets',
    'tablets',
    'capsules',
    'ml',
    'liters',
    'grams',
    'kg',
  ];

  // Fetch categories from database
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoriesAPI.getCategories();
      if (response.success && response.data) {
        const categoryNames = response.data.map(cat => cat.name);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbarMessage('Failed to load categories');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch product data from database
  const fetchProductData = async (productId) => {
    try {
      const response = await productsAPI.getProduct(productId);
      if (response.success && response.data) {
        const product = response.data;

        // Transform the data to match form structure (product master data only)
        return {
          name: product.name || '',
          sku: product.sku || '',
          category: product.category || '',
          description: product.description || '',
          unit: product.unit || 'pieces',
          barcode: product.barcode || '',
          manufacturer: product.manufacturer || '',
          prescription: product.prescription || false,
          status: product.status || 'active',
          notes: product.notes || '',
        };
      }
      throw new Error('Failed to fetch product');
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Fetch categories on mount
    fetchCategories();

    // Fetch product data
    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await fetchProductData(id);
        setFormData(product);
        setOriginalData(product);
      } catch (error) {
        console.error('Error loading product:', error);
        setSnackbarMessage('Error loading product data');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbarMessage('Please fix all errors before submitting');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Prepare product data (basic information and manufacturing details only)
    const updateData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      description: formData.description,
      unit: formData.unit,
      barcode: formData.barcode || undefined, // Send undefined if empty to avoid unique constraint issues
      manufacturer: formData.manufacturer,
      prescription: formData.prescription,
      status: formData.status,
      notes: formData.notes,
    };

    console.log('Submitting update data:', updateData);

    try {
      const response = await productsAPI.updateProduct(id, updateData);

      if (response.success) {
        setSnackbarMessage('Product updated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Navigate back to products page after 1.5 seconds
        setTimeout(() => {
          navigate('/pharmacist/products');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      
      let errorMessage = error.response?.data?.message || error.message || 'Error updating product. Please try again.';
      
      // If there are validation errors, show them
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = 'Validation errors: ' + error.response.data.errors.join(', ');
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setSnackbarMessage('Form reset to original values');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    // Check if category already exists locally
    if (categories.some(cat => cat.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setSnackbarMessage('Category already exists');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await categoriesAPI.createCategory({
        name: newCategoryName.trim()
      });

      if (response.success) {
        // Refresh categories list
        await fetchCategories();
        setNewCategoryName('');
        setCategoryDialogOpen(false);
        setSnackbarMessage('Category added successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add category');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    try {
      const response = await categoriesAPI.deleteCategory(categoryToDelete);

      if (response.success) {
        // Refresh categories list
        await fetchCategories();

        // Clear category from form if it was selected
        if (formData.category === categoryToDelete) {
          setFormData(prev => ({ ...prev, category: '' }));
        }

        setSnackbarMessage('Category deleted successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete category');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <Layout showContactInfo={false}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" mt={3} color="text.secondary">
                Loading product data...
              </Typography>
            </Box>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Back Button */}
        <Box mb={2}>
          <IconButton
            onClick={() => navigate('/pharmacist/products')}
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
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Edit Product
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Update product information and inventory details
              </Typography>
            </Box>
            {hasChanges() && (
              <Chip
                label="Unsaved Changes"
                color="warning"
                sx={{ bgcolor: 'white', color: '#ed6c02', fontWeight: 600 }}
              />
            )}
          </Box>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        placeholder="e.g., Paracetamol 500mg"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="SKU / Product Code"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        error={!!errors.sku}
                        helperText={errors.sku}
                        placeholder="e.g., MED-PAR-500"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%' }}>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <TextField
                            fullWidth
                            required
                            select
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            error={!!errors.category}
                            helperText={errors.category || (loadingCategories ? 'Loading categories...' : '')}
                            disabled={loadingCategories}
                          >
                            {loadingCategories ? (
                              <MenuItem disabled>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Loading categories...
                              </MenuItem>
                            ) : categories.length === 0 ? (
                              <MenuItem disabled>No categories available</MenuItem>
                            ) : (
                              categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                  {cat}
                                </MenuItem>
                              ))
                            )}
                          </TextField>
                        </Box>
                        <IconButton
                          color="primary"
                          onClick={() => setCategoryDialogOpen(true)}
                          sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            minWidth: 56,
                            width: 56,
                            height: 56,
                            mt: 0,
                            flexShrink: 0,
                            '&:hover': {
                              bgcolor: '#f5f5f5',
                            }
                          }}
                          aria-label="Manage categories"
                        >
                          <CategoryIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        placeholder="Product barcode"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                      >
                        {units.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Details */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Product Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        placeholder="Manufacturer name"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Prescription Required"
                        name="prescription"
                        value={formData.prescription}
                        onChange={(e) => {
                          const value = e.target.value === 'true' || e.target.value === true;
                          setFormData(prev => ({ ...prev, prescription: value }));
                        }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="discontinued">Discontinued</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Additional Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional information"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  sx={{ minWidth: 120 }}
                  disabled={!hasChanges()}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pharmacist/products')}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ minWidth: 120 }}
                  disabled={!hasChanges()}
                >
                  Update Product
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Category Management Dialog */}
        <Dialog
          open={categoryDialogOpen}
          onClose={() => setCategoryDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <CategoryIcon />
              Manage Categories
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Add New Category
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Existing Categories ({categories.length})
            </Typography>
            <List>
              {categories.map((category) => (
                <ListItem
                  key={category}
                  sx={{
                    bgcolor: '#fafafa',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <ListItemText primary={category} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteCategory(category)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCategoryDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default EditProduct;
