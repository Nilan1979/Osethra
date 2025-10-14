import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { inventoryItemsAPI } from '../../api/inventory';

const EditInventory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [formData, setFormData] = useState({
    buyingPrice: '',
    sellingPrice: '',
    minStock: '',
    reorderPoint: '',
    storageLocation: '',
    supplierName: '',
    notes: '',
  });

  const [inventoryItem, setInventoryItem] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        setLoading(true);
        console.log('Fetching inventory item with ID:', id);
        const response = await inventoryItemsAPI.getInventoryItem(id);
        
        console.log('Full API Response:', response);
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);
        
        if (response.success) {
          const item = response.data;
          console.log('Inventory Item:', item);
          console.log('Product Info:', item.product);
          
          setInventoryItem(item);
          setProductInfo(item.product);

          // Populate form with existing data
          setFormData({
            buyingPrice: item.buyingPrice || '',
            sellingPrice: item.sellingPrice || '',
            minStock: item.minStock || '',
            reorderPoint: item.reorderPoint || '',
            storageLocation: item.storageLocation || '',
            supplierName: item.supplierName || '',
            notes: item.notes || '',
          });
        } else {
          console.error('API returned success=false:', response);
          const errorMsg = response.message || 'Failed to load inventory item';
          showSnackbar(errorMsg, 'error');
          // Don't redirect immediately, show error for 3 seconds
          setTimeout(() => navigate('/pharmacist/inventory'), 3000);
        }
      } catch (error) {
        console.error('Error fetching inventory item:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        const errorMsg = error.response?.data?.message || error.message || 'Error loading inventory item';
        showSnackbar(errorMsg, 'error');
        // Don't redirect immediately, show error for 3 seconds
        setTimeout(() => navigate('/pharmacist/inventory'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInventoryItem();
    } else {
      console.error('No ID provided');
      showSnackbar('No inventory item ID provided', 'error');
      setTimeout(() => navigate('/pharmacist/inventory'), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate prices
    if (formData.buyingPrice && formData.sellingPrice) {
      const buying = parseFloat(formData.buyingPrice);
      const selling = parseFloat(formData.sellingPrice);

      if (buying <= 0 || selling <= 0) {
        showSnackbar('Prices must be greater than zero', 'error');
        return;
      }

      if (selling < buying) {
        showSnackbar('Warning: Selling price is less than buying price (negative margin)', 'warning');
      }
    }

    // Validate stock thresholds
    if (formData.minStock && formData.reorderPoint) {
      const minStock = parseInt(formData.minStock);
      const reorderPoint = parseInt(formData.reorderPoint);

      if (minStock < 0 || reorderPoint < 0) {
        showSnackbar('Stock thresholds cannot be negative', 'error');
        return;
      }

      if (reorderPoint < minStock) {
        showSnackbar('Reorder point should typically be higher than minimum stock', 'warning');
      }
    }

    try {
      setSaving(true);

      // Prepare update data (convert strings to numbers where needed)
      const updateData = {
        buyingPrice: formData.buyingPrice ? parseFloat(formData.buyingPrice) : undefined,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined,
        minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
        reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : undefined,
        storageLocation: formData.storageLocation,
        supplierName: formData.supplierName,
        notes: formData.notes,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const response = await inventoryItemsAPI.updateInventoryItem(id, updateData);

      if (response.data.success) {
        showSnackbar('Inventory item updated successfully', 'success');
        setTimeout(() => {
          navigate('/pharmacist/inventory');
        }, 1500);
      } else {
        showSnackbar(response.data.message || 'Failed to update inventory item', 'error');
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      showSnackbar(error.response?.data?.message || 'Error updating inventory item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/pharmacist/inventory');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Calculate real-time status based on current quantity and thresholds
  const calculateStatus = () => {
    if (!inventoryItem) return 'in-stock';
    
    const qty = inventoryItem.quantity;
    const minStock = parseInt(formData.minStock) || inventoryItem.minStock;

    if (qty === 0) return 'out-of-stock';
    if (qty < minStock) return 'low-stock';
    return 'in-stock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock': return 'success';
      case 'low-stock': return 'warning';
      case 'out-of-stock': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/pharmacist/inventory')}
            sx={{ mb: 2 }}
          >
            Back to Inventory
          </Button>
          <Typography variant="h4" gutterBottom>
            Edit Inventory Item
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update pricing, stock thresholds, and other inventory details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Product Information (Read-only) */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {productInfo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Product Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {productInfo.name}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SKU
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {productInfo.sku}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {productInfo.category}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Unit
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {productInfo.unit}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Batch Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {inventoryItem && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Batch Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {inventoryItem.batchNumber}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Quantity
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                    {inventoryItem.quantity} {productInfo?.unit}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Manufacture Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(inventoryItem.manufactureDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Expiry Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(inventoryItem.expiryDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Status
                  </Typography>
                  <Chip 
                    label={calculateStatus().replace('-', ' ').toUpperCase()} 
                    color={getStatusColor(calculateStatus())}
                    size="small"
                  />
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                Note: Batch number, dates, and quantity cannot be edited here. Use stock adjustment for quantity changes.
              </Alert>
            </Paper>
          </Grid>

          {/* Right Column - Editable Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                  Editable Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Pricing Section */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                  Pricing Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Buying Price"
                      name="buyingPrice"
                      type="number"
                      value={formData.buyingPrice}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Cost price per unit"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Selling Price"
                      name="sellingPrice"
                      type="number"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Retail price per unit"
                    />
                  </Grid>
                </Grid>

                {/* Profit Margin Display */}
                {formData.buyingPrice && formData.sellingPrice && (
                  <Alert 
                    severity={parseFloat(formData.sellingPrice) >= parseFloat(formData.buyingPrice) ? 'success' : 'warning'}
                    sx={{ mt: 2 }}
                  >
                    Profit Margin: {
                      ((parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)) / parseFloat(formData.buyingPrice) * 100).toFixed(2)
                    }%
                    {' '}
                    (₹{(parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)).toFixed(2)} per unit)
                  </Alert>
                )}

                {/* Stock Thresholds Section */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  Stock Thresholds
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Minimum Stock"
                      name="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: '1' }}
                      helperText="Trigger low stock alert"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Reorder Point"
                      name="reorderPoint"
                      type="number"
                      value={formData.reorderPoint}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: '1' }}
                      helperText="Trigger reorder recommendation"
                    />
                  </Grid>
                </Grid>

                {/* Storage & Supplier Section */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  Storage & Supplier
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Storage Location"
                      name="storageLocation"
                      value={formData.storageLocation}
                      onChange={handleInputChange}
                      placeholder="e.g., Shelf A-1, Refrigerator B"
                      helperText="Physical storage location"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Supplier Name"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleInputChange}
                      placeholder="e.g., PharmaCorp Ltd"
                      helperText="Supplier/vendor name"
                    />
                  </Grid>
                </Grid>

                {/* Notes Section */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Any additional information about this inventory item..."
                  helperText="Optional notes for reference"
                />

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default EditInventory;
