const Issue = require('../Model/IssueModel');
const Product = require('../Model/ProductModel');
const InventoryItem = require('../Model/InventoryItemModel');
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
        const deductionRecords = []; // Track what batches to deduct from

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

            // Get available inventory items for this product using FEFO (First Expiry First Out)
            const inventoryItems = await InventoryItem.find({
                product: product._id,
                status: 'available',
                quantity: { $gt: 0 },
                expiryDate: { $gt: new Date() } // Only non-expired items
            })
            .session(session)
            .sort({ expiryDate: 1 }); // Sort by expiry date ascending (FEFO)

            // Calculate total available stock
            const totalAvailable = inventoryItems.reduce((sum, invItem) => sum + invItem.quantity, 0);

            if (totalAvailable < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`
                });
            }

            // Allocate stock from batches using FEFO
            let remainingQty = item.quantity;
            const batchDeductions = [];
            let weightedUnitPrice = 0;
            let totalDeductedQty = 0;

            for (const invItem of inventoryItems) {
                if (remainingQty <= 0) break;

                const qtyToDeduct = Math.min(remainingQty, invItem.quantity);
                
                batchDeductions.push({
                    inventoryItemId: invItem._id,
                    batchNumber: invItem.batchNumber,
                    expiryDate: invItem.expiryDate,
                    quantity: qtyToDeduct,
                    unitPrice: invItem.sellingPrice
                });

                // Calculate weighted average price
                weightedUnitPrice += invItem.sellingPrice * qtyToDeduct;
                totalDeductedQty += qtyToDeduct;
                
                remainingQty -= qtyToDeduct;
            }

            // Calculate average unit price for this item
            const unitPrice = weightedUnitPrice / totalDeductedQty;
            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;

            // Store validated item with batch information
            validatedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                batchNumber: batchDeductions[0].batchNumber, // Primary batch
                expiryDate: batchDeductions[0].expiryDate,
                batches: batchDeductions // Store all batch allocations
            });

            // Store deduction records for later processing
            deductionRecords.push({
                productId: product._id,
                productName: product.name,
                batchDeductions
            });
        }

        // Deduct stock from inventory items
        const issuedToName = patient?.name || department?.name || 'General Issue';
        
        for (const record of deductionRecords) {
            for (const batch of record.batchDeductions) {
                const invItem = await InventoryItem.findById(batch.inventoryItemId).session(session);
                
                if (!invItem) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(500).json({
                        success: false,
                        message: `Inventory item not found during deduction`
                    });
                }

                // Deduct quantity
                invItem.quantity -= batch.quantity;
                invItem.updatedBy = req.user?.id;
                
                // Add transaction record
                invItem.transactions.push({
                    type: 'issue',
                    quantity: -batch.quantity,
                    balanceAfter: invItem.quantity,
                    reference: '', // Will be updated with issue number after creation
                    performedBy: {
                        id: req.user?.id,
                        name: req.user?.name || 'Unknown',
                        role: req.user?.role || 'Unknown'
                    },
                    notes: `Issued to ${issuedToName} - ${type} issue`
                });

                await invItem.save({ session });
            }
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

        // Update inventory transaction records with issue number
        for (const record of deductionRecords) {
            for (const batch of record.batchDeductions) {
                const invItem = await InventoryItem.findById(batch.inventoryItemId).session(session);
                if (invItem && invItem.transactions.length > 0) {
                    const lastTransaction = invItem.transactions[invItem.transactions.length - 1];
                    lastTransaction.reference = issue.issueNumber;
                    await invItem.save({ session });
                }
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
