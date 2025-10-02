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

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [categories, setCategories] = useState([
    'Medications',
    'Medical Supplies',
    'PPE',
    'Surgical Instruments',
    'Laboratory Supplies',
    'First Aid',
    'Diagnostic Equipment',
    'Disposables',
  ]);

  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    manufacturer: '',
    supplier: '',
    // Pricing
    buyingPrice: '',
    sellingPrice: '',
    profitMargin: '',
    // Stock
    currentStock: '',
    minStock: '',
    maxStock: '',
    reorderPoint: '',
    unit: 'pieces',
    // Product Details
    batchNumber: '',
    manufactureDate: '',
    expiryDate: '',
    storageLocation: '',
    barcode: '',
    // Additional Info
    prescription: 'no',
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

  // Mock function to fetch product data
  const fetchProductData = async (productId) => {
    // TODO: Replace with actual API call
    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProduct = {
          id: productId,
          name: 'Paracetamol 500mg',
          sku: 'MED-PAR-500',
          category: 'Medications',
          description: 'Pain relief and fever reduction medication',
          manufacturer: 'Ceylon Pharmaceuticals',
          supplier: 'MedSupply Lanka',
          buyingPrice: '12.50',
          sellingPrice: '15.00',
          profitMargin: '20.00',
          currentStock: '450',
          minStock: '100',
          maxStock: '1000',
          reorderPoint: '150',
          unit: 'tablets',
          batchNumber: 'PAR2024-089',
          manufactureDate: '2024-01-15',
          expiryDate: '2026-03-15',
          storageLocation: 'Shelf A, Row 3',
          barcode: '8901234567890',
          prescription: 'no',
          status: 'active',
          notes: 'Store in cool, dry place',
        };
        resolve(mockProduct);
      }, 1000);
    });
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await fetchProductData(id);
        setFormData(product);
        setOriginalData(product);
      } catch {
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

    // Auto-calculate profit margin when prices change
    if (name === 'buyingPrice' || name === 'sellingPrice') {
      const buying = name === 'buyingPrice' ? parseFloat(value) : parseFloat(formData.buyingPrice);
      const selling = name === 'sellingPrice' ? parseFloat(value) : parseFloat(formData.sellingPrice);
      
      if (buying && selling && buying > 0) {
        const margin = ((selling - buying) / buying * 100).toFixed(2);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          profitMargin: margin
        }));
      }
    }

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
    if (!formData.buyingPrice) newErrors.buyingPrice = 'Buying price is required';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
    if (!formData.currentStock) newErrors.currentStock = 'Current stock is required';
    if (!formData.minStock) newErrors.minStock = 'Minimum stock is required';

    // Price validation
    if (formData.buyingPrice && parseFloat(formData.buyingPrice) <= 0) {
      newErrors.buyingPrice = 'Buying price must be greater than 0';
    }
    if (formData.sellingPrice && parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }
    if (formData.buyingPrice && formData.sellingPrice) {
      if (parseFloat(formData.sellingPrice) < parseFloat(formData.buyingPrice)) {
        newErrors.sellingPrice = 'Selling price should be greater than buying price';
      }
    }

    // Stock validation
    if (formData.currentStock && parseFloat(formData.currentStock) < 0) {
      newErrors.currentStock = 'Stock cannot be negative';
    }
    if (formData.minStock && parseFloat(formData.minStock) < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative';
    }

    // Date validation
    if (formData.manufactureDate && formData.expiryDate) {
      if (new Date(formData.expiryDate) <= new Date(formData.manufactureDate)) {
        newErrors.expiryDate = 'Expiry date must be after manufacture date';
      }
    }

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

    try {
      // TODO: Replace with actual API call
      console.log('Updating product:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSnackbarMessage('Product updated successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Navigate back to products page after 1.5 seconds
      setTimeout(() => {
        navigate('/pharmacist/products');
      }, 1500);
    } catch {
      setSnackbarMessage('Error updating product. Please try again.');
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

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
      setCategoryDialogOpen(false);
      setSnackbarMessage('Category added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    setCategories(categories.filter(cat => cat !== categoryToDelete));
    if (formData.category === categoryToDelete) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
    setSnackbarMessage('Category deleted successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
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
                    <Grid item xs={12} md={6}>
                      <Box display="flex" gap={1}>
                        <TextField
                          fullWidth
                          required
                          select
                          label="Category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          error={!!errors.category}
                          helperText={errors.category}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </TextField>
                        <IconButton
                          color="primary"
                          onClick={() => setCategoryDialogOpen(true)}
                          sx={{ border: '1px solid #e0e0e0' }}
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

            {/* Pricing Information */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Pricing Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Buying Price (LKR)"
                        name="buyingPrice"
                        value={formData.buyingPrice}
                        onChange={handleInputChange}
                        error={!!errors.buyingPrice}
                        helperText={errors.buyingPrice || 'Cost price per unit'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Selling Price (LKR)"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        error={!!errors.sellingPrice}
                        helperText={errors.sellingPrice || 'Retail price per unit'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        disabled
                        label="Profit Margin (%)"
                        name="profitMargin"
                        value={formData.profitMargin}
                        helperText="Auto-calculated"
                        InputProps={{
                          endAdornment: formData.profitMargin && (
                            <Chip
                              label={`${formData.profitMargin}%`}
                              size="small"
                              color={parseFloat(formData.profitMargin) > 0 ? 'success' : 'error'}
                            />
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Stock Information */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Stock Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Current Stock"
                        name="currentStock"
                        value={formData.currentStock}
                        onChange={handleInputChange}
                        error={!!errors.currentStock}
                        helperText={errors.currentStock}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Minimum Stock"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleInputChange}
                        error={!!errors.minStock}
                        helperText={errors.minStock || 'Alert threshold'}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Maximum Stock"
                        name="maxStock"
                        value={formData.maxStock}
                        onChange={handleInputChange}
                        helperText="Optional"
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Storage Location"
                        name="storageLocation"
                        value={formData.storageLocation}
                        onChange={handleInputChange}
                        placeholder="e.g., Shelf A, Row 3"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Reorder Point"
                        name="reorderPoint"
                        value={formData.reorderPoint}
                        onChange={handleInputChange}
                        helperText="Trigger reorder when stock reaches this level"
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
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
                        label="Supplier"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        placeholder="Supplier name"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Batch Number"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., BATCH2025-001"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Manufacture Date"
                        name="manufactureDate"
                        value={formData.manufactureDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Expiry Date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        error={!!errors.expiryDate}
                        helperText={errors.expiryDate}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Prescription Required"
                        name="prescription"
                        value={formData.prescription}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
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
