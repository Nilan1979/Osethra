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
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Layout from '../../components/Layout/Layout';
import InvoiceBill from '../../components/Inventory/molecules/InvoiceBill';
import ThermalReceipt from '../../components/Inventory/molecules/ThermalReceipt';
import inventoryAPI from '../../api/inventory';

const IssueManagement = () => {
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const thermalRef = useRef();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [showInvoice, setShowInvoice] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' or 'thermal'
  const [createdIssue, setCreatedIssue] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(null);
  
  // Issue details
  const [issueType, setIssueType] = useState('outpatient');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    id: '',
    bedNumber: '',
    wardId: ''
  });
  const [departmentInfo, setDepartmentInfo] = useState({
    name: '',
    id: '',
  });
  const [notes, setNotes] = useState('');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

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

    if (issueType === 'outpatient' || issueType === 'inpatient' || issueType === 'emergency') {
      if (!patientInfo.name.trim()) {
        setError('Patient name is required');
        return false;
      }
      if (!patientInfo.id.trim()) {
        setError('Patient ID is required');
        return false;
      }
      if (issueType === 'inpatient' && (!patientInfo.wardId.trim() || !patientInfo.bedNumber.trim())) {
        setError('Ward ID and Bed Number are required for inpatient');
        return false;
      }
    }

    if (issueType === 'department') {
      if (!departmentInfo.name.trim() || !departmentInfo.id.trim()) {
        setError('Department name and ID are required');
        return false;
      }
    }

    return true;
  };

  // Submit issue
  const handleSubmitIssue = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const issueData = {
        type: issueType,
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
        notes: notes.trim(),
      };

      // Add patient or department info
      if (issueType === 'department') {
        issueData.department = departmentInfo;
      } else {
        issueData.patient = {
          ...patientInfo,
          type: issueType,
        };
      }

      const response = await inventoryAPI.issues.createIssue(issueData);
      const issue = response.data?.issue || response.issue;

      setCreatedIssue({
        ...issue,
        issueType,
        patient: issueData.patient,
        department: issueData.department,
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
  // eslint-disable-next-line no-unused-vars
  const handlePrint = () => {
    if (printFormat === 'thermal') {
      handlePrintThermal();
    } else {
      handlePrintA4();
    }
  };

  // Reset form after printing
  // eslint-disable-next-line no-unused-vars
  const handleCompleteIssue = () => {
    setShowInvoice(false);
    setCreatedIssue(null);
    setCart([]);
    setPatientInfo({ name: '', id: '', bedNumber: '', wardId: '' });
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

        <Grid container spacing={4} alignItems="flex-start">
          {/* Left Panel - Product Selection */}
          <Grid item xs={12} md={7}>
            <Card elevation={2} sx={{ borderRadius: 4, boxShadow: 2, p: 2 }}>
              <CardContent sx={{ p: 3 }}>
                {/* Product Search Bar */}
                <Box mb={3}>
                  <Autocomplete
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
                        sx={{ fontSize: '1.2rem', mb: 2, bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}
                      />
                    )}
                    loading={loading}
                    loadingText="Loading products..."
                    noOptionsText="No products found"
                  />
                </Box>

                {/* Quick Add Section (Top 5 products) */}
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Quick Add
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {products.slice(0, 5).map((product) => (
                      <Button key={product._id} variant="outlined" color="primary" sx={{ borderRadius: 2, minWidth: 120 }} onClick={() => handleAddToCart(product)}>
                        {product.name}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Cart Items */}
                <Box mb={2}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    Cart Items <Chip label={cart.length} color="primary" size="small" sx={{ ml: 1 }} />
                  </Typography>
                  {cart.length > 0 && (
                    <Button startIcon={<ClearAllIcon />} color="error" onClick={handleClearCart} size="small" sx={{ float: 'right', mb: 2 }}>
                      Clear All
                    </Button>
                  )}
                </Box>

                <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', borderRadius: 2, boxShadow: 1 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }} align="center">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }} align="right">Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }} align="center">Action</TableCell>
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
                          <TableRow key={item._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">{item.productName}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.sku}</Typography>
                              {item.availableStock < 10 && (<Chip label={`Only ${item.availableStock} left!`} size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }} />)}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center">
                                <IconButton size="small" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} color="primary"><RemoveIcon fontSize="small" /></IconButton>
                                <TextField value={item.quantity} onChange={(e) => { const val = parseInt(e.target.value) || 0; handleUpdateQuantity(item._id, val); }} type="number" size="small" sx={{ width: 60, mx: 1, '& input': { textAlign: 'center', fontWeight: 'bold' } }} inputProps={{ min: 1, max: item.availableStock }} />
                                <IconButton size="small" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} color="primary" disabled={item.quantity >= item.availableStock}><AddIcon fontSize="small" /></IconButton>
                              </Box>
                              <Typography variant="caption" color="text.secondary">Max: {item.availableStock}</Typography>
                            </TableCell>
                            <TableCell align="right"><Typography variant="body2">LKR {item.unitPrice.toFixed(2)}</Typography></TableCell>
                            <TableCell align="right"><Typography variant="body2" fontWeight="bold">LKR {item.totalPrice.toFixed(2)}</Typography></TableCell>
                            <TableCell align="center"><Tooltip title="Remove from cart"><IconButton size="small" color="error" onClick={() => handleRemoveFromCart(item._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Sticky Summary Sidebar */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 32 }}>
              <Card elevation={4} sx={{ borderRadius: 4, boxShadow: 4, p: 2, bgcolor: '#f8f9fa' }}>
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
                    <TextField select fullWidth label="Issue Type" value={issueType} onChange={(e) => setIssueType(e.target.value)} sx={{ mb: 2 }} SelectProps={{ native: true }}>
                      <option value="outpatient">Outpatient</option>
                      <option value="inpatient">Inpatient</option>
                      <option value="department">Department</option>
                      <option value="emergency">Emergency</option>
                    </TextField>
                    {issueType === 'department' ? (
                      <>
                        <TextField fullWidth label="Department Name" value={departmentInfo.name} onChange={(e) => setDepartmentInfo({ ...departmentInfo, name: e.target.value })} sx={{ mb: 2 }} />
                        <TextField fullWidth label="Department ID" value={departmentInfo.id} onChange={(e) => setDepartmentInfo({ ...departmentInfo, id: e.target.value })} sx={{ mb: 2 }} />
                      </>
                    ) : (
                      <>
                        <TextField fullWidth label="Patient Name" value={patientInfo.name} onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })} sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><HospitalIcon fontSize="small" /></InputAdornment>) }} />
                        <TextField fullWidth label="Patient ID" value={patientInfo.id} onChange={(e) => setPatientInfo({ ...patientInfo, id: e.target.value })} sx={{ mb: 2 }} />
                        {issueType === 'inpatient' && (
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}><TextField fullWidth label="Ward ID" value={patientInfo.wardId} onChange={(e) => setPatientInfo({ ...patientInfo, wardId: e.target.value })} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Bed Number" value={patientInfo.bedNumber} onChange={(e) => setPatientInfo({ ...patientInfo, bedNumber: e.target.value })} /></Grid>
                          </Grid>
                        )}
                      </>
                    )}
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
          </Grid>
        </Grid>

        {/* Confirmation Modal before finalizing issue */}
        {/* ...existing code for Invoice Dialog, Snackbar, etc... */}
        {/* ...existing code... */}
      </Container>
    </Layout>
  );
}

export default IssueManagement;
