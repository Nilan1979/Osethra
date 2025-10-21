const User = require('../Model/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

// Get all users with optional search
exports.getAllUsers = async (req, res) => {
    try {
        console.log('Getting all users. Query:', req.query);
        
        const { search } = req.query;
        let query = {};
        
        // If search parameter is provided, search by fullName (case-insensitive)
        if (search) {
            query = {
                fullName: { $regex: search, $options: 'i' }
            };
            console.log('Search query:', query);
        }
        
        const users = await User.find(query).select('-password');
        console.log(`Found ${users.length} users`);
        
        // Transform the response to include name field for backward compatibility
        const transformedUsers = users.map(user => ({
            ...user.toObject(),
            name: user.fullName || user.name  // Add name field that matches fullName
        }));
        
        res.status(200).json(transformedUsers);
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({ 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// Search users by name
exports.searchUsers = async (req, res) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({ message: 'Name parameter is required' });
        }
        
        const users = await User.find({
            fullName: { $regex: name, $options: 'i' }
        }).select('-password');
        
        // Transform the response to include name field for backward compatibility
        const transformedUsers = users.map(user => ({
            ...user.toObject(),
            name: user.fullName  // Add name field that matches fullName
        }));
        
        res.status(200).json(transformedUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generate PDF report of all users
exports.generateUsersPDF = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        
        const doc = new PDFDocument();
        
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users-report.pdf');
        
        
        doc.pipe(res);
        
        
        doc.fontSize(20).text('Healthcare System - Users Report', { align: 'center' });
        doc.moveDown();
        
        
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        
        
        const stats = {
            total: users.length,
            admins: users.filter(u => u.role === 'admin').length,
            doctors: users.filter(u => u.role === 'doctor').length,
            nurses: users.filter(u => u.role === 'nurse').length,
            receptionists: users.filter(u => u.role === 'receptionist').length,
            pharmacists: users.filter(u => u.role === 'pharmacist').length
        };
        
        doc.fontSize(14).text('Summary Statistics:', { underline: true });
        doc.fontSize(12)
           .text(`Total Users: ${stats.total}`)
           .text(`Admins: ${stats.admins}`)
           .text(`Doctors: ${stats.doctors}`)
           .text(`Nurses: ${stats.nurses}`)
           .text(`Receptionists: ${stats.receptionists}`)
           .text(`Pharmacists: ${stats.pharmacists}`);
        
        doc.moveDown();
        
        // Add users table header
        doc.fontSize(14).text('Users List:', { underline: true });
        doc.moveDown();
        
        // Table headers
        const tableTop = doc.y;
        const nameX = 50;
        const emailX = 180;
        const roleX = 310;
        const specialtyX = 380;
        const contactX = 480;
        
        doc.fontSize(10)
           .text('Name', nameX, tableTop, { bold: true })
           .text('Email', emailX, tableTop, { bold: true })
           .text('Role', roleX, tableTop, { bold: true })
           .text('Specialty', specialtyX, tableTop, { bold: true })
           .text('Contact', contactX, tableTop, { bold: true });
        
        // Draw line under headers
        doc.moveTo(nameX, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();
        
        let currentY = tableTop + 25;
        
        // Add user data
        users.forEach((user, index) => {
            // Check if we need a new page
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
            
            const specialty = user.role === 'doctor' ? (user.specialty || 'N/A') : '-';
            
            doc.fontSize(9)
               .text(user.fullName || 'N/A', nameX, currentY)
               .text(user.email || 'N/A', emailX, currentY)
               .text(user.role || 'N/A', roleX, currentY)
               .text(specialty, specialtyX, currentY)
               .text(user.contactNo || 'N/A', contactX, currentY);
            
            currentY += 20;
        });
        
        // Add footer
        doc.fontSize(8)
           .text('Healthcare Management System - Generated Report', 50, doc.page.height - 50, {
               align: 'center',
               lineBreak: false
           });
        
        // Finalize the PDF
        doc.end();
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Define role responsibilities
const responsibilities = {
    admin: [
        'System administration and user management',
        'Access control and security oversight',
        'Generate reports and analytics',
        'Manage system configurations'
    ],
    doctor: [
        'Patient diagnosis and treatment',
        'Medical record management',
        'Prescription and medication orders',
        'Patient consultation and care planning'
    ],
    nurse: [
        'Patient care and monitoring',
        'Medication administration',
        'Vital signs recording',
        'Assist doctors with procedures'
    ],
    receptionist: [
        'Patient appointment scheduling',
        'Front desk operations',
        'Patient registration and check-in',
        'Maintain patient records'
    ],
    pharmacist: [
        'Medication dispensing and verification',
        'Inventory management',
        'Drug interaction checking',
        'Patient medication counseling'
    ]
};

// Generate PDF for individual user
exports.generateUserPDF = async (req, res) => {
    try {
        console.log('Generating PDF for user:', req.params.id);
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        const fileName = `${(user.fullName || user.name || 'user').replace(/\s+/g, '_')}_profile.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        
        // Handle PDF generation errors
        doc.on('error', (err) => {
            console.error('PDF generation error:', err);
            // Only send error if headers haven't been sent
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error generating PDF' });
            }
        });
        
        // Pipe the PDF document to the response with error handling
        doc.pipe(res);
        
        // Add header with logo placeholder and title
        doc.fontSize(24)
           .fillColor('#1976d2')
           .text('Healthcare Management System', { align: 'center' });
        
        doc.fontSize(18)
           .fillColor('#333')
           .text('User Profile Report', { align: 'center' });
        
        doc.moveDown(2);
        
        // Add generation info
        doc.fontSize(10)
           .fillColor('#666')
           .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        
        doc.moveDown();
        
        // Add user profile section
        doc.fontSize(16)
           .fillColor('#1976d2')
           .text('Personal Information', { underline: true });
        
        doc.moveDown(0.5);
        
        // Create a styled info box
        const infoStartY = doc.y;
        doc.rect(50, infoStartY, 495, 220)  // Increased height for more content
           .fillAndStroke('#f8f9fa', '#e9ecef');
        
        // Add user details in a structured format
        doc.fillColor('#333')
           .fontSize(12);
        
        const leftColumn = 70;
        const rightColumn = 320;
        const labelWidth = 120;  // Width for labels
        let currentY = infoStartY + 20;
        
        // Helper function for consistent label-value pairs
        const addField = (label, value, useColor = null) => {
            doc.font('Helvetica').fillColor('#333')
               .text(label, leftColumn, currentY);
            
            if (useColor) doc.fillColor(useColor);
            doc.font('Helvetica-Bold')
               .text(value || 'N/A', leftColumn + labelWidth, currentY);
            
            currentY += 25;
            return doc.fillColor('#333');  // Reset color
        };
        
        // Add fields with consistent formatting
        addField('Full Name:', user.fullName || user.name);
        addField('Email Address:', user.email);
        addField('Contact Number:', user.contactNo);
        addField('Role:', 
                user.role.charAt(0).toUpperCase() + user.role.slice(1), 
                '#1976d2');
        
        // Add specialty for doctors
        if (user.role === 'doctor' && user.specialty) {
            currentY += 25;
            doc.fillColor('#333')
               .font('Helvetica')
               .text('Specialty:', leftColumn, currentY, { continued: true })
               .font('Helvetica-Bold')
               .fillColor('#4caf50')
               .text(` ${user.specialty}`, { continued: false });
        }
        
        // Right column with formatted dates
        let rightY = infoStartY + 20;
        const rightLabelWidth = 130;
        
        // Helper function for right column fields
        const addRightField = (label, value) => {
            doc.font('Helvetica').fillColor('#333')
               .text(label, rightColumn, rightY);
            
            doc.font('Helvetica-Bold')
               .text(value || 'N/A', rightColumn + rightLabelWidth, rightY);
            
            rightY += 25;
        };
        
        // Add right column fields
        addRightField('User ID:', user._id);
        addRightField('Account Created:', 
            new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        );
        addRightField('Last Updated:', 
            new Date(user.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        );
        
        // Add address with proper formatting
        doc.font('Helvetica').fillColor('#333')
           .text('Address:', leftColumn, currentY);
           
        // Create a box for address with background
        const addressY = currentY + 5;
        const addressHeight = 50;
        doc.rect(leftColumn + labelWidth - 10, addressY - 5, 400, addressHeight)
           .fill('#ffffff');
           
        doc.font('Helvetica-Bold')
           .fillColor('#333')
           .text(user.address || 'N/A', leftColumn + labelWidth, addressY, {
               width: 380,
               align: 'left',
               lineGap: 5
           });
        
        doc.moveDown(3);
        
        // Add role responsibilities section
        doc.fontSize(16)
           .fillColor('#1976d2')
           .font('Helvetica')
           .text('Role & Responsibilities', { underline: true });
        
        doc.moveDown(0.5);
    
        
        const userResponsibilities = responsibilities[user.role] || ['General healthcare support'];
        
        doc.fontSize(11)
           .fillColor('#333')
           .font('Helvetica');
        
        userResponsibilities.forEach((responsibility, index) => {
            doc.text(`• ${responsibility}`, 70, doc.y, { 
                width: 450,
                lineGap: 3
            });
        });
        
        doc.moveDown(2);
        
        // Add account status section
        doc.fontSize(16)
           .fillColor('#1976d2')
           .font('Helvetica')
           .text('Account Status', { underline: true });
        
        doc.moveDown(0.5);
        
        const statusY = doc.y;
        doc.rect(50, statusY, 495, 60)
           .fillAndStroke('#e8f5e8', '#4caf50');
        
        doc.fontSize(12)
           .fillColor('#2e7d32')
           .font('Helvetica-Bold')
           .text('✓ Active Account', 70, statusY + 20);
        
        doc.fontSize(10)
           .fillColor('#666')
           .font('Helvetica')
           .text('This user account is currently active and has full system access.', 70, statusY + 40);
        
        // Add footer
        doc.fontSize(8)
           .fillColor('#999')
           .text('This document is confidential and intended for authorized personnel only.', 50, doc.page.height - 50, {
               align: 'center',
               width: 500
           });
        
        // Finalize the PDF
        doc.end();
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add user (Admin can create staff)
const { validationResult } = require('express-validator');

exports.addUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const {
        fullName,
        email,
        contactNo,
        address,
        role,
        password,
        gender,
        dob,
        nic,
        maritalStatus,
        department,
        specialty,
        emergencyContactName,
        emergencyContactNo
    } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const userData = {
            fullName: fullName || '',
            email,
            contactNo,
            address,
            role,
            password,
            gender,
            dob,
            nic,
            maritalStatus,
            department,
            specialty,
            emergencyContactName,
            emergencyContactNo
        };

        // Handle profile image path correctly
        if (req.file) {
            // Use forward slashes for URL compatibility
            userData.profileImage = `profileImages/${req.file.filename}`;
            console.log('Profile image path set to:', userData.profileImage);
        }

        const newUser = new User(userData);
        await newUser.save();

        const safeUser = newUser.toObject();
        delete safeUser.password;

        res.status(201).json({ message: 'User created successfully', user: safeUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user by ID
exports.getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array(),
            requestBody: req.body // For debugging
        });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const body = req.body;

        // Handle fullName and name correctly
        user.fullName = body.fullName || body.name || user.fullName;
        user.name = body.fullName || body.name || user.name;
        
        // Only update fields if they are provided, even if empty strings
        if (body.contactNo !== undefined) user.contactNo = body.contactNo;
        if (body.address !== undefined) user.address = body.address;
        if (body.email !== undefined) user.email = body.email;
        if (body.role !== undefined) user.role = body.role;
        if (body.gender !== undefined) user.gender = body.gender;
        if (body.dob !== undefined) user.dob = body.dob;
        if (body.nic !== undefined) user.nic = body.nic;
        if (body.maritalStatus !== undefined) user.maritalStatus = body.maritalStatus;
        if (body.department !== undefined) user.department = body.department;
        if (body.specialty !== undefined) user.specialty = body.specialty;
        if (body.emergencyContactName !== undefined) user.emergencyContactName = body.emergencyContactName;
        if (body.emergencyContactNo !== undefined) user.emergencyContactNo = body.emergencyContactNo;

        if (body.password) user.password = body.password; // hashed by pre-save
        // Handle profile image path correctly
        if (req.file) {
            // Use forward slashes for URL compatibility
            user.profileImage = `profileImages/${req.file.filename}`;
            console.log('Profile image path updated to:', user.profileImage);
        }

        await user.save();

        // Convert to object and remove password
        const safeUser = user.toObject();
        delete safeUser.password;

        console.log('User updated successfully:', safeUser._id);
        res.status(200).json({ message: 'User updated successfully', user: safeUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1d' }
        );

        res.status(200).json({ message: 'Login successful', token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Forgot password
const { sendMail } = require('../Utils/mailer');
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set reset token and expiration (1 hour)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Build reset URL (frontend should provide route to accept token)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        const subject = 'Password reset request';
        const html = `
            <p>Hello ${user.fullName || user.name || ''},</p>
            <p>You requested a password reset. Click the link below to reset your password. This link expires in 1 hour.</p>
            <p><a href="${resetUrl}">Reset password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        // Send email
        const { previewUrl } = await sendMail({ to: email, subject, html, text: `Reset your password: ${resetUrl}` });

        const responsePayload = { message: 'Password reset email sent' };
        if (previewUrl) {
            // Include Ethereal preview link for development/testing
            responsePayload.previewUrl = previewUrl;
            responsePayload.resetToken = resetToken; // helpful for testing; remove in production
        }

        res.status(200).json(responsePayload);
    } catch (err) {
        console.error('forgotPassword error', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
    try {
        console.log('Starting getDoctors function...');
        
        // Query for doctors
        const query = { role: "doctor" };
        console.log('Searching for doctors with query:', query);
        
        const doctors = await User.find(query).select('_id name contactNo');
        console.log('Database query completed');
        console.log('Number of doctors found:', doctors?.length || 0);
        
        if (!doctors || doctors.length === 0) {
            console.log('No doctors found in database');
            return res.status(404).json({ message: "No doctors found" });
        }

        // Log success but don't log sensitive data
        console.log(`Successfully found ${doctors.length} doctors`);
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error in getDoctors function:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({ 
            message: "Error fetching doctors",
            error: error.message
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // Hash the token to compare with stored hash
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        // Update password
        user.password = password; // Will be hashed by pre-save middleware
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
