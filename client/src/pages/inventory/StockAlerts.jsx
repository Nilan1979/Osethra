import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import StockAlert from '../../components/Inventory/molecules/StockAlert';

const StockAlerts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const lowStockItems = [
    { id: 1, name: 'Amoxicillin 250mg', sku: 'MED-AMO-250', stock: 12, minStock: 50, category: 'Medications' },
    { id: 2, name: 'Surgical Gloves (M)', sku: 'SUP-GLV-M', stock: 25, minStock: 200, category: 'Medical Supplies' },
    { id: 3, name: 'Ibuprofen 400mg', sku: 'MED-IBU-400', stock: 30, minStock: 80, category: 'Medications' },
  ];

  const outOfStockItems = [
    { id: 4, name: 'Bandages (Large)', sku: 'SUP-BAN-L', stock: 0, minStock: 100, category: 'Medical Supplies' },
    { id: 5, name: 'Antiseptic Solution', sku: 'SUP-ANT-500', stock: 0, minStock: 50, category: 'Medical Supplies' },
  ];

  const expiryWarnings = [
    { id: 6, name: 'Vaccine Doses', sku: 'MED-VAC-001', stock: 45, category: 'Medications', expiryDate: '2025-10-08', daysLeft: 6 },
    { id: 7, name: 'Insulin Vials', sku: 'MED-INS-100', stock: 80, category: 'Medications', expiryDate: '2025-10-15', daysLeft: 13 },
  ];

  const expiredItems = [
    { id: 8, name: 'Pain Relief Cream', sku: 'MED-PRE-050', stock: 15, category: 'Medications', expiryDate: '2025-09-28', daysLeft: -4 },
  ];

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
      </Container>
    </Layout>
  );
};

export default StockAlerts;
