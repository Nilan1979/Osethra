import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  PictureAsPdf,
  Visibility,
  Add,
  Download
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Reusable components
const StatusChip = ({ status }) => (
  <Chip 
    label={status}
    color={
      status === 'Completed' ? 'success' :
      status === 'Scheduled' ? 'primary' :
      'warning'
    }
    size="small"
  />
);

const AppointmentsTable = ({ data, showDate = false, onRowClick, onDownloadPDF }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          {showDate && <TableCell>Date</TableCell>}
          <TableCell>Time</TableCell>
          <TableCell>Patient Name</TableCell>
          <TableCell>Age</TableCell>
          <TableCell>Gender</TableCell>
          <TableCell>Contact</TableCell>
          <TableCell>Address</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showDate ? 10 : 9} align="center">
              No appointments {showDate ? 'found' : 'scheduled for today'}
            </TableCell>
          </TableRow>
        ) : (
          data.map((appointment) => {
            const isClickable = onRowClick && (appointment.status === 'Scheduled' || appointment.status === 'Completed');
            return (
              <TableRow 
                key={appointment._id}
                sx={{ 
                  opacity: appointment.status === 'Cancelled' ? 0.6 : 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                {showDate && (
                  <TableCell>
                    {format(new Date(appointment.date), 'MMM dd, yyyy')}
                  </TableCell>
                )}
                <TableCell>{appointment.time}</TableCell>
                <TableCell><strong>{appointment.name}</strong></TableCell>
                <TableCell>{appointment.age}</TableCell>
                <TableCell>{appointment.gender}</TableCell>
                <TableCell>{appointment.contact}</TableCell>
                <TableCell>{appointment.address}</TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>
                  <StatusChip status={appointment.status} />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    {/* View/Add Treatment Button */}
                    <Tooltip title={
                      appointment.status === 'Scheduled' ? 'Add Treatment' : 
                      appointment.status === 'Completed' ? 'View Treatment' : 
                      'View Details'
                    }>
                      <IconButton
                        size="small"
                        onClick={() => isClickable && onRowClick(appointment)}
                        disabled={!isClickable}
                        color="primary"
                      >
                        {appointment.status === 'Scheduled' ? <Add /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                    
                    {/* PDF Download Button */}
                    <Tooltip title="Download PDF Report">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadPDF && onDownloadPDF(appointment);
                        }}
                        color="secondary"
                      >
                        <PictureAsPdf />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });

  const handleAppointmentClick = (appointment) => {
    if (appointment.status === 'Scheduled') {
      // Navigate to AddTreatment page for scheduled appointments
      navigate(`/add-treatment/${appointment._id}`, {
        state: { appointment }
      });
    } else if (appointment.status === 'Completed') {
      // Navigate to TreatmentView page for completed appointments
      navigate(`/treatment-view/${appointment._id}`, {
        state: { appointment }
      });
    }
  };

  const handleDownloadPDF = async (appointment) => {
    try {
      setLoading(true);
      
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

      // Try to fetch treatment data if appointment is completed
      let treatmentData = null;
      if (appointment.status === 'Completed') {
        try {
          const treatmentResponse = await axios.get(`http://localhost:5000/api/treatments/appointment/${appointment._id}`);
          treatmentData = treatmentResponse.data.data;
        } catch (err) {
          console.log('No treatment found, generating appointment summary');
        }
      }

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
      const reportTitle = treatmentData ? 'Medical Treatment Report' : 'Appointment Report';
      pdf.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Patient Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PATIENT INFORMATION', 20, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'normal');
      const patientInfo = treatmentData?.patientInfo || appointment;
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
      
      // Appointment Details
      pdf.setFont('helvetica', 'bold');
      pdf.text('APPOINTMENT DETAILS', 20, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Doctor: ${user?.name || 'N/A'}`, 20, yPos);
      yPos += 6;
      pdf.text(`Date: ${formatSafeDate(appointment.date)}`, 20, yPos);
      yPos += 6;
      pdf.text(`Time: ${appointment.time || 'N/A'}`, 20, yPos);
      yPos += 6;
      pdf.text(`Status: ${appointment.status || 'N/A'}`, 20, yPos);
      yPos += 6;
      if (appointment.reason) {
        pdf.text(`Reason for Visit: ${appointment.reason}`, 20, yPos);
        yPos += 6;
      }
      yPos += 5;
      
      // Treatment details (if available)
      if (treatmentData) {
        // Symptoms
        if (treatmentData.symptoms && treatmentData.symptoms.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('SYMPTOMS', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          treatmentData.symptoms.forEach((symptom) => {
            pdf.text(`• ${symptom}`, 25, yPos);
            yPos += 6;
          });
          yPos += 5;
        }
        
        // Diagnosis
        if (treatmentData.diagnosis) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('DIAGNOSIS', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          const diagnosisLines = pdf.splitTextToSize(treatmentData.diagnosis, pageWidth - 40);
          pdf.text(diagnosisLines, 20, yPos);
          yPos += diagnosisLines.length * 6 + 5;
        }
        
        // Treatment Plan
        if (treatmentData.treatmentPlan) {
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('TREATMENT PLAN', 20, yPos);
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          const treatmentLines = pdf.splitTextToSize(treatmentData.treatmentPlan, pageWidth - 40);
          pdf.text(treatmentLines, 20, yPos);
          yPos += treatmentLines.length * 6 + 5;
        }
        
        // Prescriptions
        if (treatmentData.prescriptions && treatmentData.prescriptions.length > 0) {
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('PRESCRIPTIONS', 20, yPos);
          yPos += 8;
          
          treatmentData.prescriptions.forEach((prescription, index) => {
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
      } else if (appointment.status === 'Completed') {
        // Note for completed appointments without treatment
        pdf.setFont('helvetica', 'bold');
        pdf.text('TREATMENT STATUS', 20, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text('This appointment has been completed but no detailed treatment record is available.', 20, yPos);
        yPos += 6;
        pdf.text('Please contact the medical center for more information.', 20, yPos);
      } else {
        // Note for non-completed appointments
        pdf.setFont('helvetica', 'bold');
        pdf.text('APPOINTMENT STATUS', 20, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`This appointment is currently ${appointment.status.toLowerCase()}.`, 20, yPos);
        if (appointment.status === 'Scheduled') {
          yPos += 6;
          pdf.text('Treatment details will be available after the appointment is completed.', 20, yPos);
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
      const patientName = (appointment.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
      const date = formatSafeDate(appointment.date, 'yyyy-MM-dd');
      const filename = treatmentData 
        ? `Treatment_Report_${patientName}_${date}.pdf`
        : `Appointment_Report_${patientName}_${date}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDownloadPDF = async (appointmentsList, title) => {
    try {
      setLoading(true);
      
      if (appointmentsList.length === 0) {
        setError('No appointments to download');
        return;
      }

      // Generate a combined PDF for all appointments
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
      pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.text(`Doctor: ${user?.name || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Table header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Time', 20, yPos);
      pdf.text('Patient Name', 40, yPos);
      pdf.text('Age', 80, yPos);
      pdf.text('Gender', 95, yPos);
      pdf.text('Contact', 115, yPos);
      pdf.text('Status', 150, yPos);
      pdf.text('Reason', 170, yPos);
      yPos += 3;
      
      // Draw line under header
      pdf.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // Add each appointment
      pdf.setFont('helvetica', 'normal');
      appointmentsList.forEach((appointment, index) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
          
          // Repeat header on new page
          pdf.setFont('helvetica', 'bold');
          pdf.text('Time', 20, yPos);
          pdf.text('Patient Name', 40, yPos);
          pdf.text('Age', 80, yPos);
          pdf.text('Gender', 95, yPos);
          pdf.text('Contact', 115, yPos);
          pdf.text('Status', 150, yPos);
          pdf.text('Reason', 170, yPos);
          yPos += 3;
          pdf.line(20, yPos, pageWidth - 20, yPos);
          yPos += 8;
          pdf.setFont('helvetica', 'normal');
        }

        const formatSafeDate = (dateValue, formatString = 'MMM dd, yyyy') => {
          if (!dateValue) return 'N/A';
          try {
            return format(new Date(dateValue), formatString);
          } catch (error) {
            return 'Invalid';
          }
        };

        pdf.text(appointment.time || 'N/A', 20, yPos);
        pdf.text((appointment.name || 'N/A').substring(0, 15), 40, yPos);
        pdf.text(String(appointment.age || 'N/A'), 80, yPos);
        pdf.text((appointment.gender || 'N/A').substring(0, 8), 95, yPos);
        pdf.text((appointment.contact || 'N/A').substring(0, 12), 115, yPos);
        pdf.text((appointment.status || 'N/A').substring(0, 10), 150, yPos);
        pdf.text((appointment.reason || 'N/A').substring(0, 20), 170, yPos);
        yPos += 6;
      });

      // Footer
      yPos = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.text('Generated on: ' + new Date().toLocaleDateString(), 20, yPos);
      pdf.text('Osethra Medical Center - Confidential Medical Record', pageWidth / 2, yPos, { align: 'center' });
      
      // Generate filename
      const date = format(new Date(), 'yyyy-MM-dd');
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;

      try {
        const response = await axios.get(`http://localhost:5000/appointments/doctor/${user.id}`);
        setAppointments(response.data);
        
        // Calculate statistics
        const newStats = response.data.reduce((acc, app) => {
          acc.total++;
          const status = app.status.toLowerCase();
          if (status === 'scheduled') acc.scheduled++;
          else if (status === 'completed') acc.completed++;
          else if (status === 'cancelled') acc.cancelled++;
          return acc;
        }, { total: 0, scheduled: 0, completed: 0, cancelled: 0 });
        
        setStats(newStats);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Get today's appointments
  const todayAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    const today = new Date();
    return appDate.toDateString() === today.toDateString();
  });

  // Stats card data
  const statsCards = [
    { title: 'Total Appointments', value: stats.total, color: 'primary.light' },
    { title: 'Scheduled', value: stats.scheduled, color: 'info.light' },
    { title: 'Completed', value: stats.completed, color: 'success.light' },
    { title: 'Cancelled', value: stats.cancelled, color: 'warning.light' }
  ];

  return (
    <Layout showContactInfo={false}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome, {user?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your appointments and patient schedule
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/doctor-schedule')}
                sx={{ minWidth: 180 }}
              >
                Manage My Schedule
              </Button>
            </Paper>
          </Grid>

          {/* Statistics Cards */}
          {statsCards.map((card, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ bgcolor: card.color }}>
                <CardContent>
                  <Typography color="white" gutterBottom>{card.title}</Typography>
                  <Typography variant="h4" color="white">{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Today's Appointments */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Today's Appointments ({new Date().toLocaleDateString()})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click on scheduled appointments to add treatment details, or click on completed appointments to view/edit treatments
                  </Typography>
                </Box>
                {todayAppointments.length > 0 && (
                  <Button
                    startIcon={<Download />}
                    variant="outlined"
                    color="primary"
                    onClick={() => handleBulkDownloadPDF(todayAppointments, "Today's Appointments Summary")}
                    disabled={loading}
                  >
                    Download Today's Report
                  </Button>
                )}
              </Box>
              {loading ? (
                <Box display="flex" justifyContent="center" m={3}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : todayAppointments.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No appointments scheduled for today. Enjoy your day!
                </Alert>
              ) : (
                <AppointmentsTable 
                  data={todayAppointments} 
                  onRowClick={handleAppointmentClick}
                  onDownloadPDF={handleDownloadPDF}
                />
              )}
            </Paper>
          </Grid>

          {/* All Appointments */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>All Appointments</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click on scheduled appointments to add treatment details, or click on completed appointments to view/edit treatments
                  </Typography>
                </Box>
                {appointments.length > 0 && (
                  <Button
                    startIcon={<Download />}
                    variant="outlined"
                    color="primary"
                    onClick={() => handleBulkDownloadPDF(appointments, "All Appointments Report")}
                    disabled={loading}
                  >
                    Download All Reports
                  </Button>
                )}
              </Box>
              {loading ? (
                <Box display="flex" justifyContent="center" m={3}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <AppointmentsTable 
                  data={appointments} 
                  showDate={true} 
                  onRowClick={handleAppointmentClick}
                  onDownloadPDF={handleDownloadPDF}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default DoctorDashboard;