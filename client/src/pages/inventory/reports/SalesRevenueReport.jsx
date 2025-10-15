import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import reportsAPI from '../../../api/reports';

const SalesRevenueReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsAPI.getSalesRevenueReport(filters);
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
      const blob = await reportsAPI.downloadSalesRevenuePDF(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-revenue-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF');
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  Rs. {reportData.summary.totalRevenue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  Rs. {reportData.summary.totalCost}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Total Profit
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  Rs. {reportData.summary.totalProfit}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Margin: {reportData.summary.profitMargin}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Transactions
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary.totalTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg: Rs. {reportData.summary.averageTransactionValue}
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

      {/* Category Sales */}
      {reportData && reportData.categorySales && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sales by Category
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Revenue</strong></TableCell>
                        <TableCell align="right"><strong>Profit</strong></TableCell>
                        <TableCell align="right"><strong>Margin</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.categorySales.map((cat, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                          <TableCell>{cat.category}</TableCell>
                          <TableCell align="right">Rs. {cat.revenue.toFixed(2)}</TableCell>
                          <TableCell align="right">Rs. {cat.profit.toFixed(2)}</TableCell>
                          <TableCell align="right">{cat.profitMargin}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Selling Products
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Qty</strong></TableCell>
                        <TableCell align="right"><strong>Revenue</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.topProducts && reportData.topProducts.map((product, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                          <TableCell>{product.product}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">Rs. {product.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Daily Sales Trend */}
      {reportData && reportData.dailySales && reportData.dailySales.length > 0 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Sales Trend
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                    <TableCell align="right"><strong>Cost</strong></TableCell>
                    <TableCell align="right"><strong>Profit</strong></TableCell>
                    <TableCell align="right"><strong>Transactions</strong></TableCell>
                    <TableCell align="right"><strong>Items</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.dailySales.map((day, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                      <TableCell align="right">Rs. {day.revenue.toFixed(2)}</TableCell>
                      <TableCell align="right">Rs. {day.cost.toFixed(2)}</TableCell>
                      <TableCell align="right">Rs. {day.profit.toFixed(2)}</TableCell>
                      <TableCell align="right">{day.transactions}</TableCell>
                      <TableCell align="right">{day.items}</TableCell>
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

export default SalesRevenueReport;
