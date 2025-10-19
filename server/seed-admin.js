const mongoose = require('mongoose');
const User = require('./Model/UserModel');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@osethra.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin user already exists');
      console.log(`Email: ${adminEmail}`);
      console.log('Password: (unchanged)');
    } else {
      const adminData = {
        fullName: 'System Administrator',
        email: adminEmail,
        contactNo: '0000000000',
        address: 'Head Office',
        role: 'admin',
        password: adminPassword,
        gender: 'other',
        dob: new Date('1990-01-01'),
        nic: '000000000V',
        maritalStatus: 'single',
        emergencyContactName: 'SysAdmin',
        emergencyContactNo: '0000000000'
      };

      const admin = new User(adminData);
      await admin.save();
      console.log('\n=== ADMIN CREDENTIALS ===');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log('========================\n');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
