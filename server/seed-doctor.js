const mongoose = require('mongoose');
const User = require('./Model/UserModel');
const Appointment = require('./Model/AppointmentModel');
require('dotenv').config();

const seedDoctorData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create a demo doctor
        const doctorData = {
            name: 'Dr. John Smith',
            contactNo: '+1-555-0123',
            address: '123 Medical Center Blvd, Healthcare City',
            email: 'doctor@hospital.com',
            role: 'doctor',
            password: 'doctor123'
        };

        // Check if doctor already exists
        const existingDoctor = await User.findOne({ email: doctorData.email });
        let doctor;
        
        if (!existingDoctor) {
            doctor = new User(doctorData);
            await doctor.save();
            console.log('Demo doctor created successfully');
        } else {
            doctor = existingDoctor;
            console.log('Demo doctor already exists');
        }

        // Create some sample appointments for today
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const sampleAppointments = [
            {
                name: 'Alice Johnson',
                address: '123 Oak Street, City',
                contact: '+1-555-0101',
                age: 28,
                gender: 'Female',
                doctor: doctor.name,
                doctorId: doctor._id,
                date: todayString,
                time: '09:00 AM',
                reason: 'Regular checkup',
                status: 'Scheduled'
            },
            {
                name: 'Bob Williams',
                address: '456 Pine Avenue, Town',
                contact: '+1-555-0102',
                age: 35,
                gender: 'Male',
                doctor: doctor.name,
                doctorId: doctor._id,
                date: todayString,
                time: '10:30 AM',
                reason: 'Follow-up consultation',
                status: 'Scheduled'
            },
            {
                name: 'Carol Davis',
                address: '789 Maple Drive, Village',
                contact: '+1-555-0103',
                age: 42,
                gender: 'Female',
                doctor: doctor.name,
                doctorId: doctor._id,
                date: todayString,
                time: '02:00 PM',
                reason: 'Blood pressure check',
                status: 'Completed'
            }
        ];

        // Remove existing appointments for this doctor
        await Appointment.deleteMany({ doctorId: doctor._id });

        // Add sample appointments
        await Appointment.insertMany(sampleAppointments);
        console.log('Sample appointments created successfully');

        console.log('\n=== DEMO DOCTOR CREDENTIALS ===');
        console.log('Email: doctor@hospital.com');
        console.log('Password: doctor123');
        console.log('Role: doctor');
        console.log('===============================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding doctor data:', error);
        process.exit(1);
    }
};

seedDoctorData();