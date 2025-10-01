const mongoose = require('mongoose');
const Appointment = require('./Model/AppointmentModel');
require('dotenv').config();

const addSampleAppointments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Sample appointments
        const sampleAppointments = [
            {
                name: 'John Smith',
                address: '123 Main Street, City',
                contact: '+1-555-0111',
                age: 45,
                gender: 'Male',
                doctor: 'Dr. Sarah Johnson',
                doctorId: new mongoose.Types.ObjectId(),
                date: new Date(),
                time: '09:00 AM',
                reason: 'Regular checkup',
                status: 'Scheduled'
            },
            {
                name: 'Emily Davis',
                address: '456 Oak Avenue, Town',
                contact: '+1-555-0112',
                age: 32,
                gender: 'Female',
                doctor: 'Dr. Michael Brown',
                doctorId: new mongoose.Types.ObjectId(),
                date: new Date(),
                time: '10:30 AM',
                reason: 'Blood test',
                status: 'Completed'
            },
            {
                name: 'Robert Wilson',
                address: '789 Pine Road, Village',
                contact: '+1-555-0113',
                age: 58,
                gender: 'Male',
                doctor: 'Dr. Lisa Anderson',
                doctorId: new mongoose.Types.ObjectId(),
                date: new Date(Date.now() + 86400000), // Tomorrow
                time: '02:00 PM',
                reason: 'Follow-up consultation',
                status: 'Scheduled'
            }
        ];

        await Appointment.insertMany(sampleAppointments);
        console.log('Sample appointments added successfully');

        console.log('\n=== SAMPLE DATA CREATED ===');
        console.log('3 sample appointments have been added');
        console.log('You can now test the /appointments/latest endpoint');
        console.log('===============================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error adding sample appointments:', error);
        process.exit(1);
    }
};

addSampleAppointments();