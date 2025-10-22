import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  LocalPharmacy as PharmacyIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { inventoryItemsAPI } from '../../api/inventory';

const InventoryManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    expiringSoon: 0,
  });

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryItemsAPI.getInventoryItems();
      
      if (response.success) {
        // Extract items array from response (it's nested in data.items)
        const items = response.data?.items || [];
        setInventoryItems(items);
        setFilteredItems(items);
        calculateStats(items);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setSnackbarMessage('Failed to load inventory items');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate statistics
  const calculateStats = (items) => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);
    const lowStock = items.filter(item => item.quantity < 50).length; // Example threshold
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
    const expiringSoon = items.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysFromNow;
    }).length;

    setStats({
      totalItems,
      totalValue,
      lowStock,
      expiringSoon,
    });
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...inventoryItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const today = new Date();
      if (statusFilter === 'expired') {
        filtered = filtered.filter(item => new Date(item.expiryDate) < today);
      } else if (statusFilter === 'expiring-soon') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        filtered = filtered.filter(item => {
          const expiryDate = new Date(item.expiryDate);
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        });
      } else if (statusFilter === 'in-stock') {
        filtered = filtered.filter(item => item.quantity > 0 && new Date(item.expiryDate) >= today);
      } else if (statusFilter === 'low-stock') {
        filtered = filtered.filter(item => item.quantity < 50 && item.quantity > 0);
      } else if (statusFilter === 'out-of-stock') {
        filtered = filtered.filter(item => item.quantity === 0);
      }
    }

    setFilteredItems(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, inventoryItems]);

  // Get expiry status
  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'error', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { label: 'Expiring Soon', color: 'warning', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 90) {
      return { label: 'Good', color: 'info', days: daysUntilExpiry };
    } else {
      return { label: 'Fresh', color: 'success', days: daysUntilExpiry };
    }
  };

  // Get stock status
  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'error' };
    } else if (quantity < 50) {
      return { label: 'Low Stock', color: 'warning' };
    } else if (quantity < 200) {
      return { label: 'In Stock', color: 'info' };
    } else {
      return { label: 'Well Stocked', color: 'success' };
    }
  };

  // Handle delete
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await inventoryItemsAPI.deleteInventoryItem(itemToDelete._id);
      setSnackbarMessage('Inventory item deleted successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchInventoryItems();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setSnackbarMessage('Failed to delete inventory item');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statCards = [
    {
      title: 'Total Inventory Items',
      value: stats.totalItems,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Total Inventory Value',
      value: `LKR ${stats.totalValue.toLocaleString()}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: <PharmacyIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  if (loading) {
    return (
      <Layout showContactInfo={false}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <IconButton
            onClick={() => navigate('/pharmacist/dashboard')}
            sx={{
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
            background: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Inventory Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                View and manage all inventory items with batch-level tracking
              </Typography>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchInventoryItems}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/pharmacist/inventory/add')}
                sx={{
                  bgcolor: 'white',
                  color: '#0288d1',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                Add Inventory
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters and Search */}
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by product, SKU, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Status Filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                  <MenuItem value="expiring-soon">Expiring Soon (30 days)</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" gap={1} height="100%" alignItems="center">
                  <Chip label={`${filteredItems.length} items`} color="primary" />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell><strong>SKU</strong></TableCell>
                  <TableCell><strong>Batch</strong></TableCell>
                  <TableCell align="right"><strong>Quantity</strong></TableCell>
                  <TableCell align="right"><strong>Buying Price</strong></TableCell>
                  <TableCell align="right"><strong>Selling Price</strong></TableCell>
                  <TableCell><strong>Mfg Date</strong></TableCell>
                  <TableCell><strong>Expiry Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No inventory items found. Add your first inventory item to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => {
                      const expiryStatus = getExpiryStatus(item.expiryDate);
                      const stockStatus = getStockStatus(item.quantity);
                      
                      return (
                        <TableRow key={item._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {item.product?.name || 'Unknown Product'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {item.product?.sku || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={item.batchNumber} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {item.quantity} {item.product?.unit || ''}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              LKR {item.buyingPrice.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              LKR {item.sellingPrice.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(item.manufactureDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color={expiryStatus.color === 'error' ? 'error' : 'text.secondary'}>
                                ({expiryStatus.days} days)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                              <Chip
                                label={stockStatus.label}
                                size="small"
                                color={stockStatus.color}
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={expiryStatus.label}
                                size="small"
                                color={expiryStatus.color}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/pharmacist/inventory/edit/${item._id}`)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(item)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this inventory item?
            </Typography>
            {itemToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Product:</strong> {itemToDelete.product?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Batch:</strong> {itemToDelete.batchNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Quantity:</strong> {itemToDelete.quantity}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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

export default InventoryManagement;
