import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  ContactEmergency as EmergencyIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import { saveAs } from 'file-saver';

const UserProfile = ({ open, onClose, userId, userName }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      setPdfError('');
      setPdfSuccess(false);
      
      const response = await api.get(`/users/${userId}/pdf`, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout for PDF generation
      });
      
      // Check response headers
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response type: ' + contentType);
      }
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const fileName = `${(user.fullName || user.name || 'user').replace(/\s+/g, '_')}_profile_${new Date().toISOString().split('T')[0]}.pdf`;
      saveAs(blob, fileName);
      setPdfSuccess(true);
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfError(
        error.response?.data?.message || 
        error.message || 
        'Failed to generate PDF. Please try again.'
      );
      
      // Log detailed error information
      if (error.response) {
        console.error('Error response:', error.response);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'admin': '#f44336',
      'doctor': '#2196f3',
      'nurse': '#4caf50',
      'pharmacist': '#ff9800',
      'receptionist': '#9c27b0'
    };
    return colorMap[role] || '#757575';
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'receptionist': 'Receptionist',
      'doctor': 'Doctor',
      'pharmacist': 'Pharmacist',
      'nurse': 'Nurse'
    };
    return roleMap[role] || role;
  };

  const getRoleResponsibilities = (role) => {
    const responsibilities = {
      admin: [
        'System administration and user management',
        'Access control and security oversight',
        'Generate reports and analytics'
      ],
      doctor: [
        'Patient diagnosis and treatment',
        'Medical record management',
        'Prescription and medication orders'
      ],
      nurse: [
        'Patient care and monitoring',
        'Medication administration',
        'Coordination with medical team'
      ],
      receptionist: [
        'Patient appointment scheduling',
        'Front desk operations management',
        'Patient registration and check-in'
      ],
      pharmacist: [
        'Medication dispensing and verification',
        'Drug interaction checking',
        'Inventory management'
      ]
    };
    return responsibilities[role] || ['General healthcare support'];
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                bgcolor: getRoleColor(user.role),
                mr: 2,
                width: 50,
                height: 50
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {user.fullName || user.name}
              </Typography>
              <Chip
                label={getRoleDisplayName(user.role)}
                sx={{
                  bgcolor: getRoleColor(user.role),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
          <Box>
            <Tooltip title="Download Profile PDF">
              <IconButton
                color="primary"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                sx={{ mr: 1 }}
              >
                <PdfIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {pdfError && (
          <Alert severity="error" sx={{ mb: 2 }}>{pdfError}</Alert>
        )}
        {pdfSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>PDF downloaded successfully!</Alert>
        )}

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="NIC"
                      secondary={user.nic || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={user.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Contact Number"
                      secondary={user.contactNo || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CakeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date of Birth"
                      secondary={user.dob ? new Date(user.dob).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Address"
                      secondary={user.address || 'N/A'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Professional Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Department"
                      secondary={user.department || 'N/A'}
                    />
                  </ListItem>
                  {user.role === 'doctor' && (
                    <ListItem>
                      <ListItemIcon>
                        <AssignmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Specialty"
                        secondary={user.specialty || 'N/A'}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Joined Date"
                      secondary={new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <UpdateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Updated"
                      secondary={new Date(user.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Role"
                      secondary={getRoleDisplayName(user.role)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Emergency Contact */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Emergency Contact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <EmergencyIcon color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Emergency Contact Name"
                          secondary={user.emergencyContactName || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Emergency Contact Number"
                          secondary={user.emergencyContactNo || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleDownloadPDF} 
          disabled={pdfLoading}
          startIcon={pdfLoading ? <CircularProgress size={20} /> : <PdfIcon />}
          variant="contained"
          color="primary"
          sx={{ mr: 1 }}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Profile PDF'}
        </Button>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile;