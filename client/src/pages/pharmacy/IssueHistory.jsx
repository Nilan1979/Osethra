import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    InputAdornment,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    ShoppingCart as CartIcon,
    Person as PersonIcon,
    CalendarMonth as CalendarIcon,
    Visibility as ViewIcon,
    LocalHospital as HospitalIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import inventoryAPI from '../../api/inventory';

const IssueHistory = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [totalIssues, setTotalIssues] = useState(0);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const fetchIssues = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: page + 1,
                limit: rowsPerPage,
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await inventoryAPI.issues.getAll(params);
            const data = response.data || response;

            setIssues(data.issues || []);
            setTotalIssues(data.total || 0);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError(err.response?.data?.message || 'Failed to load issue history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, filterStatus]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        fetchIssues();
    };

    const handleRefresh = () => {
        setPage(0);
        setSearchTerm('');
        setFilterStatus('all');
        fetchIssues();
    };

    const handleViewDetails = (issue) => {
        setSelectedIssue(issue);
        setOpenDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedIssue(null);
    };

    const getStatusColor = (status) => {
        const colorMap = {
            completed: 'success',
            pending: 'warning',
            cancelled: 'error',
            dispensed: 'success',
        };
        return colorMap[status?.toLowerCase()] || 'default';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateTotalValue = (items) => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((sum, item) => {
            // Use totalPrice if available, otherwise calculate from unitPrice * quantity
            const itemTotal = item.totalPrice || (item.unitPrice || item.product?.price || item.price || 0) * (item.quantity || 0);
            return sum + itemTotal;
        }, 0);
    };

    const stats = [
        {
            title: 'Total Issues',
            value: totalIssues,
            color: '#2e7d32',
            icon: <CartIcon />,
        },
        {
            title: 'Completed',
            value: issues.filter(i => i.status?.toLowerCase() === 'completed').length,
            color: '#1976d2',
            icon: <HospitalIcon />,
        },
        {
            title: 'This Month',
            value: issues.filter(i => {
                const issueDate = new Date(i.issueDate || i.createdAt);
                const now = new Date();
                return issueDate.getMonth() === now.getMonth() &&
                    issueDate.getFullYear() === now.getFullYear();
            }).length,
            color: '#ed6c02',
            icon: <CalendarIcon />,
        },
    ];

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
                        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                        color: 'white',
                        borderRadius: 3,
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Issue History
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                View all past product issues and dispensing records
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                            <IconButton
                                onClick={handleRefresh}
                                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                            >
                                <RefreshIcon />
                            </IconButton>
                            <IconButton
                                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>

                {/* Stats Cards */}
                <Grid container spacing={3} mb={3}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                bgcolor: `${stat.color}20`,
                                                color: stat.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {stat.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="h4" fontWeight="600">
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stat.title}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Filters */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by patient name, issue ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                select
                                size="small"
                                label="Filter by Status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FilterIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="body2" color="text.secondary">
                                {totalIssues} total issues
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Issues Table */}
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : issues.length === 0 ? (
                        <Box p={4} textAlign="center">
                            <Typography variant="body1" color="text.secondary">
                                No issues found
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Issue ID</TableCell>
                                            <TableCell>Patient/Department</TableCell>
                                            <TableCell>Products</TableCell>
                                            <TableCell>Total Value</TableCell>
                                            <TableCell>Issued By</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {issues.map((issue) => (
                                            <TableRow key={issue._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {issue.issueId || issue._id.slice(-8).toUpperCase()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <PersonIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {issue.patient?.name || issue.department?.name || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <InventoryIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {issue.items?.length || 0} item{(issue.items?.length || 0) !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600" color="primary">
                                                        Rs. {calculateTotalValue(issue.items).toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {issue.issuedBy?.name || 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(issue.issueDate || issue.createdAt)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={issue.status || 'Completed'}
                                                        size="small"
                                                        color={getStatusColor(issue.status)}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleViewDetails(issue)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalIssues}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </Paper>

                {/* Issue Details Dialog */}
                <Dialog
                    open={openDetailsDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">
                                Issue Details
                            </Typography>
                            <Chip
                                label={selectedIssue?.status || 'Completed'}
                                color={getStatusColor(selectedIssue?.status)}
                                size="small"
                            />
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedIssue && (
                            <Box>
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Issue ID
                                        </Typography>
                                        <Typography variant="body1" fontWeight="600">
                                            {selectedIssue.issueId || selectedIssue._id.slice(-8).toUpperCase()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedIssue.issueDate || selectedIssue.createdAt)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Patient/Department
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedIssue.patient?.name || selectedIssue.department?.name || 'N/A'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Issued By
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedIssue.issuedBy?.name || 'Unknown'}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                    Products Issued:
                                </Typography>
                                <List dense>
                                    {selectedIssue.items?.map((item, index) => (
                                        <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="600">
                                                            {item.product?.name || item.productName || 'Unknown Product'}
                                                        </Typography>
                                                        <Typography variant="body2" color="primary" fontWeight="600">
                                                            Rs. {(item.totalPrice || (item.unitPrice || item.product?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Quantity: {item.quantity || 0} × Rs. {(item.unitPrice || item.product?.price || item.price || 0).toFixed(2)}
                                                        </Typography>
                                                        {item.batchNumber && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Batch: {item.batchNumber}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                <Divider sx={{ my: 2 }} />

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" fontWeight="600">
                                        Total Value:
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        Rs. {calculateTotalValue(selectedIssue.items).toFixed(2)}
                                    </Typography>
                                </Box>

                                {selectedIssue.notes && (
                                    <Box mt={2}>
                                        <Typography variant="caption" color="text.secondary">
                                            Notes:
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedIssue.notes}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default IssueHistory;
