const User = require('../Model/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

// Get all users with optional search
exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        // If search parameter is provided, search by name (case-insensitive)
        if (search) {
            query = {
                name: { $regex: search, $options: 'i' }
            };
        }
        
        const users = await User.find(query).select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
            name: { $regex: name, $options: 'i' }
        }).select('-password');
        
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generate PDF report of all users
exports.generateUsersPDF = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users-report.pdf');
        
        // Pipe the PDF document to the response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('Healthcare System - Users Report', { align: 'center' });
        doc.moveDown();
        
        // Add generation date
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        
        // Add summary statistics
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
        const emailX = 200;
        const roleX = 350;
        const contactX = 450;
        
        doc.fontSize(10)
           .text('Name', nameX, tableTop, { bold: true })
           .text('Email', emailX, tableTop, { bold: true })
           .text('Role', roleX, tableTop, { bold: true })
           .text('Contact', contactX, tableTop, { bold: true });
        
        // Draw line under headers
        doc.moveTo(nameX, tableTop + 15)
           .lineTo(520, tableTop + 15)
           .stroke();
        
        let currentY = tableTop + 25;
        
        // Add user data
        users.forEach((user, index) => {
            // Check if we need a new page
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
            
            doc.fontSize(9)
               .text(user.name || 'N/A', nameX, currentY)
               .text(user.email || 'N/A', emailX, currentY)
               .text(user.role || 'N/A', roleX, currentY)
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

// Generate PDF for individual user
exports.generateUserPDF = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${user.name.replace(/\s+/g, '_')}_profile.pdf`);
        
        // Pipe the PDF document to the response
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
        doc.rect(50, infoStartY, 495, 180)
           .fillAndStroke('#f8f9fa', '#e9ecef');
        
        // Add user details in a structured format
        doc.fillColor('#333')
           .fontSize(12);
        
        const leftColumn = 70;
        const rightColumn = 320;
        let currentY = infoStartY + 20;
        
        // Left column
        doc.text('Full Name:', leftColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .text(` ${user.name}`, { continued: false });
        
        currentY += 25;
        doc.font('Helvetica')
           .text('Email Address:', leftColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .text(` ${user.email}`, { continued: false });
        
        currentY += 25;
        doc.font('Helvetica')
           .text('Contact Number:', leftColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .text(` ${user.contactNo}`, { continued: false });
        
        currentY += 25;
        doc.font('Helvetica')
           .text('Role:', leftColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .fillColor('#1976d2')
           .text(` ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`, { continued: false });
        
        // Right column
        currentY = infoStartY + 20;
        doc.fillColor('#333')
           .font('Helvetica')
           .text('User ID:', rightColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .text(` ${user._id}`, { continued: false });
        
        currentY += 25;
        doc.font('Helvetica')
           .text('Account Created:', rightColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .text(` ${new Date(user.createdAt).toLocaleDateString()}`, { continued: false });
        
        currentY += 25;
        doc.font('Helvetica')
           .text('Last Updated:', rightColumn, currentY, { continued: true })
           .font('Helvetica-Bold')
           .text(` ${new Date(user.updatedAt).toLocaleDateString()}`, { continued: false });
        
        // Add address in full width
        currentY += 25;
        doc.font('Helvetica')
           .text('Address:', leftColumn, currentY);
        currentY += 15;
        doc.font('Helvetica-Bold')
           .text(user.address, leftColumn, currentY, { 
               width: 450, 
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
exports.addUser = async (req, res) => {
    const { name, contactNo, address, email, role, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const newUser = new User({ name, contactNo, address, email, role, password });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
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
    const { name, contactNo, address, email, role, password } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.contactNo = contactNo || user.contactNo;
        user.address = address || user.address;
        user.email = email || user.email;
        user.role = role || user.role;
        if (password) user.password = password; // will be hashed by pre-save

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
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
        
        // In a real app, you would send this via email
        // For now, we'll return it in the response for testing
        res.status(200).json({ 
            message: 'Password reset token generated successfully',
            resetToken, // Remove this in production
            instructions: `Use this token to reset your password: ${resetToken}`
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
