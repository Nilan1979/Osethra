require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Model/UserModel');

async function cleanupDoctors() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // Find all doctors
        const doctors = await User.find({ role: 'doctor' });
        console.log(`Found ${doctors.length} doctor(s)\n`);

        // Find nilantha
        const nilantha = doctors.find(d => d.email === 'nilantha@gmail.com');
        
        if (!nilantha) {
            console.log('❌ Doctor "nilantha@gmail.com" not found!');
            console.log('Available doctors:');
            doctors.forEach(d => console.log(`  - ${d.email}`));
            return;
        }

        console.log(`✅ Keeping doctor: ${nilantha.email}\n`);

        // Update nilantha with proper details
        console.log('📝 Updating nilantha profile...');
        nilantha.firstName = 'Dr. Nilantha';
        nilantha.lastName = 'Silva';
        nilantha.specialization = 'General Physician';
        nilantha.licenseNumber = 'MD-2024-001';
        await nilantha.save();
        console.log(`✅ Updated: ${nilantha.firstName} ${nilantha.lastName}\n`);

        // Delete all other doctors
        const doctorsToDelete = doctors.filter(d => d.email !== 'nilantha@gmail.com');
        console.log(`🗑️  Deleting ${doctorsToDelete.length} other doctor(s)...`);
        
        for (const doctor of doctorsToDelete) {
            console.log(`  - Deleting: ${doctor.email}`);
            await User.deleteOne({ _id: doctor._id });
        }

        console.log(`\n✅ Deleted ${doctorsToDelete.length} doctor(s)`);
        console.log(`✅ Remaining doctors: 1 (${nilantha.email})`);

        // Verify
        const remainingDoctors = await User.find({ role: 'doctor' });
        console.log(`\n📊 Final doctor count: ${remainingDoctors.length}`);
        remainingDoctors.forEach(d => {
            console.log(`  - ${d.email} (${d.firstName} ${d.lastName})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Connection closed');
    }
}

cleanupDoctors();
