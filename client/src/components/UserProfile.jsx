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
  Tooltip
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
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import axios from 'axios';
import { saveAs } from 'file-saver';

const UserProfile = ({ open, onClose, userId, userName }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      const response = await axios.get(`/users/${userId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileName = `${user.name.replace(/\s+/g, '_')}_profile_${new Date().toISOString().split('T')[0]}.pdf`;
      saveAs(blob, fileName);
    } catch (error) {
      setError('Failed to generate PDF');
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
            <Typography>Loading user details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="error">{error}</Typography>
          </Box>
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
                {user.name}
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
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Address"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contact Number"
                      secondary={user.contactNo}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={user.address}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
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

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Account Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="User ID"
                      secondary={user._id}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Created"
                      secondary={new Date(user.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <UpdateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={new Date(user.updatedAt).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Account Status"
                      secondary={
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>


        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          sx={{ mr: 1 }}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Profile PDF'}
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile;