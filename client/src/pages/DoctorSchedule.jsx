// client/src/pages/DoctorSchedule.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createSchedule,
  getSchedulesByDoctor,
  updateSchedule,
  deleteSchedule
} from "../api/schedule";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  alpha,
  CircularProgress
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
  Schedule as ScheduleIcon,
  LocalHospital,
  Close,
  Save,
  AccessTime
} from "@mui/icons-material";

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: ""
  });

  const fetchSchedules = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSchedulesByDoctor(user.id || user._id);
      setSchedules(response.schedules || []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.id || user._id)) {
      fetchSchedules();
    }
  }, [user, fetchSchedules]);

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : "",
        startTime: schedule.startTime || "",
        endTime: schedule.endTime || ""
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        date: "",
        startTime: "",
        endTime: ""
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError("Please fill in all required fields");
      return;
    }

    // Check if end time is after start time
    if (formData.startTime >= formData.endTime) {
      setError("End time must be after start time");
      return;
    }

    try {
      const scheduleData = {
        doctorId: user.id || user._id,
        doctorName: user.name || user.username || "Unknown Doctor",
        doctorSpecialty: user.specialty || "General",
        ...formData
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule._id, formData);
        setSuccess("Schedule updated successfully!");
      } else {
        await createSchedule(scheduleData);
        setSuccess("Schedule created successfully!");
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchSchedules();
      }, 1500);
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(err.message || "Failed to save schedule");
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);
      setSuccess("Schedule deleted successfully!");
      fetchSchedules();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError("Failed to delete schedule");
      setTimeout(() => setError(""), 3000);
    }
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

  if (loading) {
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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: "rgba(255,255,255,0.2)" }}>
                  <ScheduleIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    My Schedule
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Manage your availability and appointment slots
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: "white",
                  color: "#4CAF50",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
                }}
              >
                Add Schedule
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Schedules Table */}
        <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(76, 175, 80, 0.08)" }}>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#4CAF50", 0.05) }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Start Time</strong></TableCell>
                    <TableCell><strong>End Time</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <LocalHospital sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No schedules yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Click "Add Schedule" to create your first availability slot
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => (
                      <TableRow key={schedule._id} hover>
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
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(schedule)}
                            sx={{ color: "#4CAF50", mr: 1 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(schedule._id)}
                            sx={{ color: "#f44336" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">{editingSchedule ? "Edit Schedule" : "Add New Schedule"}</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="date"
                    label="Date"
                    type="date"
                    fullWidth
                    required
                    value={formData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="startTime"
                    label="Start Time"
                    type="time"
                    fullWidth
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="endTime"
                    label="End Time"
                    type="time"
                    fullWidth
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" startIcon={<Save />}>
                {editingSchedule ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
}
