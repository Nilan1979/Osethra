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
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Inventory as InventoryIcon,
    ShoppingCart as CartIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import inventoryAPI from '../../api/inventory';

const ActivityLogs = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [totalActivities, setTotalActivities] = useState(0);

    const activityTypes = [
        { value: 'all', label: 'All Activities' },
        { value: 'product_added', label: 'Product Added' },
        { value: 'product_updated', label: 'Product Updated' },
        { value: 'product_deleted', label: 'Product Deleted' },
        { value: 'issue_created', label: 'Issue Created' },
        { value: 'stock_adjusted', label: 'Stock Adjusted' },
        { value: 'category_added', label: 'Category Added' },
        { value: 'category_deleted', label: 'Category Deleted' },
        { value: 'prescription_dispensed', label: 'Prescription Dispensed' },
    ];

    const fetchActivities = async () => {
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

            if (filterType && filterType !== 'all') {
                params.type = filterType;
            }

            const response = await inventoryAPI.dashboard.getRecentActivities(params);
            const data = response.data || response;

            setActivities(data.activities || []);
            setTotalActivities(data.total || 0);
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError(err.response?.data?.message || 'Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, filterType]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = () => {
        setPage(0);
        fetchActivities();
    };

    const handleRefresh = () => {
        setPage(0);
        setSearchTerm('');
        setFilterType('all');
        fetchActivities();
    };

    const getActivityIcon = (type) => {
        const iconMap = {
            product_added: <AddIcon color="success" />,
            product_updated: <EditIcon color="primary" />,
            product_deleted: <DeleteIcon color="error" />,
            issue_created: <CartIcon color="info" />,
            stock_adjusted: <InventoryIcon color="warning" />,
            category_added: <AddIcon color="success" />,
            category_deleted: <DeleteIcon color="error" />,
        };
        return iconMap[type] || <InventoryIcon />;
    };

    const getActivityColor = (type) => {
        const colorMap = {
            product_added: 'success',
            product_updated: 'primary',
            product_deleted: 'error',
            issue_created: 'info',
            stock_adjusted: 'warning',
            category_added: 'success',
            category_deleted: 'error',
        };
        return colorMap[type] || 'default';
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

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const stats = [
        {
            title: 'Total Activities',
            value: totalActivities,
            color: '#2e7d32',
            icon: <InventoryIcon />,
        },
        {
            title: 'Today',
            value: activities.filter(a => {
                const activityDate = new Date(a.timestamp || a.createdAt);
                const today = new Date();
                return activityDate.toDateString() === today.toDateString();
            }).length,
            color: '#1976d2',
            icon: <PersonIcon />,
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
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: 'white',
                        borderRadius: 3,
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Activity Logs
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                View all system activities and changes
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
                        <Grid item xs={12} sm={6} md={3} key={index}>
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
                                placeholder="Search activities..."
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
                                label="Filter by Type"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FilterIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {activityTypes.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="body2" color="text.secondary">
                                {totalActivities} total activities
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

                {/* Activity Table */}
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : activities.length === 0 ? (
                        <Box p={4} textAlign="center">
                            <Typography variant="body1" color="text.secondary">
                                No activities found
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>User</TableCell>
                                            <TableCell>Entity</TableCell>
                                            <TableCell>Date & Time</TableCell>
                                            <TableCell>Time Ago</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activities.map((activity) => (
                                            <TableRow key={activity._id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        {getActivityIcon(activity.type)}
                                                        <Chip
                                                            label={activity.type.replace(/_/g, ' ').toUpperCase()}
                                                            size="small"
                                                            color={getActivityColor(activity.type)}
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {activity.description || activity.message || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <PersonIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {activity.user?.name || 'System'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {activity.entityType || 'N/A'}
                                                        {activity.entityName && (
                                                            <Typography variant="caption" display="block">
                                                                {activity.entityName}
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(activity.timestamp || activity.createdAt)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getTimeAgo(activity.timestamp || activity.createdAt)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalActivities}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </Paper>
            </Container>
        </Layout>
    );
};

export default ActivityLogs;
