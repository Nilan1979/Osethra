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

const BatchExpiryReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    days: '90',
    expiryStatus: 'all'
  });

  const categories = ['all', 'Analgesics', 'Antibiotics', 'Vitamins', 'Antihypertensives', 'Antidiabetics', 'Emergency', 'Surgical'];
  const daysOptions = [
    { value: '30', label: 'Next 30 Days' },
    { value: '60', label: 'Next 60 Days' },
    { value: '90', label: 'Next 90 Days' },
    { value: '180', label: 'Next 180 Days' }
  ];
  const expiryStatuses = [
    { value: 'all', label: 'All' },
    { value: 'expired', label: 'Expired' },
    { value: 'critical', label: 'Critical (< 30 days)' },
    { value: 'warning', label: 'Warning (< 90 days)' },
    { value: 'fresh', label: 'Fresh (> 90 days)' }
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsAPI.getBatchExpiryReport(filters);
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
      const blob = await reportsAPI.downloadBatchExpiryPDF(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `batch-expiry-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF');
    }
  };

  const getAlertColor = (alertLevel) => {
    switch (alertLevel) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
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
                label="Time Period"
                value={filters.days}
                onChange={(e) => handleFilterChange('days', e.target.value)}
                size="small"
              >
                {daysOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Expiry Status"
                value={filters.expiryStatus}
                onChange={(e) => handleFilterChange('expiryStatus', e.target.value)}
                size="small"
              >
                {expiryStatuses.map((status) => (
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
                  Total Batches
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary.totalBatches}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Expired
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {reportData.summary.expired}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Critical
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {reportData.summary.critical}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#fff9c4' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Warning
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.dark">
                  {reportData.summary.warning}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ bgcolor: '#ffcdd2' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Value at Risk
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  Rs. {reportData.summary.totalValueAtRisk}
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
      {reportData && reportData.batches && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Batch Details ({reportData.batches.length} batches)
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Product Name</strong></TableCell>
                    <TableCell><strong>Batch Number</strong></TableCell>
                    <TableCell><strong>Expiry Date</strong></TableCell>
                    <TableCell align="right"><strong>Days Until Expiry</strong></TableCell>
                    <TableCell align="right"><strong>Quantity</strong></TableCell>
                    <TableCell align="right"><strong>Value</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.batches.map((batch, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                    >
                      <TableCell>{batch.productName}</TableCell>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${batch.daysUntilExpiry} days`}
                          color={batch.daysUntilExpiry < 0 ? 'error' : batch.daysUntilExpiry < 30 ? 'error' : batch.daysUntilExpiry < 90 ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {batch.quantity} {batch.unit}
                      </TableCell>
                      <TableCell align="right">Rs. {batch.totalValue}</TableCell>
                      <TableCell>
                        <Chip
                          label={batch.expiryStatus}
                          color={getAlertColor(batch.alertLevel)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{batch.storageLocation}</TableCell>
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

export default BatchExpiryReport;
