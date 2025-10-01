import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Collapse
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandLess,
  ExpandMore,
  People as PeopleIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../UserProfile';
import Layout from '../Layout/Layout';
import axios from 'axios';

const UserDashboard = () => {
  const { logout, user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    address: '',
    password: ''
  });

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${user.id}`);
      setUserDetails(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        contactNo: response.data.contactNo,
        address: response.data.address,
        password: ''
      });
    } catch (error) {
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditMode(false);
    if (userDetails) {
      setFormData({
        name: userDetails.name,
        email: userDetails.email,
        contactNo: userDetails.contactNo,
        address: userDetails.address,
        password: ''
      });
    }
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        contactNo: formData.contactNo,
        address: formData.address
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        updateData.password = formData.password;
      }

      await axios.put(`/users/${user.id}`, updateData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
      fetchUserDetails(); // Refresh user details
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await axios.get(`/users/search?name=${encodeURIComponent(value)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(window.userSearchTimeout);
    window.userSearchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
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

  const handleViewProfile = (userData) => {
    setSelectedUser(userData);
    setProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedUser(null);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Welcome Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
          <CardContent sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  mr: 3, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 64, 
                  height: 64,
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Welcome, {userDetails?.name}!
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'inline-block'
                  }}
                >
                  {getRoleDisplayName(user.role)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Profile Information
            </Typography>
            {!editMode ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ borderRadius: 2 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ borderRadius: 2 }}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editMode}
                variant={editMode ? "outlined" : "filled"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editMode}
                variant={editMode ? "outlined" : "filled"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                disabled={!editMode}
                variant={editMode ? "outlined" : "filled"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                value={getRoleDisplayName(userDetails?.role || '')}
                disabled
                variant="filled"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                disabled={!editMode}
                variant={editMode ? "outlined" : "filled"}
              />
            </Grid>
            {editMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password (leave blank to keep current)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Enter a new password only if you want to change it"
                />
              </Grid>
            )}
          </Grid>

          {userDetails && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="textSecondary">
                Account created: {new Date(userDetails.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated: {new Date(userDetails.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Paper>
        {/* Search Other Users */}
        <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }} onClick={() => setShowSearch(!showSearch)}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', flexGrow: 1 }}>
                Search Colleagues
              </Typography>
              {showSearch ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={showSearch}>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for colleagues by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                {searchLoading && (
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Searching...
                  </Typography>
                )}

                {searchResults.length > 0 && (
                  <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                    <List>
                      {searchResults.map((colleague) => (
                        <ListItem key={colleague._id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: getRoleColor(colleague.role) }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={colleague.name}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={getRoleDisplayName(colleague.role)}
                                  size="small"
                                  sx={{
                                    backgroundColor: getRoleColor(colleague.role),
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                  {colleague.email}
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleViewProfile(colleague)}
                            sx={{ ml: 1, color: 'primary.main' }}
                            title="View Profile"
                          >
                            <ViewIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}

                {searchTerm && !searchLoading && searchResults.length === 0 && (
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}>
                    No colleagues found with that name.
                  </Typography>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* User Profile Dialog */}
        <UserProfile
          open={profileDialogOpen}
          onClose={handleCloseProfile}
          user={selectedUser}
        />
      </Container>
    </Layout>
  );
};

export default UserDashboard;