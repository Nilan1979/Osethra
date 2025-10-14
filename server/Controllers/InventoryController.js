const Product = require('../Model/ProductModel');
const Category = require('../Model/CategoryModel');
const Activity = require('../Model/ActivityModel');

// ==================== PRODUCT MANAGEMENT ====================

// Get all products with pagination, search, and filtering
exports.getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};

        // Search by name, SKU, or barcode
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v');

        // Get total count for pagination
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                products,
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
            message: 'Error fetching products',
            error: err.message
        });
    }
};

// Get single product by ID
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('-__v');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        // Handle invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: err.message
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            description,
            manufacturer,
            supplier,
            buyingPrice,
            sellingPrice,
            initialStock,
            minStock,
            maxStock,
            reorderPoint,
            unit,
            batchNumber,
            manufactureDate,
            expiryDate,
            storageLocation,
            barcode,
            prescription,
            status,
            notes
        } = req.body;

        // Validate required fields
        if (!name || !sku || !category || !buyingPrice || !sellingPrice || 
            initialStock === undefined || !minStock || !unit) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this SKU already exists'
            });
        }

        // Check if barcode already exists (if provided)
        if (barcode) {
            const existingBarcode = await Product.findOne({ barcode });
            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this barcode already exists'
                });
            }
        }

        // Validate selling price >= buying price
        if (parseFloat(sellingPrice) < parseFloat(buyingPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Selling price must be greater than or equal to buying price'
            });
        }

        // Validate expiry date > manufacture date (if both provided)
        if (manufactureDate && expiryDate) {
            if (new Date(expiryDate) <= new Date(manufactureDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'Expiry date must be after manufacture date'
                });
            }
        }

        // Create product
        const product = new Product({
            name,
            sku: sku.toUpperCase(),
            category,
            description,
            manufacturer,
            supplier,
            buyingPrice: parseFloat(buyingPrice),
            sellingPrice: parseFloat(sellingPrice),
            currentStock: parseInt(initialStock),
            minStock: parseInt(minStock),
            maxStock: maxStock ? parseInt(maxStock) : undefined,
            reorderPoint: reorderPoint ? parseInt(reorderPoint) : undefined,
            unit,
            batchNumber,
            manufactureDate,
            expiryDate,
            storageLocation,
            barcode,
            prescription: prescription || false,
            status: status || 'active',
            notes,
            createdBy: req.user?.id // Assumes auth middleware sets req.user
        });

        await product.save();

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'product_added',
                description: `Added new product: ${product.name}`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Product',
                entityId: product._id,
                entityName: product.name,
                severity: 'success'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
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
            message: 'Error creating product',
            error: err.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const {
            name,
            sku,
            category,
            description,
            manufacturer,
            supplier,
            buyingPrice,
            sellingPrice,
            currentStock,
            minStock,
            maxStock,
            reorderPoint,
            unit,
            batchNumber,
            manufactureDate,
            expiryDate,
            storageLocation,
            barcode,
            prescription,
            status,
            notes
        } = req.body;

        // Check if SKU is being changed and if it already exists
        if (sku && sku.toUpperCase() !== product.sku) {
            const existingSKU = await Product.findOne({ sku: sku.toUpperCase() });
            if (existingSKU) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this SKU already exists'
                });
            }
        }

        // Check if barcode is being changed and if it already exists
        if (barcode && barcode !== product.barcode) {
            const existingBarcode = await Product.findOne({ barcode });
            if (existingBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this barcode already exists'
                });
            }
        }

        // Validate selling price >= buying price
        const newBuyingPrice = buyingPrice !== undefined ? parseFloat(buyingPrice) : product.buyingPrice;
        const newSellingPrice = sellingPrice !== undefined ? parseFloat(sellingPrice) : product.sellingPrice;
        
        if (newSellingPrice < newBuyingPrice) {
            return res.status(400).json({
                success: false,
                message: 'Selling price must be greater than or equal to buying price'
            });
        }

        // Validate expiry date > manufacture date
        const newMfgDate = manufactureDate || product.manufactureDate;
        const newExpDate = expiryDate || product.expiryDate;
        
        if (newMfgDate && newExpDate && new Date(newExpDate) <= new Date(newMfgDate)) {
            return res.status(400).json({
                success: false,
                message: 'Expiry date must be after manufacture date'
            });
        }

        // Track stock changes for activity log
        const stockChanged = currentStock !== undefined && currentStock !== product.currentStock;
        const oldStock = product.currentStock;

        // Update fields
        if (name !== undefined) product.name = name;
        if (sku !== undefined) product.sku = sku.toUpperCase();
        if (category !== undefined) product.category = category;
        if (description !== undefined) product.description = description;
        if (manufacturer !== undefined) product.manufacturer = manufacturer;
        if (supplier !== undefined) product.supplier = supplier;
        if (buyingPrice !== undefined) product.buyingPrice = parseFloat(buyingPrice);
        if (sellingPrice !== undefined) product.sellingPrice = parseFloat(sellingPrice);
        if (currentStock !== undefined) product.currentStock = parseInt(currentStock);
        if (minStock !== undefined) product.minStock = parseInt(minStock);
        if (maxStock !== undefined) product.maxStock = parseInt(maxStock);
        if (reorderPoint !== undefined) product.reorderPoint = parseInt(reorderPoint);
        if (unit !== undefined) product.unit = unit;
        if (batchNumber !== undefined) product.batchNumber = batchNumber;
        if (manufactureDate !== undefined) product.manufactureDate = manufactureDate;
        if (expiryDate !== undefined) product.expiryDate = expiryDate;
        if (storageLocation !== undefined) product.storageLocation = storageLocation;
        if (barcode !== undefined) product.barcode = barcode;
        if (prescription !== undefined) product.prescription = prescription;
        if (status !== undefined) product.status = status;
        if (notes !== undefined) product.notes = notes;
        
        product.updatedBy = req.user?.id;

        await product.save();

        // Log activity
        if (req.user) {
            let activityDescription = `Updated product: ${product.name}`;
            if (stockChanged) {
                activityDescription += ` (Stock: ${oldStock} → ${currentStock})`;
            }

            await Activity.create({
                type: 'product_updated',
                description: activityDescription,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Product',
                entityId: product._id,
                entityName: product.name,
                metadata: {
                    stockChanged,
                    oldStock,
                    newStock: currentStock
                },
                severity: 'info'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
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
            message: 'Error updating product',
            error: err.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Store product info before deletion
        const productName = product.name;
        const productSKU = product.sku;

        await Product.findByIdAndDelete(req.params.id);

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'product_deleted',
                description: `Deleted product: ${productName} (SKU: ${productSKU})`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Product',
                entityName: productName,
                severity: 'warning'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: err.message
        });
    }
};

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).select('-__v');

        // Also get product count per category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ category: category.name });
                return {
                    ...category.toObject(),
                    productCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: categoriesWithCount
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: err.message
        });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category already exists (case-insensitive)
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        const category = new Category({
            name: name.trim(),
            description,
            icon,
            createdBy: req.user?.id
        });

        await category.save();

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'category_added',
                description: `Added new category: ${category.name}`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Category',
                entityId: category._id,
                entityName: category.name,
                severity: 'success'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
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
            message: 'Error creating category',
            error: err.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const categoryName = req.params.name;

        // Check if category exists
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category is default
        if (category.isDefault) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete default category'
            });
        }

        // Check if any products are using this category
        const productsCount = await Product.countDocuments({ category: categoryName });

        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productsCount} product(s) are using this category`,
                productCount: productsCount
            });
        }

        await Category.findByIdAndDelete(category._id);

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'category_deleted',
                description: `Deleted category: ${categoryName}`,
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Category',
                entityName: categoryName,
                severity: 'warning'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: err.message
        });
    }
};

// ==================== STOCK ALERTS SYSTEM ====================

// Get stock alerts (low stock, out of stock, expiring, expired)
exports.getStockAlerts = async (req, res) => {
    try {
        const { type } = req.query;

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        let alerts = {};

        // Low Stock: currentStock < minStock (but not zero)
        if (!type || type === 'low-stock') {
            alerts.lowStock = await Product.aggregate([
                {
                    $match: {
                        status: 'active',
                        currentStock: { $gt: 0 },
                        $expr: { $lt: ['$currentStock', '$minStock'] }
                    }
                },
                {
                    $project: {
                        name: 1,
                        sku: 1,
                        category: 1,
                        currentStock: 1,
                        minStock: 1,
                        unit: 1,
                        sellingPrice: 1,
                        stockPercentage: {
                            $multiply: [
                                { $divide: ['$currentStock', '$minStock'] },
                                100
                            ]
                        }
                    }
                },
                {
                    $sort: { stockPercentage: 1 }
                }
            ]);
        }

        // Out of Stock: currentStock = 0
        if (!type || type === 'out-of-stock') {
            alerts.outOfStock = await Product.find({
                status: 'active',
                currentStock: 0
            })
            .select('name sku category minStock unit sellingPrice')
            .sort({ name: 1 });
        }

        // Expiring Soon: expiryDate within next 30 days
        if (!type || type === 'expiring') {
            alerts.expiringItems = await Product.aggregate([
                {
                    $match: {
                        status: 'active',
                        expiryDate: {
                            $gte: today,
                            $lte: thirtyDaysFromNow
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        sku: 1,
                        category: 1,
                        currentStock: 1,
                        unit: 1,
                        expiryDate: 1,
                        batchNumber: 1,
                        daysLeft: {
                            $ceil: {
                                $divide: [
                                    { $subtract: ['$expiryDate', today] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: { daysLeft: 1 }
                }
            ]);
        }

        // Expired: expiryDate < today
        if (!type || type === 'expired') {
            alerts.expiredItems = await Product.aggregate([
                {
                    $match: {
                        status: 'active',
                        expiryDate: { $lt: today }
                    }
                },
                {
                    $project: {
                        name: 1,
                        sku: 1,
                        category: 1,
                        currentStock: 1,
                        unit: 1,
                        expiryDate: 1,
                        batchNumber: 1,
                        daysExpired: {
                            $ceil: {
                                $divide: [
                                    { $subtract: [today, '$expiryDate'] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: { daysExpired: -1 }
                }
            ]);
        }

        // Calculate totals
        const summary = {
            lowStockCount: alerts.lowStock?.length || 0,
            outOfStockCount: alerts.outOfStock?.length || 0,
            expiringCount: alerts.expiringItems?.length || 0,
            expiredCount: alerts.expiredItems?.length || 0,
            totalAlerts: (alerts.lowStock?.length || 0) + 
                        (alerts.outOfStock?.length || 0) + 
                        (alerts.expiringItems?.length || 0) + 
                        (alerts.expiredItems?.length || 0)
        };

        res.status(200).json({
            success: true,
            data: alerts,
            summary
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stock alerts',
            error: err.message
        });
    }
};

// ==================== DASHBOARD STATISTICS ====================

// Get comprehensive dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const Issue = require('../Model/IssueModel');
        const Prescription = require('../Model/PrescriptionModel');

        // Run all queries in parallel for better performance
        const [
            totalProducts,
            todayIssuesData,
            lowStockCount,
            expiredCount,
            inventoryValue,
            pendingPrescriptions,
            categoryCount,
            activeProductsCount
        ] = await Promise.all([
            // Total Products
            Product.countDocuments({ status: 'active' }),

            // Today's Issues and Revenue
            Issue.aggregate([
                {
                    $match: {
                        issueDate: {
                            $gte: today,
                            $lt: tomorrow
                        },
                        status: { $in: ['issued', 'partial'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        revenue: { $sum: '$totalAmount' }
                    }
                }
            ]),

            // Low Stock Count (including out of stock)
            Product.countDocuments({
                status: 'active',
                $expr: { $lte: ['$currentStock', '$minStock'] }
            }),

            // Expired Items Count
            Product.countDocuments({
                status: 'active',
                expiryDate: { $lt: today }
            }),

            // Total Inventory Value (buying price * current stock)
            Product.aggregate([
                {
                    $match: { status: 'active' }
                },
                {
                    $group: {
                        _id: null,
                        totalValue: {
                            $sum: {
                                $multiply: ['$buyingPrice', '$currentStock']
                            }
                        }
                    }
                }
            ]),

            // Pending Prescriptions
            Prescription.countDocuments({ status: 'pending' }),

            // Category Count
            Category.countDocuments(),

            // Active Products Count
            Product.countDocuments({ status: 'active', currentStock: { $gt: 0 } })
        ]);

        // Extract today's issues data
        const todayData = todayIssuesData.length > 0 ? todayIssuesData[0] : { count: 0, revenue: 0 };

        // Extract inventory value
        const inventoryValueData = inventoryValue.length > 0 ? inventoryValue[0].totalValue : 0;

        // Get top selling products (from issues in last 30 days)
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const topSellingProducts = await Issue.aggregate([
            {
                $match: {
                    issueDate: { $gte: thirtyDaysAgo },
                    status: { $in: ['issued', 'partial'] }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    productName: { $first: '$items.productName' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.totalPrice' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // Get products needing reorder
        const reorderProducts = await Product.aggregate([
            {
                $match: {
                    status: 'active',
                    reorderPoint: { $exists: true, $ne: null },
                    $expr: { $lte: ['$currentStock', '$reorderPoint'] }
                }
            },
            {
                $project: {
                    name: 1,
                    sku: 1,
                    currentStock: 1,
                    reorderPoint: 1,
                    minStock: 1
                }
            },
            { $limit: 10 }
        ]);

        // Calculate trends (compare with yesterday)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayIssuesData = await Issue.aggregate([
            {
                $match: {
                    issueDate: {
                        $gte: yesterday,
                        $lt: today
                    },
                    status: { $in: ['issued', 'partial'] }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        const yesterdayData = yesterdayIssuesData.length > 0 ? yesterdayIssuesData[0] : { count: 0, revenue: 0 };

        const revenueTrend = yesterdayData.revenue > 0 
            ? ((todayData.revenue - yesterdayData.revenue) / yesterdayData.revenue * 100).toFixed(2)
            : 0;

        const issuesTrend = yesterdayData.count > 0
            ? ((todayData.count - yesterdayData.count) / yesterdayData.count * 100).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                // Main Statistics
                totalProducts,
                todayRevenue: todayData.revenue,
                lowStock: lowStockCount,
                expired: expiredCount,
                totalValue: inventoryValueData,
                pendingPrescriptions,
                todayIssues: todayData.count,
                categories: categoryCount,
                activeProducts: activeProductsCount,

                // Trends
                trends: {
                    revenue: parseFloat(revenueTrend),
                    issues: parseFloat(issuesTrend)
                },

                // Additional Insights
                insights: {
                    topSellingProducts,
                    reorderProducts,
                    alertsSummary: {
                        lowStock: lowStockCount,
                        expired: expiredCount,
                        total: lowStockCount + expiredCount
                    }
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: err.message
        });
    }
};

// ==================== ACTIVITY TRACKING ====================

// Get recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        const { limit = 10, type = '', severity = '' } = req.query;

        let query = {};

        // Filter by type
        if (type) {
            query.type = type;
        }

        // Filter by severity
        if (severity) {
            query.severity = severity;
        }

        const activities = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .populate('user.id', 'name email role')
            .select('-__v');

        const total = await Activity.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                activities,
                total,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: err.message
        });
    }
};

// Log activity (helper method for manual logging)
exports.logActivity = async (activityData) => {
    try {
        const activity = new Activity(activityData);
        await activity.save();
        return activity;
    } catch (err) {
        console.error('Error logging activity:', err);
        return null;
    }
};

// ==================== PRODUCT ORDER HISTORY ====================

// Get product order history
exports.getProductOrderHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            page = 1, 
            limit = 50, 
            type = '', 
            startDate = '', 
            endDate = '' 
        } = req.query;

        // Find product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Filter order history
        let history = product.orderHistory || [];

        // Filter by type
        if (type) {
            history = history.filter(h => h.type === type);
        }

        // Filter by date range
        if (startDate) {
            const start = new Date(startDate);
            history = history.filter(h => new Date(h.date) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // End of day
            history = history.filter(h => new Date(h.date) <= end);
        }

        // Sort by date (newest first)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate pagination
        const total = history.length;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedHistory = history.slice(skip, skip + parseInt(limit));

        // Calculate statistics
        const stats = {
            totalTransactions: history.length,
            totalQuantityIssued: history
                .filter(h => h.type === 'issue')
                .reduce((sum, h) => sum + h.quantity, 0),
            totalQuantityReturned: history
                .filter(h => h.type === 'return')
                .reduce((sum, h) => sum + h.quantity, 0),
            totalRevenue: history
                .filter(h => h.type === 'issue')
                .reduce((sum, h) => sum + (h.totalPrice || 0), 0)
        };

        res.status(200).json({
            success: true,
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    sku: product.sku,
                    currentStock: product.currentStock
                },
                history: paginatedHistory,
                stats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product order history',
            error: err.message
        });
    }
};
