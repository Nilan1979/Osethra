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
  Visibility as VisibilityIcon,
  MedicalServices as MedicalIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import PrescriptionDetailsModal from '../Inventory/molecules/PrescriptionDetailsModal';
import inventoryAPI from '../../api/inventory';

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expired: 0,
    totalValue: 0,
    pendingPrescriptions: 0,
    todayIssues: 0,
    todayRevenue: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel for faster loading
      const [statsResponse, alertsResponse, prescriptionsResponse, activitiesResponse] = await Promise.all([
        inventoryAPI.dashboard.getDashboardStats(),
        inventoryAPI.alerts.getStockAlerts(),
        inventoryAPI.prescriptions.getPrescriptions({ status: 'pending' }),
        inventoryAPI.dashboard.getRecentActivities(10),
      ]);

      // Process dashboard stats
      setStats(statsResponse.data || statsResponse);

      // Process stock alerts
      const alerts = alertsResponse.data || alertsResponse;

      // Set low stock items
      if (alerts.lowStock) {
        setLowStockItems(alerts.lowStock.slice(0, 5).map(item => ({
          id: item._id,
          name: item.name,
          stock: item.currentStock,
          minStock: item.minStock,
          category: item.category,
        })));
      }

      // Set expiry alerts
      if (alerts.expiringItems) {
        const today = new Date();
        setExpiryAlerts(alerts.expiringItems.slice(0, 3).map(item => {
          const expiryDate = new Date(item.expiryDate);
          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          return {
            id: item._id,
            name: item.name,
            expiryDate: item.expiryDate,
            daysLeft,
            batch: item.batchNumber || 'N/A',
          };
        }));
      }

      // Process pending prescriptions
      const prescriptions = prescriptionsResponse.data?.prescriptions || prescriptionsResponse.prescriptions || [];
      setPendingPrescriptions(prescriptions.slice(0, 5).map(rx => ({
        id: rx.prescriptionNumber || rx._id,
        patientName: rx.patient?.name || 'Unknown',
        patientId: rx.patient?.id || 'N/A',
        doctorName: rx.doctor?.name || 'Unknown',
        date: new Date(rx.date).toLocaleDateString(),
        time: rx.time || 'N/A',
        status: rx.status,
        medications: rx.medications || [],
      })));

      // Process recent activities
      const activities = activitiesResponse.data?.activities || activitiesResponse.activities || [];
      setRecentActivities(activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        description: activity.description || activity.message,
        time: getTimeAgo(new Date(activity.timestamp || activity.createdAt)),
      })));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      title: "Today's Revenue",
      value: `LKR ${stats.todayRevenue.toLocaleString()}`,
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe',
      trend: '+12.5%',
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
      title: 'Pending Prescriptions',
      value: stats.pendingPrescriptions || 0,
      icon: <MedicalIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      trend: `${stats.pendingPrescriptions || 0} new`,
      trendUp: true,
    },
    {
      title: "Today's Transactions",
      value: stats.todayIssues || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
      trend: '+8',
      trendUp: true,
    },
  ];

  const productManagementActions = [
    {
      title: 'View Products',
      icon: <InventoryIcon />,
      color: '#2e7d32',
      route: '/pharmacist/products',
      description: 'View all product definitions',
    },
    {
      title: 'Add New Product',
      icon: <AddIcon />,
      color: '#1b5e20',
      route: '/pharmacist/products/add',
      description: 'Create product master data',
    },
  ];

  const inventoryManagementActions = [
    {
      title: 'View Inventory',
      icon: <PharmacyIcon />,
      color: '#0288d1',
      route: '/pharmacist/inventory',
      description: 'View all stock & batches',
    },
    {
      title: 'Add Stock/Batch',
      icon: <AddIcon />,
      color: '#01579b',
      route: '/pharmacist/inventory/add',
      description: 'Add inventory to products',
    },
    {
      title: 'Stock Alerts',
      icon: <WarningIcon />,
      color: '#ed6c02',
      route: '/pharmacist/alerts',
      description: 'View low stock & expiry',
    },
  ];

  const otherQuickActions = [
    {
      title: 'Issue Products',
      icon: <ShoppingCartIcon />,
      color: '#1976d2',
      route: '/pharmacist/issues',
      description: 'Issue to patients/departments',
    },
    {
      title: 'Prescriptions',
      icon: <MedicalIcon />,
      color: '#7b1fa2',
      route: '/pharmacist/prescriptions',
      description: 'View all prescriptions',
    },
    {
      title: 'Issue History',
      icon: <AssignmentIcon />,
      color: '#5e35b1',
      route: '/pharmacist/issue-history',
      description: 'View past product issues',
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

  const handleDispensePrescription = async (prescription) => {
    try {
      // Navigate to IssueManagement with prescription medications in cart
      navigate('/pharmacist/issues', {
        state: {
          prescriptionData: {
            prescription: prescription,
            medications: prescription.medications,
            patient: {
              name: prescription.patientName,
              id: prescription.patientId,
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to navigate to issue management:', err);
    }
  };

  const handleStatusChange = async (prescriptionId, newStatus) => {
    try {
      await inventoryAPI.prescriptions.updatePrescriptionStatus(prescriptionId, newStatus);
      // Refresh the dashboard data to update prescriptions
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update prescription status:', err);
      setError(err.response?.data?.message || 'Failed to update prescription status');
    }
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(6, 1fr)'
              },
              gap: 3
            }}>
              {statCards.map((stat, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    minHeight: '180px',
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
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
                        {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                      </Box>
                      <Chip
                        label={stat.trend}
                        size="small"
                        sx={{
                          bgcolor: stat.trendUp ? '#e8f5e9' : '#ffebee',
                          color: stat.trendUp ? '#2e7d32' : '#d32f2f',
                          fontWeight: 600,
                          height: 24,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, mt: 'auto' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Product Management Section */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '2px solid #2e7d32',
                bgcolor: '#f1f8f4',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#2e7d32', mr: 2, width: 48, height: 48 }}>
                    <InventoryIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#2e7d32' }}>
                      Product Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Manage product master data & definitions
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2, borderColor: '#2e7d3233' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {productManagementActions.map((action, index) => (
                    <Card
                      key={index}
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid #c8e6c9',
                        bgcolor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: action.color,
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${action.color}33`,
                        },
                      }}
                      onClick={() => navigate(action.route)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ bgcolor: `${action.color}15`, color: action.color, mr: 1.5, width: 36, height: 36 }}>
                            {React.cloneElement(action.icon, { sx: { fontSize: 20 } })}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '0.95rem' }}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {action.description}
                            </Typography>
                          </Box>
                          <ArrowForwardIcon sx={{ color: action.color, fontSize: 20 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Inventory Management Section */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '2px solid #0288d1',
                bgcolor: '#e3f2fd',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#0288d1', mr: 2, width: 48, height: 48 }}>
                    <PharmacyIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#0288d1' }}>
                      Inventory Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Manage stock, batches & inventory tracking
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2, borderColor: '#0288d133' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {inventoryManagementActions.map((action, index) => (
                    <Card
                      key={index}
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid #b3e5fc',
                        bgcolor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: action.color,
                          transform: 'translateX(4px)',
                          boxShadow: `0 4px 12px ${action.color}33`,
                        },
                      }}
                      onClick={() => navigate(action.route)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ bgcolor: `${action.color}15`, color: action.color, mr: 1.5, width: 36, height: 36 }}>
                            {React.cloneElement(action.icon, { sx: { fontSize: 20 } })}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '0.95rem' }}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {action.description}
                            </Typography>
                          </Box>
                          <ArrowForwardIcon sx={{ color: action.color, fontSize: 20 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Other Quick Actions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 2, mt: 2 }}>
              Other Quick Actions
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2
            }}>
              {otherQuickActions.map((action, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    minHeight: '110px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: action.color,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${action.color}33`,
                    },
                  }}
                  onClick={() => navigate(action.route)}
                >
                  <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={1.5}>
                      <Avatar sx={{ bgcolor: `${action.color}15`, color: action.color, mr: 1.5, width: 40, height: 40 }}>
                        {React.cloneElement(action.icon, { sx: { fontSize: 20 } })}
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '0.95rem' }}>
                        {action.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Pending Prescriptions */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%', minHeight: '450px', maxHeight: '450px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                    <MedicalIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#1976d2', fontSize: 24 }} />
                    Pending Prescriptions
                  </Typography>
                  <Badge badgeContent={pendingPrescriptions.length} color="primary">
                    <IconButton size="small" onClick={() => navigate('/pharmacist/prescriptions')}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                  <List dense sx={{ py: 0 }}>
                    {pendingPrescriptions.slice(0, 2).map((prescription) => (
                      <ListItem
                        key={prescription.id}
                        sx={{
                          mb: 1.5,
                          bgcolor: '#fafafa',
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          p: 1.5,
                          '&:hover': {
                            bgcolor: '#e3f2fd',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setPrescriptionModalOpen(true);
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}>
                            <MedicalIcon fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                                {prescription.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                ID: {prescription.patientId}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box mt={0.5}>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                                Dr. {prescription.doctorName.replace('Dr. ', '')}
                              </Typography>
                              <Box display="flex" gap={0.5} mt={0.5}>
                                <Chip
                                  label={`${prescription.medications.length} items`}
                                  size="small"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                                <Chip
                                  label={prescription.time}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              </Box>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                        <IconButton size="small" sx={{ alignSelf: 'flex-start' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                {pendingPrescriptions.length > 2 && (
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 1.5 }}
                    onClick={() => navigate('/pharmacist/prescriptions')}
                  >
                    View All Prescriptions ({pendingPrescriptions.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Alerts */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%', minHeight: '450px', maxHeight: '450px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                    <WarningIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#ed6c02', fontSize: 24 }} />
                    Low Stock Alerts
                  </Typography>
                  <Badge badgeContent={lowStockItems.length} color="error">
                    <IconButton size="small" onClick={() => navigate('/pharmacist/alerts')}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                  <List dense sx={{ py: 0 }}>
                    {lowStockItems.slice(0, 2).map((item) => {
                      const percentage = getStockPercentage(item.stock, item.minStock);
                      return (
                        <ListItem
                          key={item.id}
                          sx={{
                            mb: 1.5,
                            bgcolor: '#fafafa',
                            borderRadius: 1.5,
                            p: 1.5,
                            '&:hover': { bgcolor: '#f5f5f5' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                                {item.name}
                              </Typography>
                            }
                            secondary={
                              <Box mt={1}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    Stock: {item.stock} / {item.minStock}
                                  </Typography>
                                  <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
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
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
                {lowStockItems.length > 2 && (
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 1.5 }}
                    onClick={() => navigate('/pharmacist/alerts')}
                  >
                    View All Alerts
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Expiry Alerts */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%', minHeight: '450px', maxHeight: '450px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                    <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#d32f2f', fontSize: 24 }} />
                    Expiry Alerts
                  </Typography>
                  <Badge badgeContent={expiryAlerts.length} color="error">
                    <IconButton size="small" onClick={() => navigate('/pharmacist/alerts')}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                  <List dense sx={{ py: 0 }}>
                    {expiryAlerts.map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{
                          mb: 1.5,
                          bgcolor: '#fafafa',
                          borderRadius: 1.5,
                          p: 1.5,
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Box mt={0.5}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Batch: {item.batch}
                              </Typography>
                              <Box display="flex" gap={0.5} mt={0.5}>
                                <Chip
                                  label={`${item.daysLeft} days left`}
                                  size="small"
                                  color={getDaysLeftColor(item.daysLeft)}
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                                <Chip
                                  label={new Date(item.expiryDate).toLocaleDateString()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              </Box>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={12}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', minHeight: '300px', maxHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Typography variant="h6" fontWeight="600" mb={2} sx={{ fontSize: '1.1rem' }}>
                  <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 24 }} />
                  Recent Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                  <List sx={{ py: 0 }}>
                    {recentActivities.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ px: 0, py: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
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
                            primary={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{activity.description}</Typography>}
                            secondary={<Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{activity.time}</Typography>}
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider variant="inset" sx={{ ml: '40px' }} />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Prescription Details Modal */}
        <PrescriptionDetailsModal
          open={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          prescription={selectedPrescription}
          onDispense={handleDispensePrescription}
          onStatusChange={handleStatusChange}
        />
      </Container>
    </Layout>
  );
};

export default PharmacistDashboard;