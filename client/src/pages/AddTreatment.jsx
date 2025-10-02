import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  ExpandMore,
  Person,
  LocalHospital,
  Description,
  Medication
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import axios from 'axios';
import { format } from 'date-fns';

// Sample data for dropdowns
const COMMON_SYMPTOMS = [
  'Fever',
  'Headache',
  'Cough',
  'Sore Throat',
  'Body Aches',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Fatigue',
  'Dizziness',
  'Chest Pain',
  'Shortness of Breath',
  'Abdominal Pain',
  'Back Pain',
  'Joint Pain',
  'Skin Rash',
  'Loss of Appetite',
  'Weight Loss',
  'Insomnia',
  'Anxiety'
];

const COMMON_DIAGNOSES = [
  'Viral Fever',
  'Common Cold',
  'Flu',
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Bronchitis',
  'Pneumonia',
  'Gastritis',
  'Food Poisoning',
  'Migraine',
  'Anxiety Disorder',
  'Depression',
  'Allergic Reaction',
  'Urinary Tract Infection',
  'Skin Infection',
  'Muscle Strain',
  'Arthritis',
  'Acid Reflux',
  'Sinusitis'
];

const COMMON_MEDICINES = [
  'Paracetamol',
  'Ibuprofen',
  'Aspirin',
  'Amoxicillin',
  'Azithromycin',
  'Ciprofloxacin',
  'Omeprazole',
  'Ranitidine',
  'Cetirizine',
  'Loratadine',
  'Salbutamol',
  'Prednisolone',
  'Metformin',
  'Atenolol',
  'Amlodipine',
  'Lisinopril',
  'Simvastatin',
  'Diclofenac',
  'Tramadol',
  'Cough Syrup'
];

const DOSAGE_OPTIONS = [
  '250mg',
  '500mg',
  '1g',
  '5mg',
  '10mg',
  '25mg',
  '50mg',
  '100mg',
  '1 tablet',
  '2 tablets',
  '5ml',
  '10ml',
  '1 capsule',
  '2 capsules'
];

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Before meals',
  'After meals',
  'At bedtime'
];

const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '1 month',
  '2 months',
  '3 months',
  'As needed',
  'Until finished'
];

const COMMON_TREATMENT_PLANS = [
  'Rest and plenty of fluids',
  'Take prescribed medication as directed',
  'Apply ice pack for 15-20 minutes every 2-3 hours',
  'Apply heat therapy for muscle relaxation',
  'Avoid strenuous activities for 1 week',
  'Follow up in 1 week if symptoms persist',
  'Diet modification - avoid spicy foods',
  'Increase fiber intake and drink more water',
  'Physical therapy exercises twice daily',
  'Complete the full course of antibiotics',
  'Monitor blood pressure daily',
  'Check blood sugar levels regularly',
  'Avoid allergens and triggers',
  'Take medication with food to avoid stomach upset',
  'Return immediately if symptoms worsen'
];

const INSTRUCTION_OPTIONS = [
  'After meals',
  'Before meals',
  'With food',
  'On empty stomach',
  'At bedtime',
  'In the morning',
  'With plenty of water',
  'Do not crush or chew',
  'Store in refrigerator',
  'Shake well before use',
  'Complete the full course',
  'As needed for pain',
  'Avoid alcohol while taking',
  'May cause drowsiness'
];

const AddTreatment = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [treatment, setTreatment] = useState({
    symptoms: [''],
    diagnosis: '',
    treatmentPlan: '',
    prescriptions: [{
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }],
    needsAdmission: false,
    admissionReason: '',
    followUpDate: ''
  });

  useEffect(() => {
    // Get appointment data from location state or fetch from API
    if (location.state?.appointment) {
      setAppointmentData(location.state.appointment);
      setLoading(false);
    } else if (appointmentId) {
      fetchAppointmentData();
    } else {
      setError('No appointment data found');
      setLoading(false);
    }
  }, [appointmentId, location.state]);

  const fetchAppointmentData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/appointments/${appointmentId}`);
      setAppointmentData(response.data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError('Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...treatment.symptoms];
    newSymptoms[index] = value;
    setTreatment({ ...treatment, symptoms: newSymptoms });
  };

  const addSymptom = () => {
    setTreatment({ ...treatment, symptoms: [...treatment.symptoms, ''] });
  };

  const removeSymptom = (index) => {
    if (treatment.symptoms.length > 1) {
      const newSymptoms = treatment.symptoms.filter((_, i) => i !== index);
      setTreatment({ ...treatment, symptoms: newSymptoms });
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...treatment.prescriptions];
    newPrescriptions[index][field] = value;
    setTreatment({ ...treatment, prescriptions: newPrescriptions });
  };

  const addPrescription = () => {
    setTreatment({
      ...treatment,
      prescriptions: [...treatment.prescriptions, {
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    });
  };

  const removePrescription = (index) => {
    if (treatment.prescriptions.length > 1) {
      const newPrescriptions = treatment.prescriptions.filter((_, i) => i !== index);
      setTreatment({ ...treatment, prescriptions: newPrescriptions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentData) return;

    // Validate required fields
    if (!treatment.diagnosis.trim()) {
      setError('Diagnosis is required');
      return;
    }
    
    if (!treatment.treatmentPlan.trim()) {
      setError('Treatment plan is required');
      return;
    }

    if (treatment.symptoms.filter(symptom => symptom.trim() !== '').length === 0) {
      setError('At least one symptom is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const treatmentData = {
        patientInfo: {
          name: appointmentData.name,
          age: appointmentData.age,
          gender: appointmentData.gender,
          contact: appointmentData.contact,
          address: appointmentData.address
        },
        doctorId: user.id,
        appointmentId: appointmentData._id,
        symptoms: treatment.symptoms.filter(symptom => symptom.trim() !== ''),
        diagnosis: treatment.diagnosis,
        treatmentPlan: treatment.treatmentPlan,
        prescriptions: treatment.prescriptions.filter(p => p.medicineName.trim() !== ''),
        needsAdmission: treatment.needsAdmission,
        admissionReason: treatment.needsAdmission ? treatment.admissionReason : '',
        followUpDate: treatment.followUpDate || null
      };

      await axios.post('http://localhost:5000/api/treatments', treatmentData);
      setSuccess('Treatment added successfully!');
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error adding treatment:', err);
      setError(err.response?.data?.message || 'Failed to add treatment');
    } finally {
      setSubmitting(false);
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

  if (!appointmentData) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">Appointment data not found</Alert>
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
          <Typography variant="h4" gutterBottom>
            Add Treatment
          </Typography>
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
                <Typography><strong>Name:</strong> {appointmentData.name}</Typography>
                <Typography><strong>Age:</strong> {appointmentData.age}</Typography>
                <Typography><strong>Gender:</strong> {appointmentData.gender}</Typography>
                <Typography><strong>Contact:</strong> {appointmentData.contact}</Typography>
                <Typography><strong>Address:</strong> {appointmentData.address}</Typography>
                <Typography><strong>Reason for Visit:</strong> {appointmentData.reason}</Typography>
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
                <Typography><strong>Doctor:</strong> {user?.name}</Typography>
                <Typography><strong>Date:</strong> {format(new Date(appointmentData.date), 'MMM dd, yyyy')}</Typography>
                <Typography><strong>Time:</strong> {appointmentData.time}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={appointmentData.status} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Treatment Form */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                {/* Symptoms Section */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Symptoms</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {treatment.symptoms.map((symptom, index) => (
                      <Box key={index} display="flex" alignItems="center" mb={2}>
                        <Autocomplete
                          fullWidth
                          freeSolo
                          options={COMMON_SYMPTOMS}
                          value={symptom}
                          onChange={(event, newValue) => {
                            handleSymptomChange(index, newValue || '');
                          }}
                          onInputChange={(event, newInputValue) => {
                            handleSymptomChange(index, newInputValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`Symptom ${index + 1}`}
                              required={index === 0}
                            />
                          )}
                        />
                        {treatment.symptoms.length > 1 && (
                          <IconButton 
                            onClick={() => removeSymptom(index)}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Button
                      startIcon={<Add />}
                      onClick={addSymptom}
                      variant="outlined"
                      size="small"
                    >
                      Add Symptom
                    </Button>
                  </AccordionDetails>
                </Accordion>

                {/* Diagnosis Section */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Diagnosis</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={COMMON_DIAGNOSES}
                      value={treatment.diagnosis}
                      onChange={(event, newValue) => {
                        setTreatment({ ...treatment, diagnosis: newValue || '' });
                      }}
                      onInputChange={(event, newInputValue) => {
                        setTreatment({ ...treatment, diagnosis: newInputValue });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Diagnosis"
                          required
                        />
                      )}
                    />
                  </AccordionDetails>
                </Accordion>

                {/* Treatment Plan Section */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Treatment Plan</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={COMMON_TREATMENT_PLANS}
                      value={treatment.treatmentPlan}
                      onChange={(event, newValue) => {
                        setTreatment({ ...treatment, treatmentPlan: newValue || '' });
                      }}
                      onInputChange={(event, newInputValue) => {
                        setTreatment({ ...treatment, treatmentPlan: newInputValue });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Treatment Plan & Instructions"
                          placeholder="Select from common treatments or type your own"
                        />
                      )}
                    />
                  </AccordionDetails>
                </Accordion>

                {/* Prescriptions Section */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Prescriptions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {treatment.prescriptions.map((prescription, index) => (
                      <Card key={index} sx={{ mb: 2, p: 2 }}>
                        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1">Prescription {index + 1}</Typography>
                          {treatment.prescriptions.length > 1 && (
                            <IconButton
                              onClick={() => removePrescription(index)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                              fullWidth
                              freeSolo
                              options={COMMON_MEDICINES}
                              value={prescription.medicineName}
                              onChange={(event, newValue) => {
                                handlePrescriptionChange(index, 'medicineName', newValue || '');
                              }}
                              onInputChange={(event, newInputValue) => {
                                handlePrescriptionChange(index, 'medicineName', newInputValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Medicine Name"
                                  required={index === 0}
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                              fullWidth
                              freeSolo
                              options={DOSAGE_OPTIONS}
                              value={prescription.dosage}
                              onChange={(event, newValue) => {
                                handlePrescriptionChange(index, 'dosage', newValue || '');
                              }}
                              onInputChange={(event, newInputValue) => {
                                handlePrescriptionChange(index, 'dosage', newInputValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Dosage"
                                  placeholder="e.g., 500mg"
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                              fullWidth
                              freeSolo
                              options={FREQUENCY_OPTIONS}
                              value={prescription.frequency}
                              onChange={(event, newValue) => {
                                handlePrescriptionChange(index, 'frequency', newValue || '');
                              }}
                              onInputChange={(event, newInputValue) => {
                                handlePrescriptionChange(index, 'frequency', newInputValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Frequency"
                                  placeholder="e.g., Every 6 hours"
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                              fullWidth
                              freeSolo
                              options={DURATION_OPTIONS}
                              value={prescription.duration}
                              onChange={(event, newValue) => {
                                handlePrescriptionChange(index, 'duration', newValue || '');
                              }}
                              onInputChange={(event, newInputValue) => {
                                handlePrescriptionChange(index, 'duration', newInputValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Duration"
                                  placeholder="e.g., 3 days"
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Autocomplete
                              fullWidth
                              freeSolo
                              options={INSTRUCTION_OPTIONS}
                              value={prescription.instructions}
                              onChange={(event, newValue) => {
                                handlePrescriptionChange(index, 'instructions', newValue || '');
                              }}
                              onInputChange={(event, newInputValue) => {
                                handlePrescriptionChange(index, 'instructions', newInputValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Instructions"
                                  placeholder="e.g., After meals"
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                    <Button
                      startIcon={<Add />}
                      onClick={addPrescription}
                      variant="outlined"
                      size="small"
                    >
                      Add Prescription
                    </Button>
                  </AccordionDetails>
                </Accordion>

                {/* Admission Section */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Admission Required?</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={treatment.needsAdmission}
                          onChange={(e) => setTreatment({ ...treatment, needsAdmission: e.target.checked })}
                        />
                      }
                      label="Patient needs admission"
                    />
                    {treatment.needsAdmission && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Admission Reason"
                        value={treatment.admissionReason}
                        onChange={(e) => setTreatment({ ...treatment, admissionReason: e.target.value })}
                        sx={{ mt: 2 }}
                        required
                      />
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Follow-up Section */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Follow-up</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      type="date"
                      label="Follow-up Date (Optional)"
                      value={treatment.followUpDate}
                      onChange={(e) => setTreatment({ ...treatment, followUpDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </AccordionDetails>
                </Accordion>

                <Divider sx={{ my: 3 }} />

                {/* Submit Button */}
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : <Description />}
                  >
                    {submitting ? 'Adding Treatment...' : 'Add Treatment'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default AddTreatment;