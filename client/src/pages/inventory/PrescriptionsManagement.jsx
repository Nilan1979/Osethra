import React, { useState } from 'react';
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

const PrescriptionsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

  const [prescriptions] = useState([
    {
      id: 'RX-2025-001',
      patientName: 'Amal Perera',
      patientId: 'PT-12345',
      doctorName: 'Dr. Sunil Fernando',
      date: '2025-10-02',
      time: '09:30 AM',
      status: 'pending',
      medications: [
        { name: 'Amoxicillin 500mg', dosage: '3 times daily', quantity: 21, duration: '7 days' },
        { name: 'Paracetamol 500mg', dosage: 'As needed', quantity: 10, duration: '5 days' },
        { name: 'Vitamin C 1000mg', dosage: '1 daily', quantity: 30, duration: '30 days' },
      ]
    },
    {
      id: 'RX-2025-002',
      patientName: 'Nimal Silva',
      patientId: 'PT-12346',
      doctorName: 'Dr. Kamala Wijesinghe',
      date: '2025-10-02',
      time: '10:15 AM',
      status: 'pending',
      medications: [
        { name: 'Metformin 500mg', dosage: '2 times daily', quantity: 60, duration: '30 days' },
        { name: 'Atorvastatin 20mg', dosage: '1 at night', quantity: 30, duration: '30 days' },
      ]
    },
    {
      id: 'RX-2025-003',
      patientName: 'Shalini Jayawardena',
      patientId: 'PT-12347',
      doctorName: 'Dr. Ranjith Kumar',
      date: '2025-10-02',
      time: '11:00 AM',
      status: 'completed',
      medications: [
        { name: 'Ibuprofen 400mg', dosage: '3 times daily', quantity: 15, duration: '5 days' },
        { name: 'Omeprazole 20mg', dosage: '1 before breakfast', quantity: 14, duration: '14 days' },
      ]
    },
    {
      id: 'RX-2025-004',
      patientName: 'Rohan Mendis',
      patientId: 'PT-12348',
      doctorName: 'Dr. Sunil Fernando',
      date: '2025-10-02',
      time: '11:45 AM',
      status: 'pending',
      medications: [
        { name: 'Cephalexin 500mg', dosage: '4 times daily', quantity: 28, duration: '7 days' },
        { name: 'Cetirizine 10mg', dosage: '1 at night', quantity: 7, duration: '7 days' },
      ]
    },
    {
      id: 'RX-2025-005',
      patientName: 'Kumari Dissanayake',
      patientId: 'PT-12349',
      doctorName: 'Dr. Kamala Wijesinghe',
      date: '2025-10-02',
      time: '01:20 PM',
      status: 'pending',
      medications: [
        { name: 'Losartan 50mg', dosage: '1 daily', quantity: 30, duration: '30 days' },
        { name: 'Aspirin 75mg', dosage: '1 daily', quantity: 30, duration: '30 days' },
        { name: 'Simvastatin 40mg', dosage: '1 at night', quantity: 30, duration: '30 days' },
      ]
    },
    {
      id: 'RX-2025-006',
      patientName: 'Chaminda Fernando',
      patientId: 'PT-12350',
      doctorName: 'Dr. Ranjith Kumar',
      date: '2025-10-01',
      time: '02:30 PM',
      status: 'completed',
      medications: [
        { name: 'Azithromycin 500mg', dosage: '1 daily', quantity: 3, duration: '3 days' },
      ]
    },
  ]);

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = 
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      activeTab === 0 || 
      (activeTab === 1 && prescription.status === 'pending') ||
      (activeTab === 2 && prescription.status === 'completed');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
      completed: { color: 'success', icon: <CompleteIcon />, label: 'Completed' },
      cancelled: { color: 'error', icon: <CancelledIcon />, label: 'Cancelled' },
    };
    return configs[status] || configs.pending;
  };

  const handleDispensePrescription = (prescription) => {
    navigate('/pharmacist/issues/new', { state: { prescription } });
  };

  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;
  const completedCount = prescriptions.filter(p => p.status === 'completed').length;

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
                      {prescriptions.length}
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
                      {pendingCount}
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
                      {completedCount}
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
              <Tab label={`All (${prescriptions.length})`} />
              <Tab label={`Pending (${pendingCount})`} />
              <Tab label={`Completed (${completedCount})`} />
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

            {filteredPrescriptions.length === 0 ? (
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
