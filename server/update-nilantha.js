require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Model/UserModel');

async function updateNilantha() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // Find nilantha
        const nilantha = await User.findOne({ email: 'nilantha@gmail.com' });
        
        if (!nilantha) {
            console.log('❌ Doctor "nilantha@gmail.com" not found!');
            return;
        }

        console.log('Current nilantha data:');
        console.log('  Email:', nilantha.email);
        console.log('  Name:', nilantha.name);
        console.log('  First Name:', nilantha.firstName);
        console.log('  Last Name:', nilantha.lastName);
        console.log('  Role:', nilantha.role);
        console.log('');

        // Update with proper details
        console.log('📝 Updating nilantha profile...');
        
        // Check what fields exist in the schema
        if (nilantha.schema.paths.name) {
            nilantha.name = 'Dr. Nilantha Silva';
        }
        if (nilantha.schema.paths.firstName) {
            nilantha.firstName = 'Dr. Nilantha';
        }
        if (nilantha.schema.paths.lastName) {
            nilantha.lastName = 'Silva';
        }
        if (nilantha.schema.paths.specialization) {
            nilantha.specialization = 'General Physician';
        }
        if (nilantha.schema.paths.licenseNumber) {
            nilantha.licenseNumber = 'MD-2024-001';
        }
        if (nilantha.schema.paths.employeeId && !nilantha.employeeId) {
            nilantha.employeeId = 'EMP-DOC-001';
        }

        await nilantha.save();
        console.log('✅ Profile updated!\n');

        // Verify the update
        const updated = await User.findOne({ email: 'nilantha@gmail.com' });
        console.log('Updated nilantha data:');
        console.log('  Email:', updated.email);
        console.log('  Name:', updated.name);
        console.log('  First Name:', updated.firstName);
        console.log('  Last Name:', updated.lastName);
        console.log('  Specialization:', updated.specialization);
        console.log('  License:', updated.licenseNumber);
        console.log('  Employee ID:', updated.employeeId);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Connection closed');
    }
}

updateNilantha();
