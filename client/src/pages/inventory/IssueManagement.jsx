import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Chip,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Snackbar,
  CircularProgress,
  Autocomplete,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  Receipt as ReceiptIcon,
  LocalHospital as HospitalIcon,
  Description as DescriptionIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Layout from '../../components/Layout/Layout';
import InvoiceBill from '../../components/Inventory/molecules/InvoiceBill';
import ThermalReceipt from '../../components/Inventory/molecules/ThermalReceipt';
import inventoryAPI from '../../api/inventory';

const IssueManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef();
  const thermalRef = useRef();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [printFormat, setPrintFormat] = useState('a4'); 
  const [createdIssue, setCreatedIssue] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Issue details
  const [issueType, setIssueType] = useState('outpatient'); // eslint-disable-line no-unused-vars
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    contactNumber: '',
    id: '',
    bedNumber: '',
    wardId: ''
  });
  const [departmentInfo, setDepartmentInfo] = useState({ // eslint-disable-line no-unused-vars
    name: '',
    id: '',
  });
  const [notes, setNotes] = useState('');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle prescription data from navigation
  useEffect(() => {
    const prescriptionData = location.state?.prescriptionData;
    
    if (prescriptionData && prescriptionData.medications) {
      // Set patient info if available
      if (prescriptionData.patient) {
        setPatientInfo({
          name: prescriptionData.patient.name || '',
          contactNumber: '',
          id: prescriptionData.patient.id || '',
          bedNumber: '',
          wardId: ''
        });
      }

      // Set notes with prescription reference
      if (prescriptionData.prescription?.id) {
        setNotes(`Dispensed from prescription: ${prescriptionData.prescription.id}`);
      }

      // Load medications into cart
      const loadPrescriptionToCart = async () => {
        try {
          setLoading(true);
          const cartItems = [];

          for (const med of prescriptionData.medications) {
            // Find matching product by medication name
            const product = products.find(p => 
              p.name.toLowerCase() === med.name.toLowerCase()
            );

            if (product) {
              cartItems.push({
                _id: product._id,
                productName: product.name,
                sku: product.sku,
                quantity: parseInt(med.quantity) || 1,
                unitPrice: product.sellingPrice,
                totalPrice: product.sellingPrice * (parseInt(med.quantity) || 1),
                availableStock: product.currentStock,
                batchNumber: product.batchNumber,
                expiryDate: product.expiryDate,
              });
            } else {
              console.warn(`Product not found for medication: ${med.name}`);
            }
          }

          if (cartItems.length > 0) {
            setCart(cartItems);
            setSuccess(`Added ${cartItems.length} item(s) from prescription to cart`);
          } else {
            setError('No matching products found for prescription medications');
          }
        } catch (err) {
          console.error('Error loading prescription to cart:', err);
          setError('Failed to load prescription items');
        } finally {
          setLoading(false);
        }
      };

      // Only load if products are available
      if (products.length > 0) {
        loadPrescriptionToCart();
      }

      // Clear the location state to prevent reloading on component updates
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, products, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.products.getProducts({ 
        page: 1, 
        limit: 100,
        status: 'active' 
      });
      const productsData = response.data?.products || response.products || [];
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(product => product.currentStock > 0); // Only show in-stock items

  // Add product to cart
  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        setError(`Cannot add more. Only ${product.currentStock} units available.`);
        return;
      }
      handleUpdateQuantity(product._id, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        _id: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        totalPrice: product.sellingPrice,
        availableStock: product.currentStock,
        batchNumber: product.batchNumber,
        expiryDate: product.expiryDate,
      }]);
      setSuccess(`Added ${product.name} to cart`);
    }
    setSearchTerm(''); // Clear search
  };

  // Update quantity in cart
  const handleUpdateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i._id === productId);
    
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    
    if (newQuantity > item.availableStock) {
      setError(`Only ${item.availableStock} units available`);
      return;
    }

    setCart(cart.map(item => 
      item._id === productId 
        ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
        : item
    ));
  };

  // Remove from cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setSearchTerm('');
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return 0; // No tax for now
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Validate form
  const validateForm = () => {
    if (cart.length === 0) {
      setError('Please add at least one product to the cart');
      return false;
    }

    // Patient info is optional, no validation needed
    return true;
  };

  // Submit issue
  const handleSubmitIssue = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const issueData = {
        type: 'general', // Set a default type since we removed issue type selection
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
        notes: notes.trim(),
      };

      // Add patient info only if name or contact is provided
      if (patientInfo.name.trim() || patientInfo.contactNumber?.trim()) {
        issueData.patient = {
          name: patientInfo.name.trim() || 'N/A',
          contactNumber: patientInfo.contactNumber?.trim() || 'N/A',
        };
      }

      const response = await inventoryAPI.issues.createIssue(issueData);
      const issue = response.data?.issue || response.issue;

      setCreatedIssue({
        ...issue,
        issueType: 'general',
        patient: issueData.patient || null,
        items: cart,
      });

      setSuccess('Issue created successfully!');
      setShowInvoice(true);

      // Refresh products to update stock
      await fetchProducts();
      
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  // Print invoice
  const handlePrintA4 = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${createdIssue?.issueNumber || 'DRAFT'}`,
    onAfterPrint: () => {
      setSuccess('A4 Invoice printed successfully!');
    },
  });

  const handlePrintThermal = useReactToPrint({
    content: () => thermalRef.current,
    documentTitle: `Receipt-${createdIssue?.issueNumber || 'DRAFT'}`,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
    onAfterPrint: () => {
      setSuccess('Thermal receipt printed successfully!');
    },
  });

  // Print handlers
  const handlePrint = () => {
    if (printFormat === 'thermal') {
      handlePrintThermal();
    } else {
      handlePrintA4();
    }
  };

  // Reset form after printing
  const handleCompleteIssue = () => {
    setShowInvoice(false);
    setCreatedIssue(null);
    setCart([]);
    setPatientInfo({ name: '', contactNumber: '', id: '', bedNumber: '', wardId: '' });
    setDepartmentInfo({ name: '', id: '' });
    setNotes('');
    setIssueType('outpatient');
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
          elevation={2}
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Issue Products
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Fast, easy, and secure pharmacy POS
              </Typography>
            </Box>
            <ReceiptIcon sx={{ fontSize: 72, opacity: 0.2 }} />
          </Box>
        </Paper>

        {/* Product Search Bar - Full Width */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Autocomplete
            key={cart.length}
            freeSolo
            options={filteredProducts}
            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.sku})`}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={2}>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight="bold" color={option.currentStock < 10 ? 'error' : 'inherit'}>
                    {option.name}
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                    <Chip label={option.category} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 20 }} />
                    <Chip label={`Stock: ${option.currentStock}`} size="small" color={option.currentStock < 10 ? 'error' : 'success'} sx={{ fontSize: '0.7rem', height: 20 }} />
                    <Chip label={`LKR ${option.sellingPrice.toFixed(2)}`} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                    {option.expiryDate && (
                      <Chip label={`Exp: ${new Date(option.expiryDate).toLocaleDateString('en-GB')}`} size="small" color={new Date(option.expiryDate) < new Date() ? 'error' : 'warning'} sx={{ fontSize: '0.7rem', height: 20 }} />
                    )}
                  </Box>
                </Box>
                <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleAddToCart(option); }}>
                  <AddIcon />
                </IconButton>
              </Box>
            )}
            inputValue={searchTerm}
            onInputChange={(_, newValue) => setSearchTerm(newValue)}
            onChange={(_, value) => { if (value && typeof value === 'object') { handleAddToCart(value); } }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search products by name, SKU, or category..."
                variant="outlined"
                fullWidth
                autoFocus
                InputProps={{ ...params.InputProps, startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              />
            )}
            loading={loading}
            loadingText="Loading products..."
            noOptionsText="No products found"
          />
        </Paper>

        {/* Cart and Order Summary - Side by Side */}
        <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }} alignItems="flex-start">
          {/* Left Panel - Cart (2/3) */}
          <Box flex="2" minWidth={0}>
            <Card elevation={2} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                {/* Cart Items */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                      Cart Items
                    </Typography>
                    <Chip label={cart.length} color="primary" size="small" />
                  </Box>
                  {cart.length > 0 && (
                    <Button startIcon={<ClearAllIcon />} color="error" onClick={handleClearCart} size="small" variant="outlined">
                      Clear All
                    </Button>
                  )}
                </Box>

                <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto', borderRadius: 2, boxShadow: 1 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', py: 2 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', py: 2, minWidth: 200 }} align="center">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', py: 2 }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', py: 2 }} align="right">Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', py: 2 }} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <CartIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography color="text.secondary">Cart is empty. Search and add products above.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        cart.map((item) => (
                          <TableRow key={item._id} hover sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                            <TableCell sx={{ py: 2.5 }}>
                              <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>{item.productName}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.sku}</Typography>
                              {item.availableStock < 10 && (
                                <Box mt={0.5}>
                                  <Chip label={`Only ${item.availableStock} left!`} size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2.5 }}>
                              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} 
                                    color="primary" 
                                    sx={{ border: '1px solid #e0e0e0' }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <TextField 
                                    value={item.quantity} 
                                    onChange={(e) => { const val = parseInt(e.target.value) || 0; handleUpdateQuantity(item._id, val); }} 
                                    type="number" 
                                    size="small" 
                                    sx={{ 
                                      width: 70, 
                                      '& input': { textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', py: 1 },
                                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                    }} 
                                    inputProps={{ min: 1, max: item.availableStock }} 
                                  />
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} 
                                    color="primary" 
                                    disabled={item.quantity >= item.availableStock} 
                                    sx={{ border: '1px solid #e0e0e0' }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Max: {item.availableStock}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2.5 }}>
                              <Typography variant="body2" fontWeight="500">LKR {item.unitPrice.toFixed(2)}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2.5 }}>
                              <Typography variant="body2" fontWeight="700" color="primary">LKR {item.totalPrice.toFixed(2)}</Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2.5 }}>
                              <Tooltip title="Remove from cart">
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleRemoveFromCart(item._id)} 
                                  sx={{ '&:hover': { bgcolor: '#ffebee' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </CardContent>
            </Card>
          </Box>

          {/* Right Panel - Order Summary (1/3) */}
          <Box flex="1" minWidth={0}>
            <Box sx={{ position: 'sticky', top: 32 }}>
              <Card elevation={4} sx={{ borderRadius: 4, boxShadow: 4, bgcolor: '#f8f9fa' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">Order Summary</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">Selected Products</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {cart.map(item => (
                        <Chip key={item._id} label={`${item.productName} (${item.quantity})`} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2">Total Items: <b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b></Typography>
                    <Typography variant="body2">Subtotal: <b>LKR {calculateSubtotal().toFixed(2)}</b></Typography>
                    <Typography variant="body2">Tax (0%): <b>LKR {calculateTax().toFixed(2)}</b></Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box mb={2}>
                    <Typography variant="h4" fontWeight="bold" color="primary">LKR {calculateTotal().toFixed(2)}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Grand Total</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box mb={2}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>Patient Information (Optional)</Typography>
                    <TextField 
                      fullWidth 
                      label="Patient Name" 
                      value={patientInfo.name} 
                      onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })} 
                      sx={{ mb: 2 }} 
                      placeholder="Enter patient name (optional)"
                    />
                    <TextField 
                      fullWidth 
                      label="Patient Contact Number" 
                      value={patientInfo.contactNumber || ''} 
                      onChange={(e) => setPatientInfo({ ...patientInfo, contactNumber: e.target.value })} 
                      sx={{ mb: 2 }} 
                      placeholder="Enter contact number (optional)"
                      type="tel"
                    />
                    <TextField fullWidth label="Notes (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} sx={{ mb: 2 }} />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {/* Floating Complete Issue Button */}
                  <Box textAlign="center" mt={2}>
                    <Button variant="contained" size="large" startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />} onClick={handleSubmitIssue} disabled={cart.length === 0 || submitting} sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', boxShadow: 2, minWidth: 200 }}>
                      {submitting ? 'Processing...' : 'Complete Issue'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Invoice Dialog */}
        <Dialog
          open={showInvoice}
          onClose={() => {}}
          maxWidth={printFormat === 'thermal' ? 'xs' : 'md'}
          fullWidth
          PaperProps={{
            sx: { minHeight: printFormat === 'thermal' ? 'auto' : '80vh' }
          }}
        >
          <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            <Typography component="span" variant="h6" fontWeight="bold">
              Issue Completed Successfully!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {/* Print Format Toggle */}
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                <Typography variant="body2" fontWeight="500">
                  Print Format:
                </Typography>
                <ToggleButtonGroup
                  value={printFormat}
                  exclusive
                  onChange={(e, newFormat) => newFormat && setPrintFormat(newFormat)}
                  size="small"
                >
                  <ToggleButton value="a4">
                    <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                    A4 Invoice
                  </ToggleButton>
                  <ToggleButton value="thermal">
                    <ReceiptLongIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Thermal Receipt
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            {/* Invoice Preview */}
            <Box sx={{ maxHeight: '70vh', overflow: 'auto', bgcolor: printFormat === 'thermal' ? 'white' : '#f5f5f5', p: printFormat === 'thermal' ? 0 : 2 }}>
              {createdIssue && (
                <>
                  {printFormat === 'a4' ? (
                    <InvoiceBill ref={invoiceRef} issueData={createdIssue} />
                  ) : (
                    <Box display="flex" justifyContent="center">
                      <ThermalReceipt ref={thermalRef} issueData={createdIssue} />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              size="large"
            >
              Print {printFormat === 'thermal' ? 'Receipt' : 'Invoice'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCompleteIssue}
              size="large"
            >
              New Issue
            </Button>
            <Button
              onClick={() => navigate('/pharmacist/dashboard')}
              size="large"
            >
              Go to Dashboard
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}

export default IssueManagement;
