const express = require('express');
const mongoose = require('mongoose');
const appointmentRoutes = require('./Routes/AppointmentRoutes');

const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite's default port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/appointments", appointmentRoutes);


// Routes
const userRoutes = require('./Routes/UserRoutes');
app.use('/users', userRoutes);

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log("Connected to MongoDB");
      app.listen(process.env.PORT || 5000, () => {
          console.log(`Server running on port ${process.env.PORT || 5000}`);
      });
  })
  .catch(err => console.log(err));




