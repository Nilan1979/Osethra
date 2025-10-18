const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    // Personal Information
    fullName: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date, required: true },
    nic: { type: String, required: true },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    contactNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },

    // Job Details
    role: { 
        type: String, 
        enum: ['admin', 'receptionist', 'doctor', 'pharmacist', 'nurse'],
        default: 'receptionist'
    },
    department: { type: String },
    password: { type: String, required: true },
    profileImage: { type: String },

    // Emergency
    emergencyContactName: { type: String, required: true },
    emergencyContactNo: { type: String, required: true },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);
