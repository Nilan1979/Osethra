const express = require('express');
const mongoose = require('mongoose');
const appointmentRoutes = require('./Routes/AppointmentRoutes');
const treatmentRoutes = require('./Routes/TreatmentRoutes');
const patientRoutes = require('./Routes/patientRoute');
const medicalRequestRoutes = require('./Routes/medicalRequestRoutes');

const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use("/appointments", appointmentRoutes);
app.use("/api/treatments", treatmentRoutes);


// Routes
const userRoutes = require('./Routes/UserRoutes');
app.use('/users', userRoutes);

app.use('/api/patients', patientRoutes);
app.use('/api/medical-requests', medicalRequestRoutes);

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log("Connected to MongoDB");
      app.listen(process.env.PORT || 5000, () => {
          console.log(`Server running on port ${process.env.PORT || 5000}`);
      });
  })
  .catch(err => console.log(err));




