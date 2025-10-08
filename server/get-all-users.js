const mongoose = require('mongoose');
require('dotenv').config();

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  contactNo: String,
  address: String,
  email: String,
  role: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function getAllUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!\n');

    // Fetch all users
    const users = await User.find({});
    
    console.log(`Total Users Found: ${users.length}\n`);
    console.log('=' .repeat(80));
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log('-'.repeat(80));
        console.log(`ID:       ${user._id}`);
        console.log(`Name:     ${user.name}`);
        console.log(`Email:    ${user.email}`);
        console.log(`Role:     ${user.role}`);
        console.log(`Contact:  ${user.contactNo}`);
        console.log(`Address:  ${user.address}`);
        console.log('-'.repeat(80));
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the function
getAllUsers();
