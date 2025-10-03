import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MedicalServices as MedicalIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CompleteIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelledIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import PrescriptionDetailsModal from '../../components/Inventory/molecules/PrescriptionDetailsModal';
import inventoryAPI from '../../api/inventory';

const PrescriptionsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  
  // API state
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Fetch prescriptions from API
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: 1,
        limit: 1000, // Get all prescriptions
        search: searchTerm,
      };

      // Add status filter based on active tab
      if (activeTab === 1) {
        params.status = 'pending';
      } else if (activeTab === 2) {
        params.status = 'completed';
      }

      const response = await inventoryAPI.prescriptions.getPrescriptions(params);
      
      if (response.success) {
        // Transform data to match UI format
        const transformedPrescriptions = response.data.prescriptions.map(prescription => ({
          id: prescription.prescriptionNumber,
          _id: prescription._id,
          patientName: prescription.patient.name,
          patientId: prescription.patient.id,
          doctorName: prescription.doctor.name,
          date: new Date(prescription.date).toLocaleDateString('en-GB'),
          time: prescription.time,
          status: prescription.status,
          medications: prescription.medications.map(med => ({
            name: med.medicationName,
            dosage: med.dosage,
            quantity: med.quantity,
            duration: med.duration,
            instructions: med.instructions
          })),
          diagnosis: prescription.diagnosis,
          notes: prescription.notes,
          followUpDate: prescription.followUpDate,
          priority: prescription.priority,
          dispensedBy: prescription.dispensedBy,
          dispensedAt: prescription.dispensedAt,
        }));

        setPrescriptions(transformedPrescriptions);
        setTotalCount(response.data.total);
        setPendingCount(response.data.pending);
        setCompletedCount(response.data.completed);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  // Fetch prescriptions on component mount and when filters change
  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Prescriptions are already filtered by the API, so just use them directly
  const filteredPrescriptions = prescriptions;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
      completed: { color: 'success', icon: <CompleteIcon />, label: 'Completed' },
      cancelled: { color: 'error', icon: <CancelledIcon />, label: 'Cancelled' },
    };
    return configs[status] || configs.pending;
  };

  const handleDispensePrescription = async (prescription) => {
    // You can navigate to issues page or handle inline dispensing
    navigate('/pharmacist/issues/new', { state: { prescription } });
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
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Prescriptions Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                View and manage all patient prescriptions
              </Typography>
            </Box>
            <MedicalIcon sx={{ fontSize: 64, opacity: 0.3 }} />
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <MedicalIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {loading ? '-' : totalCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Prescriptions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
                    <PendingIcon sx={{ fontSize: 32, color: '#ed6c02' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {loading ? '-' : pendingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <CompleteIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {loading ? '-' : completedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Tabs */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={`All (${loading ? '-' : totalCount})`} />
              <Tab label={`Pending (${loading ? '-' : pendingCount})`} />
              <Tab label={`Completed (${loading ? '-' : completedCount})`} />
            </Tabs>
          </Box>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by patient name, ID, prescription number, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Showing {filteredPrescriptions.length} prescriptions
            </Typography>

            {loading ? (
              <Box textAlign="center" py={6}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Loading prescriptions...
                </Typography>
              </Box>
            ) : filteredPrescriptions.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary">
                  No prescriptions found
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredPrescriptions.map((prescription, index) => {
                  const statusConfig = getStatusConfig(prescription.status);
                  return (
                    <React.Fragment key={prescription.id}>
                      <ListItem
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: '#fafafa',
                          cursor: 'pointer',
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
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                            <MedicalIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2} mb={0.5}>
                              <Typography variant="h6" fontWeight="600">
                                {prescription.patientName}
                              </Typography>
                              <Chip 
                                {...statusConfig}
                                label={statusConfig.label}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Grid container spacing={2} mt={0.5}>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Prescription ID
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {prescription.id}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Patient ID
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {prescription.patientId}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Doctor
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {prescription.doctorName}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Date & Time
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {prescription.date} {prescription.time}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Chip 
                                  label={`${prescription.medications.length} medication${prescription.medications.length > 1 ? 's' : ''}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                          }
                        />
                        <IconButton>
                          <VisibilityIcon />
                        </IconButton>
                      </ListItem>
                      {index < filteredPrescriptions.length - 1 && <Box sx={{ height: 8 }} />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Prescription Details Modal */}
        <PrescriptionDetailsModal
          open={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          prescription={selectedPrescription}
          onDispense={handleDispensePrescription}
        />
      </Container>
    </Layout>
  );
};

export default PrescriptionsManagement;
