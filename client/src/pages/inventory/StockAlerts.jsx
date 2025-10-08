import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import StockAlert from '../../components/Inventory/molecules/StockAlert';
import inventoryAPI from '../../api/inventory';

const StockAlerts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [expiryWarnings, setExpiryWarnings] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stock alerts
      const response = await inventoryAPI.alerts.getStockAlerts();
      const alerts = response.data || response;

      // Process low stock items
      if (alerts.lowStock) {
        setLowStockItems(alerts.lowStock.map(item => ({
          id: item._id,
          name: item.name,
          sku: item.sku || 'N/A',
          stock: item.currentStock,
          minStock: item.minStock,
          category: item.category,
        })));
      }

      // Process out of stock items (items with 0 stock)
      if (alerts.outOfStock) {
        setOutOfStockItems(alerts.outOfStock.map(item => ({
          id: item._id,
          name: item.name,
          sku: item.sku || 'N/A',
          stock: item.currentStock,
          minStock: item.minStock,
          category: item.category,
        })));
      }

      // Process expiry warnings and expired items
      if (alerts.expiringItems) {
        const today = new Date();
        const expiringItems = alerts.expiringItems.map(item => {
          const expiryDate = new Date(item.expiryDate);
          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          
          return {
            id: item._id,
            name: item.name,
            sku: item.sku || item.batchNumber || 'N/A',
            stock: item.currentStock,
            category: item.category,
            expiryDate: item.expiryDate,
            daysLeft,
          };
        });

        setExpiryWarnings(expiringItems);
      }

      if (alerts.expiredItems) {
        const today = new Date();
        const expiredItemsList = alerts.expiredItems.map(item => {
          const expiryDate = new Date(item.expiryDate);
          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          
          return {
            id: item._id,
            name: item.name,
            sku: item.sku || item.batchNumber || 'N/A',
            stock: item.currentStock,
            category: item.category,
            expiryDate: item.expiryDate,
            daysLeft,
          };
        });

        setExpiredItems(expiredItemsList);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.response?.data?.message || 'Failed to load stock alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (product) => {
    navigate(`/pharmacist/products/${product.id}`);
  };

  const renderAlertList = (items, type) => {
    if (items.length === 0) {
      return (
        <Card elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <Typography variant="body1" color="text.secondary">
            No alerts in this category
          </Typography>
        </Card>
      );
    }

    return items.map((item) => (
      <StockAlert 
        key={item.id}
        type={type}
        product={item}
        onAction={handleAction}
      />
    ));
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
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #ed6c02 0%, #d84315 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Stock Alerts
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Monitor and manage inventory alerts and warnings
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#fff3e0', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <WarningIcon sx={{ fontSize: 32, color: '#ed6c02' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {lowStockItems.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Stock
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#ffebee', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <ErrorIcon sx={{ fontSize: 32, color: '#d32f2f' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {outOfStockItems.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Out of Stock
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#fff3e0', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <CalendarIcon sx={{ fontSize: 32, color: '#ed6c02' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {expiryWarnings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expiry Warnings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#ffebee', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <InventoryIcon sx={{ fontSize: 32, color: '#d32f2f' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {expiredItems.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expired Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alerts Tabs */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      Low Stock
                      <Chip label={lowStockItems.length} size="small" color="warning" />
                    </Box>
                  }
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      Out of Stock
                      <Chip label={outOfStockItems.length} size="small" color="error" />
                    </Box>
                  }
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      Expiry Warnings
                      <Chip label={expiryWarnings.length} size="small" color="warning" />
                    </Box>
                  }
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      Expired
                      <Chip label={expiredItems.length} size="small" color="error" />
                    </Box>
                  }
                />
              </Tabs>

              <CardContent sx={{ p: 3 }}>
                {activeTab === 0 && renderAlertList(lowStockItems, 'low-stock')}
                {activeTab === 1 && renderAlertList(outOfStockItems, 'out-of-stock')}
                {activeTab === 2 && renderAlertList(expiryWarnings, 'expiry-warning')}
                {activeTab === 3 && renderAlertList(expiredItems, 'expired')}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default StockAlerts;
