import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    TablePagination,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import {
    History as HistoryIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    SwapHoriz as SwapHorizIcon,
    MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { productsAPI } from '../../api/inventory';

const ProductHistory = ({ open, onClose, productId, productName }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        type: '',
        startDate: '',
        endDate: ''
    });

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                ...(filters.type && { type: filters.type }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            };

            const response = await productsAPI.getProductHistory(productId, params);
            
            if (response.success) {
                setHistoryData(response.data);
            } else {
                setError(response.message || 'Failed to fetch history');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching product history');
            console.error('Error fetching product history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && productId) {
            fetchHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, productId, page, rowsPerPage, filters]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0); // Reset to first page when filtering
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'issue':
                return 'error';
            case 'return':
                return 'success';
            case 'adjustment':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'issue':
                return <TrendingDownIcon fontSize="small" />;
            case 'return':
                return <TrendingUpIcon fontSize="small" />;
            case 'adjustment':
                return <SwapHorizIcon fontSize="small" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `LKR ${amount?.toFixed(2) || '0.00'}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <HistoryIcon />
                    <Typography variant="h6">
                        Product Order History
                    </Typography>
                </Box>
                {productName && (
                    <Typography variant="subtitle2" color="text.secondary">
                        {productName}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent dividers>
                {/* Statistics Cards */}
                {historyData?.stats && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" variant="body2">
                                        Total Transactions
                                    </Typography>
                                    <Typography variant="h5">
                                        {historyData.stats.totalTransactions}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" variant="body2">
                                        Total Issued
                                    </Typography>
                                    <Typography variant="h5" color="error">
                                        {historyData.stats.totalQuantityIssued}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" variant="body2">
                                        Total Returned
                                    </Typography>
                                    <Typography variant="h5" color="success.main">
                                        {historyData.stats.totalQuantityReturned}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <MoneyIcon color="primary" />
                                        <Box>
                                            <Typography color="text.secondary" variant="body2">
                                                Total Revenue
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                {formatCurrency(historyData.stats.totalRevenue)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.type}
                                label="Type"
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <MenuItem value="">All Types</MenuItem>
                                <MenuItem value="issue">Issue</MenuItem>
                                <MenuItem value="return">Return</MenuItem>
                                <MenuItem value="adjustment">Adjustment</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Start Date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="End Date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>

                {/* Loading State */}
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* History Table */}
                {!loading && !error && historyData && (
                    <>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell><strong>Issue #</strong></TableCell>
                                        <TableCell align="right"><strong>Quantity</strong></TableCell>
                                        <TableCell align="right"><strong>Unit Price</strong></TableCell>
                                        <TableCell align="right"><strong>Total</strong></TableCell>
                                        <TableCell><strong>Issued To</strong></TableCell>
                                        <TableCell><strong>Issued By</strong></TableCell>
                                        <TableCell><strong>Notes</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyData.history && historyData.history.length > 0 ? (
                                        historyData.history.map((record, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>{formatDate(record.date)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getTypeIcon(record.type)}
                                                        label={record.type?.toUpperCase()}
                                                        color={getTypeColor(record.type)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        {record.issueNumber || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography 
                                                        variant="body2" 
                                                        color={record.type === 'issue' ? 'error' : 'success.main'}
                                                        fontWeight="bold"
                                                    >
                                                        {record.type === 'issue' ? '-' : '+'}{record.quantity}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(record.unitPrice)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {formatCurrency(record.totalPrice)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{record.issuedTo || '-'}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {record.issuedBy?.name || '-'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {record.issuedBy?.role || ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {record.notes || '-'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                <Typography variant="body2" color="text.secondary" py={3}>
                                                    No transaction history found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {historyData.pagination && (
                            <TablePagination
                                component="div"
                                count={historyData.pagination.totalItems}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                            />
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductHistory;
