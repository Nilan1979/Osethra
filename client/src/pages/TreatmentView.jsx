import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Person,
  LocalHospital,
  Description,
  Medication,
  Warning,
  Download,
  PictureAsPdf
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import axios from 'axios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TreatmentView = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [treatment, setTreatment] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Safe date formatting utility
  const formatSafeDate = (dateValue, formatString = 'MMM dd, yyyy') => {
    if (!dateValue) return 'N/A';
    try {
      return format(new Date(dateValue), formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    // Get appointment data from location state
    if (location.state?.appointment) {
      setAppointmentData(location.state.appointment);
    }
    
    if (appointmentId) {
      fetchTreatment();
    } else {
      setError('No appointment ID provided');
      setLoading(false);
    }
  }, [appointmentId, location.state]);

  const fetchTreatment = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/treatments/appointment/${appointmentId}`);
      setTreatment(response.data.data);
      
      // If we don't have appointment data from state, get it from the treatment
      if (!appointmentData && response.data.data.appointmentId) {
        const appointmentResponse = await axios.get(`http://localhost:5000/appointments/${response.data.data.appointmentId._id}`);
        setAppointmentData(appointmentResponse.data);
      }
    } catch (err) {
      console.error('Error fetching treatment:', err);
      if (err.response?.status === 404) {
        setError('No treatment found for this appointment. This appointment may have been marked as completed without creating a treatment record.');
      } else {
        setError('Failed to load treatment data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    if (!treatment) {
      setError('No treatment data available to update');
      return;
    }
    
    // Navigate to update treatment page
    navigate(`/update-treatment/${treatment._id}`, {
      state: { 
        treatment, 
        appointment: appointmentData 
      }
    });
  };

  const handleDelete = async () => {
    if (!treatment) {
      setError('No treatment data available to delete');
      return;
    }
    
    setDeleting(true);
    setError(''); // Clear any previous errors
    
    try {
      // Delete the treatment
      const deleteResponse = await axios.delete(`http://localhost:5000/api/treatments/${treatment._id}`);
      
      if (deleteResponse.status === 200) {
        // Update appointment status back to Scheduled
        if (appointmentData?._id) {
          try {
            await axios.put(`http://localhost:5000/appointments/${appointmentData._id}`, {
              ...appointmentData,
              status: 'Scheduled'
            });
          } catch (appointmentErr) {
            console.warn('Failed to update appointment status:', appointmentErr);
            // Continue with success message even if appointment update fails
          }
        }
        
        setSuccess('Treatment deleted successfully!');
        setDeleteDialogOpen(false);
        
        // Navigate back to dashboard after showing success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error('Failed to delete treatment');
      }
    } catch (err) {
      console.error('Error deleting treatment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete treatment. Please try again.';
      setError(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OSETHRA MEDICAL CENTER', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      const reportTitle = treatment ? 'Medical Treatment Report' : 'Appointment Summary Report';
      pdf.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Patient Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PATIENT INFORMATION', 20, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'normal');
      const patientInfo = treatment?.patientInfo || appointmentData;
      if (patientInfo) {
        pdf.text(`Name: ${patientInfo.name || 'N/A'}`, 20, yPos);
        yPos += 6;
        pdf.text(`Age: ${patientInfo.age || 'N/A'} years`, 20, yPos);
        yPos += 6;
        pdf.text(`Gender: ${patientInfo.gender || 'N/A'}`, 20, yPos);
        yPos += 6;
        pdf.text(`Contact: ${patientInfo.contact || 'N/A'}`, 20, yPos);
        yPos += 6;
        pdf.text(`Address: ${patientInfo.address || 'N/A'}`, 20, yPos);
        yPos += 10;
      }
      
      // Appointment Details
      pdf.setFont('helvetica', 'bold');
      pdf.text('APPOINTMENT DETAILS', 20, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Doctor: ${treatment?.doctorId?.name || user?.name || 'N/A'}`, 20, yPos);
      yPos += 6;
      pdf.text(`Date: ${appointmentData?.date ? formatSafeDate(appointmentData.date) : 'N/A'}`, 20, yPos);
      yPos += 6;
      pdf.text(`Time: ${appointmentData?.time || 'N/A'}`, 20, yPos);
      yPos += 6;
      pdf.text(`Status: ${appointmentData?.status || 'N/A'}`, 20, yPos);
      yPos += 6;
      if (appointmentData?.reason) {
        pdf.text(`Reason for Visit: ${appointmentData.reason}`, 20, yPos);
        yPos += 6;
      }
      if (treatment?.createdAt) {
        pdf.text(`Treatment Date: ${formatSafeDate(treatment.createdAt, 'MMM dd, yyyy at h:mm a')}`, 20, yPos);
        yPos += 6;
      }
      yPos += 5;
      
      // Only add treatment details if treatment exists
      if (treatment) {
        // Symptoms
        if (treatment.symptoms && treatment.symptoms.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('SYMPTOMS', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          treatment.symptoms.forEach((symptom, index) => {
            pdf.text(`• ${symptom}`, 25, yPos);
            yPos += 6;
          });
          yPos += 5;
        }
        
        // Diagnosis
        if (treatment.diagnosis) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('DIAGNOSIS', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          const diagnosisLines = pdf.splitTextToSize(treatment.diagnosis, pageWidth - 40);
          pdf.text(diagnosisLines, 20, yPos);
          yPos += diagnosisLines.length * 6 + 5;
        }
        
        // Treatment Plan
        if (treatment.treatmentPlan) {
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('TREATMENT PLAN', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          const treatmentLines = pdf.splitTextToSize(treatment.treatmentPlan, pageWidth - 40);
          pdf.text(treatmentLines, 20, yPos);
          yPos += treatmentLines.length * 6 + 5;
        }
        
        // Prescriptions
        if (treatment.prescriptions && treatment.prescriptions.length > 0) {
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('PRESCRIPTIONS', 20, yPos);
          yPos += 8;
          
          treatment.prescriptions.forEach((prescription, index) => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${index + 1}. ${prescription.medicineName}`, 25, yPos);
            yPos += 6;
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`   Dosage: ${prescription.dosage}`, 25, yPos);
            yPos += 5;
            pdf.text(`   Frequency: ${prescription.frequency}`, 25, yPos);
            yPos += 5;
            pdf.text(`   Duration: ${prescription.duration}`, 25, yPos);
            yPos += 5;
            if (prescription.instructions) {
              pdf.text(`   Instructions: ${prescription.instructions}`, 25, yPos);
              yPos += 5;
            }
            yPos += 3;
          });
          yPos += 5;
        }
        
        // Admission
        if (treatment.needsAdmission) {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('ADMISSION REQUIRED', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          const admissionLines = pdf.splitTextToSize(treatment.admissionReason, pageWidth - 40);
          pdf.text(admissionLines, 20, yPos);
          yPos += admissionLines.length * 6 + 5;
        }
        
        // Follow-up
        if (treatment.followUpDate) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('FOLLOW-UP APPOINTMENT', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Date: ${formatSafeDate(treatment.followUpDate)}`, 20, yPos);
          yPos += 10;
        }
      } else {
        // If no treatment, add a note
        pdf.setFont('helvetica', 'bold');
        pdf.text('TREATMENT STATUS', 20, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text('No treatment record has been created for this appointment yet.', 20, yPos);
        yPos += 6;
        if (appointmentData?.status === 'Completed') {
          pdf.text('This appointment has been marked as completed.', 20, yPos);
        }
      }
      
      // Footer
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = pageHeight - 30;
      } else {
        yPos = pageHeight - 30;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, yPos);
      pdf.text('Osethra Medical Center - Confidential Medical Record', pageWidth / 2, yPos, { align: 'center' });
      
      // Generate filename
      const patientName = (treatment?.patientInfo?.name || appointmentData?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
      const date = formatSafeDate(appointmentData?.date || new Date(), 'yyyy-MM-dd');
      const filename = treatment 
        ? `Treatment_Report_${patientName}_${date}.pdf`
        : `Appointment_Summary_${patientName}_${date}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error && !treatment) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
          
          {appointmentData && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appointment Information
              </Typography>
              <Typography><strong>Patient:</strong> {appointmentData.name}</Typography>
              <Typography><strong>Date:</strong> {appointmentData.date ? formatSafeDate(appointmentData.date) : 'N/A'}</Typography>
              <Typography><strong>Time:</strong> {appointmentData.time}</Typography>
              <Typography><strong>Status:</strong> {appointmentData.status}</Typography>
            </Paper>
          )}
          
          <Box display="flex" gap={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboard')}
              variant="outlined"
            >
              Back to Dashboard
            </Button>
            
            {appointmentData && (
              <Button
                startIcon={<PictureAsPdf />}
                onClick={handleDownloadPDF}
                variant="outlined"
                color="primary"
              >
                Download Appointment Summary
              </Button>
            )}
            
            {appointmentData && appointmentData.status === 'Completed' && (
              <Button
                onClick={() => navigate(`/add-treatment/${appointmentId}`, {
                  state: { appointment: appointmentData }
                })}
                variant="contained"
                color="primary"
              >
                Create Treatment Record
              </Button>
            )}
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              Treatment Details
            </Typography>
            <Box>
              <Button
                startIcon={<PictureAsPdf />}
                variant="contained"
                onClick={handleDownloadPDF}
                disabled={!treatment || loading}
                sx={{ mr: 2 }}
                color="primary"
              >
                Download PDF
              </Button>
              <Button
                startIcon={<Edit />}
                variant="outlined"
                onClick={handleUpdate}
                disabled={!treatment || loading}
                sx={{ mr: 2 }}
              >
                Update Treatment
              </Button>
              <Button
                startIcon={<Delete />}
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={!treatment || loading || deleting}
              >
                Delete Treatment
              </Button>
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Patient & Doctor Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="h6">Patient Information</Typography>
                </Box>
                {treatment?.patientInfo ? (
                  <>
                    <Typography><strong>Name:</strong> {treatment.patientInfo.name}</Typography>
                    <Typography><strong>Age:</strong> {treatment.patientInfo.age}</Typography>
                    <Typography><strong>Gender:</strong> {treatment.patientInfo.gender}</Typography>
                    <Typography><strong>Contact:</strong> {treatment.patientInfo.contact}</Typography>
                    <Typography><strong>Address:</strong> {treatment.patientInfo.address}</Typography>
                  </>
                ) : appointmentData ? (
                  <>
                    <Typography><strong>Name:</strong> {appointmentData.name}</Typography>
                    <Typography><strong>Age:</strong> {appointmentData.age}</Typography>
                    <Typography><strong>Gender:</strong> {appointmentData.gender}</Typography>
                    <Typography><strong>Contact:</strong> {appointmentData.contact}</Typography>
                    <Typography><strong>Address:</strong> {appointmentData.address}</Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">Patient information not available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocalHospital sx={{ mr: 1 }} />
                  <Typography variant="h6">Appointment Details</Typography>
                </Box>
                <Typography><strong>Doctor:</strong> {treatment?.doctorId?.name || user?.name}</Typography>
                {appointmentData && (
                  <>
                    <Typography>
                      <strong>Date:</strong> {
                        appointmentData.date ? 
                          (() => {
                            try {
                              return format(new Date(appointmentData.date), 'MMM dd, yyyy');
                            } catch (error) {
                              console.error('Date formatting error:', error);
                              return 'Invalid date';
                            }
                          })() 
                          : 'N/A'
                      }
                    </Typography>
                    <Typography><strong>Time:</strong> {appointmentData.time || 'N/A'}</Typography>
                    <Typography><strong>Reason for Visit:</strong> {appointmentData.reason || 'N/A'}</Typography>
                  </>
                )}
                <Typography><strong>Status:</strong></Typography>
                <Chip 
                  label="Completed" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
                {treatment?.createdAt && (
                  <Typography>
                    <strong>Treatment Date:</strong> {
                      (() => {
                        try {
                          return format(new Date(treatment.createdAt), 'MMM dd, yyyy at h:mm a');
                        } catch (error) {
                          console.error('Treatment date formatting error:', error);
                          return 'Invalid date';
                        }
                      })()
                    }
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Treatment Details */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Treatment Information</Typography>
              
              {/* Symptoms */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Symptoms</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {treatment?.symptoms?.map((symptom, index) => (
                    <Chip key={index} label={symptom} variant="outlined" />
                  ))}
                </Box>
              </Box>

              {/* Diagnosis */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Diagnosis</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography>{treatment?.diagnosis}</Typography>
                </Paper>
              </Box>

              {/* Treatment Plan */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Treatment Plan</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography style={{ whiteSpace: 'pre-line' }}>
                    {treatment?.treatmentPlan}
                  </Typography>
                </Paper>
              </Box>

              {/* Prescriptions */}
              {treatment?.prescriptions && treatment.prescriptions.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>Prescriptions</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Medicine</strong></TableCell>
                          <TableCell><strong>Dosage</strong></TableCell>
                          <TableCell><strong>Frequency</strong></TableCell>
                          <TableCell><strong>Duration</strong></TableCell>
                          <TableCell><strong>Instructions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {treatment.prescriptions.map((prescription, index) => (
                          <TableRow key={index}>
                            <TableCell>{prescription.medicineName}</TableCell>
                            <TableCell>{prescription.dosage}</TableCell>
                            <TableCell>{prescription.frequency}</TableCell>
                            <TableCell>{prescription.duration}</TableCell>
                            <TableCell>{prescription.instructions}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Admission Status */}
              {treatment?.needsAdmission && (
                <Box mb={3}>
                  <Alert severity="warning" icon={<Warning />}>
                    <Typography variant="h6">Admission Required</Typography>
                    <Typography>{treatment.admissionReason}</Typography>
                  </Alert>
                </Box>
              )}

              {/* Follow-up */}
              {treatment?.followUpDate && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>Follow-up Appointment</Typography>
                  <Chip 
                    label={
                      (() => {
                        try {
                          return format(new Date(treatment.followUpDate), 'MMM dd, yyyy');
                        } catch (error) {
                          console.error('Follow-up date formatting error:', error);
                          return 'Invalid date';
                        }
                      })()
                    }
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete Treatment</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this treatment? This action cannot be undone.
              The appointment status will be changed back to "Scheduled".
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default TreatmentView;