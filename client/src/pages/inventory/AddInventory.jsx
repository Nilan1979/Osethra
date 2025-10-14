import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Autocomplete,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory2 as InventoryIcon,
  AddBox as AddBoxIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { productsAPI, inventoryItemsAPI } from '../../api/inventory';

const AddInventory = () => {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    product: '',
    batchNumber: '',
    manufactureDate: '',
    expiryDate: '',
    quantity: '',
    buyingPrice: '',
    sellingPrice: '',
    minStock: '10',
    reorderPoint: '20',
    storageLocation: '',
    supplierName: '',
    purchaseDate: '',
    receiptNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productsAPI.getProducts();
      if (response.success && response.data) {
        // Extract products array from response (it's nested in data.products)
        const productsList = response.data.products || [];
        // Filter only active products
        const activeProducts = productsList.filter(p => p.status === 'active');
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to load products', 'error');
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductSelect = (product) => {
    if (!product) {
      setSelectedProduct(null);
      setFormData(prev => ({
        ...prev,
        product: '',
        buyingPrice: '',
        sellingPrice: '',
        storageLocation: '',
      }));
      return;
    }

    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      product: product._id,
      // Pre-fill with product defaults if available
      buyingPrice: product.defaultBuyingPrice || '',
      sellingPrice: product.defaultSellingPrice || '',
      storageLocation: product.defaultStorageLocation || '',
    }));
  };

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
    if (!formData.product) newErrors.product = 'Product is required';
    if (!formData.batchNumber.trim()) newErrors.batchNumber = 'Batch number is required';
    if (!formData.manufactureDate) newErrors.manufactureDate = 'Manufacture date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.buyingPrice) newErrors.buyingPrice = 'Buying price is required';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';

    // Quantity validation
    if (formData.quantity && parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    // Price validation
    if (formData.buyingPrice && parseFloat(formData.buyingPrice) <= 0) {
      newErrors.buyingPrice = 'Buying price must be greater than 0';
    }
    if (formData.sellingPrice && parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }
    if (formData.buyingPrice && formData.sellingPrice) {
      if (parseFloat(formData.sellingPrice) < parseFloat(formData.buyingPrice)) {
        newErrors.sellingPrice = 'Selling price should be greater than or equal to buying price';
      }
    }

    // Date validation
    if (formData.manufactureDate && formData.expiryDate) {
      const mfgDate = new Date(formData.manufactureDate);
      const expDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expDate <= mfgDate) {
        newErrors.expiryDate = 'Expiry date must be after manufacture date';
      }

      if (expDate <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar('Please fix all errors before submitting', 'error');
      return;
    }

    try {
      setLoading(true);

      // Prepare inventory data
      const inventoryData = {
        product: formData.product,
        batchNumber: formData.batchNumber.trim().toUpperCase(),
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        reorderPoint: parseInt(formData.reorderPoint),
        buyingPrice: parseFloat(formData.buyingPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        storageLocation: formData.storageLocation.trim() || undefined,
        supplierName: formData.supplierName.trim() || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        receiptNumber: formData.receiptNumber.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      const response = await inventoryItemsAPI.addInventoryItem(inventoryData);

      if (response.success) {
        // Check for low stock alert
        if (response.alert) {
          showSnackbar(`${response.message} - Warning: ${response.alert.message}`, 'warning');
        } else {
          showSnackbar('Inventory added successfully!', 'success');
        }

        // Reset form
        setFormData({
          product: '',
          batchNumber: '',
          manufactureDate: '',
          expiryDate: '',
          quantity: '',
          buyingPrice: '',
          sellingPrice: '',
          minStock: '10',
          reorderPoint: '20',
          storageLocation: '',
          supplierName: '',
          purchaseDate: '',
          receiptNumber: '',
          notes: '',
        });
        setSelectedProduct(null);

        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/pharmacist/products');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding inventory:', error);
      const errorMessage = error.response?.data?.message || 'Error adding inventory. Please try again.';
      
      // Handle duplicate batch error
      if (errorMessage.includes('already exists')) {
        showSnackbar('This batch already exists for this product. Use stock adjustment to modify existing batches.', 'warning');
      } else {
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      product: '',
      batchNumber: '',
      manufactureDate: '',
      expiryDate: '',
      quantity: '',
      buyingPrice: '',
      sellingPrice: '',
      storageLocation: '',
      supplierName: '',
      purchaseDate: '',
      receiptNumber: '',
      notes: '',
    });
    setSelectedProduct(null);
    setErrors({});
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const calculateProfitMargin = () => {
    if (formData.buyingPrice && formData.sellingPrice) {
      const buying = parseFloat(formData.buyingPrice);
      const selling = parseFloat(formData.sellingPrice);
      if (buying > 0) {
        return ((selling - buying) / buying * 100).toFixed(2);
      }
    }
    return null;
  };

  const profitMargin = calculateProfitMargin();

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
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <InventoryIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Add Inventory
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Add stock to a product with batch-specific details
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Each unique combination of batch number, expiry date, and manufacture date 
            creates a separate inventory record. This allows precise tracking of different batches.
          </Typography>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Product Selection */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Select Product
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Autocomplete
                    fullWidth
                    options={products}
                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                    value={selectedProduct}
                    onChange={(event, newValue) => handleProductSelect(newValue)}
                    loading={productsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Product"
                        error={!!errors.product}
                        helperText={errors.product || 'Search by product name or SKU'}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {option.sku} | Category: {option.category}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                  
                  {selectedProduct && (
                    <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">Category</Typography>
                          <Typography variant="body2">{selectedProduct.category}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary">Unit</Typography>
                          <Typography variant="body2">{selectedProduct.unit}</Typography>
                        </Grid>
                        {selectedProduct.defaultBuyingPrice && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="caption" color="text.secondary">Default Buying Price</Typography>
                            <Typography variant="body2">LKR {selectedProduct.defaultBuyingPrice.toFixed(2)}</Typography>
                          </Grid>
                        )}
                        {selectedProduct.defaultSellingPrice && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="caption" color="text.secondary">Default Selling Price</Typography>
                            <Typography variant="body2">LKR {selectedProduct.defaultSellingPrice.toFixed(2)}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Batch Details */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Batch Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        label="Batch Number"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleInputChange}
                        error={!!errors.batchNumber}
                        helperText={errors.batchNumber || 'Unique batch identifier'}
                        placeholder="e.g., BATCH2025-001"
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        type="date"
                        label="Manufacture Date"
                        name="manufactureDate"
                        value={formData.manufactureDate}
                        onChange={handleInputChange}
                        error={!!errors.manufactureDate}
                        helperText={errors.manufactureDate}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
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
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Stock & Pricing */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Stock & Pricing
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        error={!!errors.quantity}
                        helperText={errors.quantity || `Number of ${selectedProduct?.unit || 'units'}`}
                        InputProps={{
                          inputProps: { min: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Minimum Stock Level"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleInputChange}
                        error={!!errors.minStock}
                        helperText={errors.minStock || 'Low stock alert threshold'}
                        InputProps={{
                          inputProps: { min: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Reorder Point"
                        name="reorderPoint"
                        value={formData.reorderPoint}
                        onChange={handleInputChange}
                        error={!!errors.reorderPoint}
                        helperText={errors.reorderPoint || 'When to reorder stock'}
                        InputProps={{
                          inputProps: { min: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Chip 
                        label={formData.quantity && formData.minStock ? 
                          (parseInt(formData.quantity) <= parseInt(formData.minStock) ? 'LOW STOCK' : 
                          parseInt(formData.quantity) <= parseInt(formData.reorderPoint) ? 'REORDER SOON' : 'IN STOCK') : 'N/A'}
                        color={formData.quantity && formData.minStock ? 
                          (parseInt(formData.quantity) <= parseInt(formData.minStock) ? 'error' : 
                          parseInt(formData.quantity) <= parseInt(formData.reorderPoint) ? 'warning' : 'success') : 'default'}
                        sx={{ mt: 2, fontWeight: 600 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Buying Price (LKR)"
                        name="buyingPrice"
                        value={formData.buyingPrice}
                        onChange={handleInputChange}
                        error={!!errors.buyingPrice}
                        helperText={errors.buyingPrice || 'Cost per unit'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    {profitMargin && (
                      <Grid item xs={12}>
                        <Alert severity={parseFloat(profitMargin) > 0 ? 'success' : 'warning'}>
                          Profit Margin: {profitMargin}%
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Purchase Details */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6" fontWeight="600">
                      Purchase Details (Optional)
                    </Typography>
                    <Chip label="Optional" size="small" color="info" variant="outlined" />
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Storage Location"
                        name="storageLocation"
                        value={formData.storageLocation}
                        onChange={handleInputChange}
                        placeholder="e.g., Shelf A, Row 3"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Supplier Name"
                        name="supplierName"
                        value={formData.supplierName}
                        onChange={handleInputChange}
                        placeholder="Supplier for this batch"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Purchase Date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Receipt/Invoice Number"
                        name="receiptNumber"
                        value={formData.receiptNumber}
                        onChange={handleInputChange}
                        placeholder="Purchase receipt number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional notes"
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
                  startIcon={<CancelIcon />}
                  onClick={handleReset}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pharmacist/products')}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <AddBoxIcon />}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Adding...' : 'Add Inventory'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
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

export default AddInventory;
