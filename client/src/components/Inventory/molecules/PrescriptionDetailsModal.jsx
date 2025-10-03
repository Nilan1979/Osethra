import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Grid,
  Chip,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
  Undo as UndoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const PrescriptionDetailsModal = ({ open, onClose, prescription, onDispense, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!prescription) return null;

  const isPending = prescription.status === 'pending';
  const isCompleted = prescription.status === 'completed';

  const handleDispense = async () => {
    setLoading(true);
    setError(null);
    try {
      await onDispense(prescription);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to dispense prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = isCompleted ? 'pending' : 'completed';
      await onStatusChange(prescription._id, newStatus);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = () => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning', bgcolor: '#fff3e0', textColor: '#e65100' },
      completed: { label: 'Completed', color: 'success', bgcolor: '#e8f5e9', textColor: '#2e7d32' },
      cancelled: { label: 'Cancelled', color: 'error', bgcolor: '#ffebee', textColor: '#c62828' },
      partial: { label: 'Partial', color: 'info', bgcolor: '#e3f2fd', textColor: '#1565c0' },
    };

    const config = statusConfig[prescription.status] || statusConfig.pending;

    return (
      <Chip 
        label={config.label}
        size="small" 
        sx={{ 
          bgcolor: config.bgcolor, 
          color: config.textColor, 
          fontWeight: 600,
          border: `1px solid ${config.textColor}`
        }}
      />
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white', py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography component="span" variant="h6" fontWeight="bold">
            Prescription Details
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            {getStatusChip()}
            <Chip 
              label={prescription.id} 
              size="small" 
              sx={{ bgcolor: 'white', color: '#2e7d32', fontWeight: 600 }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {/* Patient & Doctor Info */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Patient Information
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600">
                {prescription.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {prescription.patientId}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <DoctorIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Prescribed By
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600">
                {prescription.doctorName}
              </Typography>
              <Box display="flex" gap={2} mt={0.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {prescription.date}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {prescription.time}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ mb: 2 }} />

        {/* Medications List */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <MedicalIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Prescribed Medications
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Medication</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dosage</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescription.medications.map((med, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {med.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {med.dosage}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={med.quantity} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {med.duration}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Summary */}
        <Box mt={2} p={2} bgcolor="#e3f2fd" borderRadius={2}>
          <Typography variant="body2" fontWeight="600" color="primary">
            Total Medications: {prescription.medications.length} items
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={loading}>
          Close
        </Button>
        
        {isCompleted && (
          <Button 
            onClick={handleToggleStatus}
            variant="outlined"
            color="warning"
            startIcon={loading ? <CircularProgress size={16} /> : <UndoIcon />}
            disabled={loading}
          >
            Revert to Pending
          </Button>
        )}
        
        {isPending && (
          <>
            <Button 
              onClick={handleToggleStatus}
              variant="outlined"
              color="success"
              startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
              disabled={loading}
            >
              Mark as Completed
            </Button>
            <Button 
              onClick={handleDispense}
              variant="contained" 
              color="primary"
              startIcon={loading ? <CircularProgress size={16} /> : <MedicalIcon />}
              disabled={loading}
            >
              Dispense & Print Bill
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionDetailsModal;
