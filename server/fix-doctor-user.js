require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Model/UserModel');
const bcrypt = require('bcryptjs');

async function fixDoctorUser() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // Find all doctors
        const doctors = await User.find({ role: 'doctor' });
        console.log(`Found ${doctors.length} doctor(s)`);

        if (doctors.length === 0) {
            console.log('\n⚠️  No doctor found. Creating sample doctor...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('doctor123', salt);
            
            const newDoctor = await User.create({
                firstName: 'Dr. Sarah',
                lastName: 'Johnson',
                email: 'dr.sarah@hospital.com',
                password: hashedPassword,
                role: 'doctor',
                contactNumber: '+1-555-0101',
                specialization: 'General Physician',
                licenseNumber: 'MD-2024-001',
                employeeId: 'EMP-DOC-001',
                active: true
            });
            
            console.log(`✅ Created doctor: ${newDoctor.firstName} ${newDoctor.lastName}`);
        } else {
            // Check and fix existing doctors
            for (const doctor of doctors) {
                console.log(`\nDoctor: ${doctor.email}`);
                console.log(`  Name: ${doctor.firstName} ${doctor.lastName}`);
                console.log(`  Fields:`, {
                    firstName: doctor.firstName,
                    lastName: doctor.lastName,
                    specialization: doctor.specialization,
                    licenseNumber: doctor.licenseNumber
                });

                // Fix if missing name
                if (!doctor.firstName || !doctor.lastName) {
                    console.log('  ⚠️  Missing name fields. Updating...');
                    doctor.firstName = doctor.firstName || 'Dr. John';
                    doctor.lastName = doctor.lastName || 'Doe';
                    doctor.specialization = doctor.specialization || 'General Physician';
                    doctor.licenseNumber = doctor.licenseNumber || 'MD-2024-001';
                    await doctor.save();
                    console.log(`  ✅ Updated to: ${doctor.firstName} ${doctor.lastName}`);
                }
            }
        }

        console.log('\n✅ Doctor user check completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('📦 Connection closed');
    }
}

fixDoctorUser();
