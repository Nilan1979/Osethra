// client/src/pages/AllSchedules.jsx
import React, { useState, useEffect } from "react";
import { getAllSchedules, getDoctorsWithSchedules } from "../api/schedule";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  alpha,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import {
  CalendarToday,
  Schedule as ScheduleIcon,
  LocalHospital,
  AccessTime,
  Person
} from "@mui/icons-material";

export default function AllSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    doctorId: "",
    date: "",
    isAvailable: "true"
  });

  const fetchDoctors = React.useCallback(async () => {
    try {
      const response = await getDoctorsWithSchedules();
      setDoctors(response.doctors || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  }, []);

  const fetchSchedules = React.useCallback(async () => {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.doctorId) filterParams.doctorId = filters.doctorId;
      if (filters.date) filterParams.date = filters.date;
      if (filters.isAvailable) filterParams.isAvailable = filters.isAvailable;

      const response = await getAllSchedules(filterParams);
      setSchedules(response.schedules || []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, [fetchDoctors, fetchSchedules]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchSchedules();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading && schedules.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F0F9F0", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Card */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            background: "#4CAF50",
            color: "white",
            boxShadow: "0 8px 32px rgba(76, 175, 80, 0.2)"
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: "rgba(255,255,255,0.2)" }}>
                <ScheduleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="700">
                  Doctor Schedules
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  View all doctor availability and appointment slots
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(76, 175, 80, 0.08)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <LocalHospital sx={{ color: "#4CAF50" }} />
              Filter Schedules
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    name="doctorId"
                    value={filters.doctorId}
                    onChange={handleFilterChange}
                    label="Doctor"
                  >
                    <MenuItem value="">All Doctors</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.name} {doctor.specialty && `(${doctor.specialty})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={filters.date}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability</InputLabel>
                  <Select
                    name="isAvailable"
                    value={filters.isAvailable}
                    onChange={handleFilterChange}
                    label="Availability"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Available</MenuItem>
                    <MenuItem value="false">Unavailable</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleApplyFilters}
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      padding: "8px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px"
                    }}
                  >
                    Apply Filters
                  </button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Schedules Table */}
        <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(76, 175, 80, 0.08)" }}>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#4CAF50", 0.05) }}>
                    <TableCell><strong>Doctor</strong></TableCell>
                    <TableCell><strong>Specialty</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Start Time</strong></TableCell>
                    <TableCell><strong>End Time</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <LocalHospital sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No schedules found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Try adjusting your filters or check back later
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => (
                      <TableRow key={schedule._id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                            {schedule.doctorName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.doctorSpecialty || "General"}
                            size="small"
                            sx={{
                              bgcolor: alpha("#4CAF50", 0.1),
                              color: "#4CAF50",
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
                            {formatDate(schedule.date)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
                            {formatTime(schedule.startTime)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
                            {formatTime(schedule.endTime)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
