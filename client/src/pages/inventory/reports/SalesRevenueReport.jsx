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
      <Card elevation={1} sx={{ mb: 3, bgcolor: '#fafafa' }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  onClick={fetchReport}
                  fullWidth
                  sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Generate
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  disabled={!reportData}
                  sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, minWidth: '100px' }}
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
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="500">
                  Total Revenue
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main" mt={0.5}>
                  Rs. {reportData.summary.totalRevenue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="500">
                  Total Cost
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main" mt={0.5}>
                  Rs. {reportData.summary.totalCost}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="500">
                  Total Profit
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main" mt={0.5}>
                  Rs. {reportData.summary.totalProfit}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Margin: {reportData.summary.profitMargin}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight="500">
                  Transactions
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={0.5}>
                  {reportData.summary.totalTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
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

      {/* Category Sales & Top Products */}
      {reportData && reportData.categorySales && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Sales by Category
                </Typography>
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Category</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Revenue</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Profit</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Margin</TableCell>
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
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Top Selling Products
                </Typography>
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Product</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Qty</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.topProducts && reportData.topProducts.map((product, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{product.product}</TableCell>
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
        <Card elevation={1}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Daily Sales Trend
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Revenue</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Cost</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Profit</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Transactions</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Items</TableCell>
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
