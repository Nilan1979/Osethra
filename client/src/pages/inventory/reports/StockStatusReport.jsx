import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import reportsAPI from '../../../api/reports';

const StockStatusReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    stockStatus: 'all'
  });

  const categories = ['all', 'Analgesics', 'Antibiotics', 'Vitamins', 'Antihypertensives', 'Antidiabetics', 'Emergency', 'Surgical'];
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];
  const stockStatuses = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'in', label: 'In Stock' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out', label: 'Out of Stock' }
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsAPI.getStockStatusReport(filters);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await reportsAPI.downloadStockStatusPDF(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-status-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF');
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                size="small"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Product Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                size="small"
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Stock Status"
                value={filters.stockStatus}
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                size="small"
              >
                {stockStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={fetchReport}
                  fullWidth
                >
                  Generate
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  disabled={!reportData}
                >
                  PDF
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData && reportData.summary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Products
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  In Stock
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {reportData.summary.inStock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Low Stock
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {reportData.summary.lowStock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Out of Stock
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {reportData.summary.outOfStock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  Rs. {reportData.summary.totalValue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report Table */}
      {reportData && reportData.products && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Product Details ({reportData.products.length} items)
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Product Name</strong></TableCell>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell align="right"><strong>Total Stock</strong></TableCell>
                    <TableCell align="right"><strong>Batches</strong></TableCell>
                    <TableCell align="right"><strong>Total Value</strong></TableCell>
                    <TableCell><strong>Stock Status</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.products.map((product, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                    >
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">
                        {product.totalStock} {product.unit}
                      </TableCell>
                      <TableCell align="right">{product.batches}</TableCell>
                      <TableCell align="right">Rs. {product.totalValue}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.stockStatus}
                          color={getStockStatusColor(product.stockStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StockStatusReport;
