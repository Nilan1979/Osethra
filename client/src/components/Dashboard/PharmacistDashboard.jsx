import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  LocalPharmacy as PharmacyIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  LocalShipping as ShippingIcon,
  People as PeopleIcon,
  EventAvailable as AvailableIcon,
  Sell as SellIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { useAuth } from '../../context/AuthContext';

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalProducts: 1234,
    lowStock: 23,
    expired: 8,
    totalValue: 245680,
    pendingPrescriptions: 15,
    todayIssues: 48,
    categories: 12,
    suppliers: 28,
  });

  const [lowStockItems] = useState([
    { id: 1, name: 'Paracetamol 500mg', stock: 45, minStock: 100, category: 'Pain Relief' },
    { id: 2, name: 'Amoxicillin 250mg', stock: 12, minStock: 50, category: 'Antibiotics' },
    { id: 3, name: 'Ibuprofen 400mg', stock: 30, minStock: 80, category: 'Pain Relief' },
    { id: 4, name: 'Surgical Gloves (M)', stock: 25, minStock: 200, category: 'Medical Supplies' },
    { id: 5, name: 'Face Masks (N95)', stock: 50, minStock: 150, category: 'PPE' },
  ]);

  const [expiryAlerts] = useState([
    { id: 1, name: 'Insulin Vials', expiryDate: '2025-10-15', daysLeft: 13, batch: 'INS2024-089' },
    { id: 2, name: 'Vaccine Doses', expiryDate: '2025-10-08', daysLeft: 6, batch: 'VAC2024-156' },
    { id: 3, name: 'Syrup Antibiotics', expiryDate: '2025-10-20', daysLeft: 18, batch: 'SYR2024-234' },
  ]);

  const [recentActivities] = useState([
    { id: 1, type: 'issue', description: 'Issued medication to Patient #12345', time: '10 mins ago' },
    { id: 2, type: 'receipt', description: 'Received shipment from MedSupply Co.', time: '1 hour ago' },
    { id: 3, type: 'update', description: 'Updated stock for Paracetamol 500mg', time: '2 hours ago' },
    { id: 4, type: 'issue', description: 'Issued supplies to Ward-3', time: '3 hours ago' },
  ]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      trend: '+5.2%',
      trendUp: true,
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStock,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
      trend: '-12%',
      trendUp: true,
    },
    {
      title: 'Expired Items',
      value: stats.expired,
      icon: <AvailableIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
      trend: '+2',
      trendUp: false,
    },
    {
      title: 'Inventory Value',
      value: `LKR ${(stats.totalValue / 1000).toFixed(1)}K`,
      icon: <SellIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      trend: '+8.1%',
      trendUp: true,
    },
  ];

  const quickActions = [
    {
      title: 'Manage Products',
      icon: <InventoryIcon />,
      color: '#2e7d32',
      route: '/pharmacist/products',
      description: 'Add, edit or view products',
    },
    {
      title: 'Issue Products',
      icon: <ShoppingCartIcon />,
      color: '#1976d2',
      route: '/pharmacist/issues',
      description: 'Issue to patients/departments',
    },
    {
      title: 'Stock Alerts',
      icon: <WarningIcon />,
      color: '#ed6c02',
      route: '/pharmacist/alerts',
      description: 'View low stock & expiry',
    },
    {
      title: 'Reports',
      icon: <AssessmentIcon />,
      color: '#9c27b0',
      route: '/pharmacist/reports',
      description: 'Generate inventory reports',
    },
  ];

  const getStockPercentage = (current, min) => {
    return (current / min) * 100;
  };

  const getStockColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const getDaysLeftColor = (days) => {
    if (days <= 7) return 'error';
    if (days <= 14) return 'warning';
    return 'info';
  };

  if (loading) {
    return (
      <Layout showContactInfo={false}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <LinearProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Pharmacist Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.name || 'Pharmacist'}! Here's your pharmacy overview.
              </Typography>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#2e7d32',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={() => navigate('/pharmacist/products/add')}
              >
                Add Product
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShippingIcon />}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => navigate('/pharmacist/issues/new')}
              >
                New Issue
              </Button>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
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
                    <Chip
                      label={stat.trend}
                      size="small"
                      sx={{
                        bgcolor: stat.trendUp ? '#e8f5e9' : '#ffebee',
                        color: stat.trendUp ? '#2e7d32' : '#d32f2f',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: action.color,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${action.color}33`,
                      },
                    }}
                    onClick={() => navigate(action.route)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ bgcolor: `${action.color}15`, color: action.color, mr: 2 }}>
                          {action.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight="600">
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Low Stock Alerts */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600">
                    <WarningIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#ed6c02' }} />
                    Low Stock Alerts
                  </Typography>
                  <Badge badgeContent={lowStockItems.length} color="error">
                    <IconButton size="small" onClick={() => navigate('/pharmacist/alerts')}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {lowStockItems.slice(0, 4).map((item) => {
                    const percentage = getStockPercentage(item.stock, item.minStock);
                    return (
                      <ListItem 
                        key={item.id}
                        sx={{ 
                          mb: 1, 
                          bgcolor: '#fafafa', 
                          borderRadius: 1,
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="600">
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Box mt={1}>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Stock: {item.stock} / {item.minStock}
                                </Typography>
                                <Typography variant="caption" fontWeight="600">
                                  {percentage.toFixed(0)}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(percentage, 100)}
                                color={getStockColor(percentage)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
                {lowStockItems.length > 4 && (
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/pharmacist/alerts')}
                  >
                    View All Alerts
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Expiry Alerts */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600">
                    <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d32f2f' }} />
                    Expiry Alerts
                  </Typography>
                  <Badge badgeContent={expiryAlerts.length} color="error">
                    <IconButton size="small" onClick={() => navigate('/pharmacist/alerts')}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {expiryAlerts.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        mb: 1,
                        bgcolor: '#fafafa',
                        borderRadius: 1,
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="600">
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Batch: {item.batch}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip
                                label={`${item.daysLeft} days left`}
                                size="small"
                                color={getDaysLeftColor(item.daysLeft)}
                              />
                              <Chip
                                label={new Date(item.expiryDate).toLocaleDateString()}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" mb={2}>
                  <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Recent Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor:
                                activity.type === 'issue'
                                  ? '#e3f2fd'
                                  : activity.type === 'receipt'
                                  ? '#e8f5e9'
                                  : '#fff3e0',
                              color:
                                activity.type === 'issue'
                                  ? '#1976d2'
                                  : activity.type === 'receipt'
                                  ? '#2e7d32'
                                  : '#ed6c02',
                            }}
                          >
                            {activity.type === 'issue' ? (
                              <ShoppingCartIcon fontSize="small" />
                            ) : activity.type === 'receipt' ? (
                              <ShippingIcon fontSize="small" />
                            ) : (
                              <InventoryIcon fontSize="small" />
                            )}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={activity.time}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider variant="inset" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default PharmacistDashboard;