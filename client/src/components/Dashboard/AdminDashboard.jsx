import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  IconButton,
  Card,
  CardContent,
  InputAdornment,
  Stack 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../UserProfile';
import Layout from '../Layout/Layout';
import axios from 'axios';
import { saveAs } from 'file-saver';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'nurse', label: 'Nurse' }
];

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    doctors: 0,
    nurses: 0,
    receptionists: 0,
    pharmacists: 0
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNo: '',
    address: '',
    role: 'receptionist',
    password: '',
    gender: '',
    dob: '',
    nic: '',
    maritalStatus: '',
    department: '',
    specialty: '',
    emergencyContactName: '',
    emergencyContactNo: ''
  });

  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    contactNo: '',
    address: '',
    role: '',
    password: '',
    gender: '',
    dob: '',
    nic: '',
    maritalStatus: '',
    department: '',
    specialty: '',
    emergencyContactName: '',
    emergencyContactNo: ''
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) {
          return 'Name must be between 2-50 characters and contain only letters';
        }
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        break;
      case 'contactNo':
        if (!value.trim()) return 'Contact number is required';
        if (!/^[0-9]{10}$/.test(value.trim())) {
          return 'Contact number must be 10 digits';
        }
        break;
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 5) {
          return 'Address must be at least 5 characters long';
        }
        break;
      case 'password':
        if (!editingUser && !value) return 'Password is required for new users';
        if (value && value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        break;
      case 'emergencyContactNo':
        if (value && !/^[0-9]{10}$/.test(value.trim())) {
          return 'Emergency contact must be 10 digits';
        }
        break;
      case 'nic':
        if (value && !/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(value.trim())) {
          return 'Invalid NIC format';
        }
        break;
      case 'specialty':
        // Specialty is required only for doctors
        if (formData.role === 'doctor' && !value.trim()) {
          return 'Specialty is required for doctors';
        }
        if (value && value.trim().length < 2) {
          return 'Specialty must be at least 2 characters';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      const url = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
      const response = await axios.get(url);
      setUsers(response.data);
      calculateStats(response.data);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const stats = {
      total: usersData.length,
      admins: usersData.filter(u => u.role === 'admin').length,
      doctors: usersData.filter(u => u.role === 'doctor').length,
      nurses: usersData.filter(u => u.role === 'nurse').length,
      receptionists: usersData.filter(u => u.role === 'receptionist').length,
      pharmacists: usersData.filter(u => u.role === 'pharmacist').length
    };
    setStats(stats);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        contactNo: user.contactNo || '',
        address: user.address || '',
        role: user.role || 'receptionist',
        password: '',
        gender: user.gender || '',
        dob: user.dob || '',
        nic: user.nic || '',
        maritalStatus: user.maritalStatus || '',
        department: user.department || '',
        specialty: user.specialty || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactNo: user.emergencyContactNo || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        contactNo: '',
        address: '',
        role: 'receptionist',
        password: '',
        gender: '',
        dob: '',
        nic: '',
        maritalStatus: '',
        department: '',
        specialty: '',
        emergencyContactName: '',
        emergencyContactNo: ''
      });
    }
    setFormErrors({
      fullName: '',
      email: '',
      contactNo: '',
      address: '',
      role: '',
      password: '',
      gender: '',
      dob: '',
      nic: '',
      maritalStatus: '',
      department: '',
      emergencyContactName: '',
      emergencyContactNo: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field in real-time
    const fieldError = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(field => {
      if (field === 'password' && editingUser && !formData[field]) {
        
        return;
      }
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Update form errors
    setFormErrors(errors);

    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setError('Please fix all validation errors before submitting.');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(`/users/${editingUser._id}`, updateData);
        setSuccess('User updated successfully');
      } else {
        // Create user
        await axios.post('/users', formData);
        setSuccess('User created successfully');
      }
      
      fetchUsers(searchTerm);
      setTimeout(() => {
        handleCloseDialog();
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${userId}`);
        setSuccess('User deleted successfully');
        fetchUsers(searchTerm);
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete user');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search - wait 500ms after user stops typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchUsers(value);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchUsers('');
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      const response = await axios.get('/users/pdf', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `users-report-${new Date().toISOString().split('T')[0]}.pdf`);
      setSuccess('PDF downloaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to generate PDF');
      setTimeout(() => setError(''), 3000);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUserId(user._id);
    setSelectedUserName(user.name);
    setProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  const columns = [
    { field: 'fullName', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'contactNo', headerName: 'Contact', width: 130 },
    { field: 'role', headerName: 'Role', width: 120 },
    { 
      field: 'specialty', 
      headerName: 'Specialty', 
      width: 150,
      renderCell: (params) => (
        params.row.role === 'doctor' ? (params.row.specialty || 'N/A') : '-'
      )
    },
    { field: 'address', headerName: 'Address', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="info"
            onClick={() => handleViewProfile(params.row)}
            size="small"
            className="action-button"
            title="View Profile"
            sx={{ 
              '&:hover': { 
                backgroundColor: 'info.main', 
                color: 'white' 
              } 
            }}
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
            size="small"
            className="action-button"
            title="Edit User"
            sx={{ 
              '&:hover': { 
                backgroundColor: 'primary.main', 
                color: 'white' 
              } 
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}
            size="small"
            className="action-button"
            title="Delete User"
            sx={{ 
              '&:hover': { 
                backgroundColor: 'error.main', 
                color: 'white' 
              } 
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card className="stats-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4" color="primary">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card className="stats-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Doctors
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.doctors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card className="stats-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Nurses
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.nurses}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card className="stats-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Receptionists
                </Typography>
                <Typography variant="h4" color="secondary.main">
                  {stats.receptionists}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card className="stats-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pharmacists
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pharmacists}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card className="stats-card">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Admins
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.admins}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" startIcon={<PeopleIcon />}>
              User Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                sx={{ borderRadius: 2 }}
              >
                {pdfLoading ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ borderRadius: 2 }}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={handleSearch}
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
          </Box>

          <div style={{ height: 400, width: '100%' }} className="data-grid-container">
            <DataGrid
              rows={users}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              getRowId={(row) => row._id}
              loading={loading}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </div>
        </Paper>

        {/* Add/Edit User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
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

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                />
                
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
                
                <TextField
                  required
                  fullWidth
                  name="contactNo"
                  label="Contact Number"
                  value={formData.contactNo}
                  onChange={handleChange}
                  error={!!formErrors.contactNo}
                  helperText={formErrors.contactNo}
                />
                
                <TextField
                  select
                  required
                  fullWidth
                  name="role"
                  label="Role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Specialty field - only show for doctors */}
                {formData.role === 'doctor' && (
                  <TextField
                    required
                    fullWidth
                    name="specialty"
                    label="Specialty"
                    placeholder="e.g., Cardiology, Pediatrics, Orthopedics"
                    value={formData.specialty}
                    onChange={handleChange}
                    error={!!formErrors.specialty}
                    helperText={formErrors.specialty || "Enter doctor's area of specialization"}
                  />
                )}
                
                <TextField
                  required
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                />
                
                <TextField
                  fullWidth
                  name="password"
                  label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />

                <TextField
                  fullWidth
                  name="gender"
                  label="Gender"
                  select
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  name="nic"
                  label="NIC Number"
                  value={formData.nic}
                  onChange={handleChange}
                  error={!!formErrors.nic}
                  helperText={formErrors.nic}
                />

                <TextField
                  fullWidth
                  name="maritalStatus"
                  label="Marital Status"
                  select
                  value={formData.maritalStatus}
                  onChange={handleChange}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem>
                  <MenuItem value="widowed">Widowed</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  name="department"
                  label="Department"
                  value={formData.department}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  name="emergencyContactName"
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  name="emergencyContactNo"
                  label="Emergency Contact Number"
                  value={formData.emergencyContactNo}
                  onChange={handleChange}
                  error={!!formErrors.emergencyContactNo}
                  helperText={formErrors.emergencyContactNo}
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Profile Dialog */}
        <UserProfile
          open={profileDialogOpen}
          onClose={handleCloseProfile}
          userId={selectedUserId}
          userName={selectedUserName}
        />
      </Container>
    </Layout>
  );
};

export default AdminDashboard;