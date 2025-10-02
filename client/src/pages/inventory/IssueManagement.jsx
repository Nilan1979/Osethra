import React, { useState } from 'react';
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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import ProductSearchBar from '../../components/Inventory/molecules/ProductSearchBar';
import QuantityInput from '../../components/Inventory/atoms/QuantityInput';

const IssueManagement = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [issueType, setIssueType] = useState('outpatient');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    id: '',
    type: 'outpatient',
    wardId: '',
    bedNumber: '',
  });

  const steps = ['Select Type', 'Patient Details', 'Select Products', 'Review & Issue'];

  const availableProducts = [
    { id: 1, name: 'Paracetamol 500mg', sku: 'MED-PAR-500', stock: 450, unitPrice: 15.00 },
    { id: 2, name: 'Amoxicillin 250mg', sku: 'MED-AMO-250', stock: 120, unitPrice: 35.00 },
    { id: 3, name: 'Ibuprofen 400mg', sku: 'MED-IBU-400', stock: 300, unitPrice: 25.00 },
  ];

  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity: newQuantity } : p
    ));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleIssue = () => {
    // Implement issue logic
    console.log('Issue products:', { patientInfo, selectedProducts });
    navigate('/pharmacist/dashboard');
  };

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Issue Products
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Issue products to patients or departments
              </Typography>
            </Box>
            <CartIcon sx={{ fontSize: 64, opacity: 0.3 }} />
          </Box>
        </Paper>

        {/* Stepper */}
        <Card elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Select Issue Type
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {['outpatient', 'inpatient', 'department', 'emergency'].map((type) => (
                    <Grid item xs={12} sm={6} key={type}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: issueType === type ? '2px solid #2e7d32' : '1px solid #e0e0e0',
                          '&:hover': { borderColor: '#2e7d32' }
                        }}
                        onClick={() => setIssueType(type)}
                      >
                        <CardContent>
                          <Typography variant="h6" textTransform="capitalize">
                            {type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {type === 'outpatient' ? 'Walk-in patients' :
                             type === 'inpatient' ? 'Admitted patients' :
                             type === 'department' ? 'Internal departments' :
                             'Urgent requests'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="600" mb={3}>
                  Patient/Department Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Patient/Department Name"
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ID Number"
                      value={patientInfo.id}
                      onChange={(e) => setPatientInfo({ ...patientInfo, id: e.target.value })}
                    />
                  </Grid>
                  {issueType === 'inpatient' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Ward ID"
                          value={patientInfo.wardId}
                          onChange={(e) => setPatientInfo({ ...patientInfo, wardId: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Bed Number"
                          value={patientInfo.bedNumber}
                          onChange={(e) => setPatientInfo({ ...patientInfo, bedNumber: e.target.value })}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Select Products
                </Typography>
                
                <Box mb={3} mt={2}>
                  <ProductSearchBar 
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search products to add..."
                  />
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Available Products
                </Typography>
                <Paper variant="outlined" sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell align="right">{product.stock}</TableCell>
                          <TableCell align="right">LKR {product.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleAddProduct(product)}
                            >
                              <AddIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>

                <Typography variant="subtitle2" gutterBottom>
                  Selected Products ({selectedProducts.length})
                </Typography>
                <Paper variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary">
                              No products selected
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell align="center">
                              <QuantityInput
                                value={product.quantity}
                                onChange={(qty) => handleQuantityChange(product.id, qty)}
                                max={product.stock}
                              />
                            </TableCell>
                            <TableCell align="right">LKR {product.unitPrice.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              LKR {(product.unitPrice * product.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveProduct(product.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Review & Confirm Issue
                </Typography>

                <Paper variant="outlined" sx={{ p: 3, mt: 3, mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issue Type
                      </Typography>
                      <Chip label={issueType.toUpperCase()} color="primary" sx={{ mt: 0.5 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Patient/Department Name
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {patientInfo.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ID Number
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {patientInfo.id || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="subtitle2" gutterBottom>
                  Products Summary
                </Typography>
                <Paper variant="outlined" sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="center">{product.quantity}</TableCell>
                          <TableCell align="right">LKR {product.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            LKR {(product.unitPrice * product.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="h6" fontWeight="bold">
                            Total Amount:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            LKR {calculateTotal().toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pharmacist/dashboard')}
                >
                  Cancel
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleIssue}
                    disabled={selectedProducts.length === 0}
                  >
                    Issue Products
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default IssueManagement;
