const Prescription = require('../Model/PrescriptionModel');
const Product = require('../Model/ProductModel');
const Issue = require('../Model/IssueModel');
const Activity = require('../Model/ActivityModel');
const mongoose = require('mongoose');

// ==================== PRESCRIPTION MANAGEMENT ====================

// Get all prescriptions with search and filtering
exports.getPrescriptions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = '',
            search = '',
            date = ''
        } = req.query;

        // Build query
        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date
        if (date) {
            const searchDate = new Date(date);
            const nextDate = new Date(searchDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            query.date = {
                $gte: searchDate,
                $lt: nextDate
            };
        }

        // Search by patient name, patient ID, prescription number, or doctor name
        if (search) {
            query.$or = [
                { prescriptionNumber: { $regex: search, $options: 'i' } },
                { 'patient.name': { $regex: search, $options: 'i' } },
                { 'patient.id': search },
                { 'doctor.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const prescriptions = await Prescription.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v');

        // Get total count
        const total = await Prescription.countDocuments(query);
        
        // Get status counts
        const pending = await Prescription.countDocuments({ status: 'pending' });
        const completed = await Prescription.countDocuments({ status: 'completed' });

        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                prescriptions,
                total,
                pending,
                completed,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching prescriptions',
            error: err.message
        });
    }
};

// Get single prescription by ID
exports.getPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('doctor.id', 'name email contactNo')
            .populate('dispensedBy.id', 'name role')
            .select('-__v');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        res.status(200).json({
            success: true,
            data: prescription
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching prescription',
            error: err.message
        });
    }
};

// Create new prescription
exports.createPrescription = async (req, res) => {
    try {
        const {
            patient,
            doctor,
            medications,
            diagnosis,
            notes,
            followUpDate,
            priority
        } = req.body;

        // Validate required fields
        if (!patient || !doctor || !medications || medications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Patient, doctor, and at least one medication are required'
            });
        }

        // Create time string
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        const prescription = new Prescription({
            patient,
            doctor,
            medications,
            date: now,
            time,
            status: 'pending',
            diagnosis,
            notes,
            followUpDate,
            priority: priority || 'normal'
        });

        await prescription.save();

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription
        });
    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating prescription',
            error: err.message
        });
    }
};

// Dispense prescription (creates issue and updates stock)
exports.dispensePrescription = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const prescriptionId = req.params.id;
        const { medications } = req.body;

        // Get prescription
        const prescription = await Prescription.findById(prescriptionId).session(session);

        if (!prescription) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        // Check if already dispensed
        if (prescription.status === 'completed') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Prescription already dispensed'
            });
        }

        // Validate and prepare issue items
        const issueItems = [];
        let totalAmount = 0;

        for (const med of medications || prescription.medications) {
            const medicationName = med.name || med.medicationName;
            const quantity = med.quantityDispensed || med.quantity;

            // Find product by medication name (case-insensitive search)
            const product = await Product.findOne({
                name: { $regex: new RegExp(`^${medicationName}$`, 'i') },
                status: 'active'
            }).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: `Medication not found in inventory: ${medicationName}`
                });
            }

            // Check stock availability
            if (product.currentStock < quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${quantity}`
                });
            }

            const unitPrice = product.sellingPrice;
            const totalPrice = unitPrice * quantity;
            totalAmount += totalPrice;

            issueItems.push({
                productId: product._id,
                productName: product.name,
                quantity: quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                batchNumber: med.batchNumber || product.batchNumber,
                expiryDate: product.expiryDate
            });

            // Update stock
            product.currentStock -= quantity;
            await product.save({ session });
        }

        // Create issue
        const issue = new Issue({
            type: 'outpatient',
            patient: {
                id: prescription.patient.id.toString(),
                name: prescription.patient.name,
                type: 'outpatient'
            },
            items: issueItems,
            issuedBy: {
                id: req.user?.id,
                name: req.user?.name || 'Pharmacist',
                role: req.user?.role || 'pharmacist'
            },
            issueDate: new Date(),
            status: 'issued',
            notes: `Dispensed from prescription: ${prescription.prescriptionNumber}`,
            totalAmount,
            prescriptionId: prescription._id
        });

        await issue.save({ session });

        // Update prescription
        prescription.status = 'completed';
        prescription.dispensedBy = {
            id: req.user?.id,
            name: req.user?.name || 'Pharmacist'
        };
        prescription.dispensedAt = new Date();
        prescription.issueId = issue._id;

        await prescription.save({ session });

        // Log activity
        if (req.user) {
            await Activity.create([{
                type: 'prescription_dispensed',
                description: `Dispensed prescription ${prescription.prescriptionNumber} for ${prescription.patient.name}`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Prescription',
                entityId: prescription._id,
                entityName: prescription.prescriptionNumber,
                metadata: {
                    patientName: prescription.patient.name,
                    medicationCount: issueItems.length,
                    totalAmount,
                    issueNumber: issue.issueNumber
                },
                severity: 'success'
            }], { session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Prescription dispensed successfully',
            data: {
                prescription,
                issueId: issue._id,
                issueNumber: issue.issueNumber,
                totalAmount
            }
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        res.status(500).json({
            success: false,
            message: 'Error dispensing prescription',
            error: err.message
        });
    }
};

// Update prescription status
exports.updatePrescriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Validate status
        const validStatuses = ['pending', 'completed', 'cancelled', 'partial'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
            });
        }

        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        prescription.status = status;
        await prescription.save();

        res.status(200).json({
            success: true,
            message: 'Prescription status updated successfully',
            data: prescription
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating prescription status',
            error: err.message
        });
    }
};

// Delete/Cancel prescription
exports.deletePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        // Don't allow deletion of dispensed prescriptions
        if (prescription.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a dispensed prescription'
            });
        }

        // Change status to cancelled instead of deleting
        prescription.status = 'cancelled';
        await prescription.save();

        res.status(200).json({
            success: true,
            message: 'Prescription cancelled successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling prescription',
            error: err.message
        });
    }
};
