const Issue = require('../Model/IssueModel');
const Product = require('../Model/ProductModel');
const Activity = require('../Model/ActivityModel');
const mongoose = require('mongoose');

// ==================== ISSUE MANAGEMENT ====================

// Get all issues with filtering and pagination
exports.getIssues = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type = '',
            status = '',
            startDate = '',
            endDate = '',
            search = ''
        } = req.query;

        // Build query
        let query = {};

        // Filter by type
        if (type) {
            query.type = type;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.issueDate = {};
            if (startDate) {
                query.issueDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.issueDate.$lte = new Date(endDate);
            }
        }

        // Search by issue number, patient name, or department name
        if (search) {
            query.$or = [
                { issueNumber: { $regex: search, $options: 'i' } },
                { 'patient.name': { $regex: search, $options: 'i' } },
                { 'patient.id': { $regex: search, $options: 'i' } },
                { 'department.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const issues = await Issue.find(query)
            .sort({ issueDate: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v');

        // Get total count
        const total = await Issue.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                issues,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching issues',
            error: err.message
        });
    }
};

// Get single issue by ID
exports.getIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('items.productId', 'name sku category')
            .select('-__v');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.status(200).json({
            success: true,
            data: issue
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching issue',
            error: err.message
        });
    }
};

// Create new issue
exports.createIssue = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            type,
            patient,
            department,
            items,
            notes,
            prescriptionId
        } = req.body;

        // Validate required fields
        if (!type || !items || items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Issue type and items are required'
            });
        }

        // Validate type-specific requirements (only for specific types)
        if ((type === 'outpatient' || type === 'inpatient') && patient) {
            // Patient info is provided, validate it has required fields
            if (!patient.name) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: 'Patient name is required when patient information is provided'
                });
            }
        }

        if (type === 'department' && department) {
            // Department info is provided, validate it has required fields
            if (!department.name || !department.id) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: 'Department name and ID are required for department issues'
                });
            }
        }

        // Validate inpatient-specific fields (only if patient info is provided)
        if (type === 'inpatient' && patient && (!patient.bedNumber || !patient.wardId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Bed number and ward ID are required for inpatient issues'
            });
        }

        // Validate stock availability and calculate total
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Check stock availability
            if (product.currentStock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`
                });
            }

            // Use selling price as unit price
            const unitPrice = item.unitPrice || product.sellingPrice;
            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;

            validatedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                batchNumber: item.batchNumber || product.batchNumber,
                expiryDate: item.expiryDate || product.expiryDate
            });

            // Update product stock
            product.currentStock -= item.quantity;
            
            // Add to product order history
            const issuedToName = patient?.name || department?.name || 'General Issue';
            product.orderHistory.push({
                type: 'issue',
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                issuedTo: issuedToName,
                issuedBy: {
                    id: req.user?.id,
                    name: req.user?.name || 'Unknown',
                    role: req.user?.role || 'Unknown'
                },
                date: new Date(),
                notes: notes || `${type} issue`
            });
            
            await product.save({ session });
        }

        // Create issue
        const issue = new Issue({
            type,
            patient,
            department,
            items: validatedItems,
            issuedBy: {
                id: req.user?.id,
                name: req.user?.name || 'Unknown',
                role: req.user?.role || 'Unknown'
            },
            issueDate: new Date(),
            status: 'issued',
            notes,
            totalAmount,
            prescriptionId
        });

        await issue.save({ session });

        // Update product order history with issue reference
        for (const item of validatedItems) {
            const product = await Product.findById(item.productId).session(session);
            if (product && product.orderHistory.length > 0) {
                // Update the last entry (the one we just added)
                const lastHistoryEntry = product.orderHistory[product.orderHistory.length - 1];
                lastHistoryEntry.issueId = issue._id;
                lastHistoryEntry.issueNumber = issue.issueNumber;
                await product.save({ session });
            }
        }

        // Log activity
        if (req.user) {
            await Activity.create([{
                type: 'issue_created',
                description: `Created ${type} issue: ${issue.issueNumber} (${items.length} items, LKR ${totalAmount.toFixed(2)})`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Issue',
                entityId: issue._id,
                entityName: issue.issueNumber,
                metadata: {
                    type,
                    itemCount: items.length,
                    totalAmount,
                    patientName: patient?.name,
                    departmentName: department?.name
                },
                severity: 'success'
            }], { session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: {
                issueId: issue._id,
                issueNumber: issue.issueNumber,
                issue
            }
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

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
            message: 'Error creating issue',
            error: err.message
        });
    }
};

// Update issue status
exports.updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Validate status
        const validStatuses = ['pending', 'issued', 'partial', 'returned', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
            });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        const oldStatus = issue.status;
        issue.status = status;

        await issue.save();

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'issue_updated',
                description: `Updated issue ${issue.issueNumber} status: ${oldStatus} → ${status}`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Issue',
                entityId: issue._id,
                entityName: issue.issueNumber,
                metadata: {
                    oldStatus,
                    newStatus: status
                },
                severity: 'info'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Issue status updated successfully',
            data: issue
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating issue status',
            error: err.message
        });
    }
};

// Get today's issues count and revenue
exports.getTodayIssues = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = await Issue.aggregate([
            {
                $match: {
                    issueDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        const data = result.length > 0 ? result[0] : { count: 0, totalRevenue: 0 };

        res.status(200).json({
            success: true,
            data: {
                todayIssues: data.count,
                todayRevenue: data.totalRevenue
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s issues',
            error: err.message
        });
    }
};
