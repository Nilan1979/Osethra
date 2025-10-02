import React from 'react';
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
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';

const PrescriptionDetailsModal = ({ open, onClose, prescription, onDispense }) => {
  if (!prescription) return null;

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
          <Typography variant="h6" fontWeight="bold">
            Prescription Details
          </Typography>
          <Chip 
            label={prescription.id} 
            size="small" 
            sx={{ bgcolor: 'white', color: '#2e7d32', fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
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
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
        <Button 
          onClick={() => {
            onDispense(prescription);
            onClose();
          }} 
          variant="contained" 
          color="primary"
          startIcon={<MedicalIcon />}
        >
          Dispense Medication
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionDetailsModal;
