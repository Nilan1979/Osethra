const Product = require('../Model/ProductModel');
const InventoryItem = require('../Model/InventoryItemModel');
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

// Create new product (master data only - no stock)
exports.createProduct = async (req, res) => {
    try {
        console.log('Received product data:', req.body);

        const {
            name,
            sku,
            category,
            description,
            manufacturer,
            unit,
            barcode,
            prescription,
            status,
            notes
        } = req.body;

        // Validate required fields
        if (!name || !sku || !category || !unit) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, SKU, category, unit'
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

        // Create product (master data only - basic info + manufacturer details)
        const product = new Product({
            name,
            sku: sku.toUpperCase(),
            category,
            description,
            manufacturer,
            unit,
            barcode,
            prescription: prescription === 'yes' || prescription === true,
            status: status || 'active',
            notes,
            createdBy: req.user?._id
        });

        await product.save();

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'product_added',
                description: `Added new product: ${product.name} (${product.sku})`,
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Product',
                entityId: product._id,
                entityName: product.name,
                metadata: {
                    sku: product.sku,
                    category: product.category
                },
                severity: 'info'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully. You can now add inventory for this product.',
            data: product
        });
    } catch (err) {
        console.error('Error creating product:', err);

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            console.error('Validation errors:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        console.error('General error:', err.message);
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
            unit,
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

        // Update fields (only product master data)
        if (name !== undefined) product.name = name;
        if (sku !== undefined) product.sku = sku.toUpperCase();
        if (category !== undefined) product.category = category;
        if (description !== undefined) product.description = description;
        if (manufacturer !== undefined) product.manufacturer = manufacturer;
        if (unit !== undefined) product.unit = unit;
        if (barcode !== undefined) product.barcode = barcode;
        if (prescription !== undefined) product.prescription = prescription === 'yes' || prescription === true;
        if (status !== undefined) product.status = status;
        if (notes !== undefined) product.notes = notes;

        product.updatedBy = req.user?._id;

        await product.save();

        // Log activity
        if (req.user) {
            await Activity.create({
                type: 'product_updated',
                description: `Updated product: ${product.name} (${product.sku})`,
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Product',
                entityId: product._id,
                entityName: product.name,
                metadata: {},
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

        // Low Stock: availability = 'low-stock'
        if (!type || type === 'low-stock') {
            alerts.lowStock = await InventoryItem.find({
                availability: 'low-stock',
                status: 'available'
            })
                .populate('product', 'name sku category unit')
                .select('product batchNumber quantity minStock reorderPoint storageLocation expiryDate')
                .sort({ quantity: 1 })
                .lean();

            // Add calculated fields
            alerts.lowStock = alerts.lowStock.map(item => ({
                ...item,
                productName: item.product?.name,
                productSKU: item.product?.sku,
                category: item.product?.category,
                unit: item.product?.unit,
                stockPercentage: ((item.quantity / item.minStock) * 100).toFixed(2),
                recommendedReorderQty: Math.max(item.reorderPoint * 2 - item.quantity, item.minStock)
            }));
        }

        // Out of Stock: availability = 'out-of-stock'
        if (!type || type === 'out-of-stock') {
            alerts.outOfStock = await InventoryItem.find({
                availability: 'out-of-stock',
                status: 'available'
            })
                .populate('product', 'name sku category unit')
                .select('product batchNumber minStock reorderPoint storageLocation expiryDate')
                .sort({ 'product.name': 1 })
                .lean();

            // Add calculated fields
            alerts.outOfStock = alerts.outOfStock.map(item => ({
                ...item,
                productName: item.product?.name,
                productSKU: item.product?.sku,
                category: item.product?.category,
                unit: item.product?.unit,
                recommendedReorderQty: item.reorderPoint * 2
            }));
        }

        // Needs Reorder: quantity <= reorderPoint but not zero
        if (!type || type === 'needs-reorder') {
            alerts.needsReorder = await InventoryItem.find({
                $expr: { $lte: ['$quantity', '$reorderPoint'] },
                quantity: { $gt: 0 },
                status: 'available'
            })
                .populate('product', 'name sku category unit')
                .select('product batchNumber quantity minStock reorderPoint storageLocation expiryDate')
                .sort({ quantity: 1 })
                .lean();

            // Add calculated fields
            alerts.needsReorder = alerts.needsReorder.map(item => ({
                ...item,
                productName: item.product?.name,
                productSKU: item.product?.sku,
                category: item.product?.category,
                unit: item.product?.unit,
                recommendedReorderQty: Math.max(item.reorderPoint * 2 - item.quantity, item.minStock)
            }));
        }

        // Expiring Soon: expiryDate within next 30 days
        if (!type || type === 'expiring') {
            alerts.expiringItems = await InventoryItem.find({
                status: 'available',
                expiryDate: {
                    $gte: today,
                    $lte: thirtyDaysFromNow
                },
                quantity: { $gt: 0 }
            })
                .populate('product', 'name sku category unit')
                .select('product batchNumber quantity expiryDate storageLocation')
                .sort({ expiryDate: 1 })
                .lean();

            // Add calculated fields
            alerts.expiringItems = alerts.expiringItems.map(item => {
                const daysLeft = Math.ceil((new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24));
                return {
                    ...item,
                    productName: item.product?.name,
                    productSKU: item.product?.sku,
                    category: item.product?.category,
                    unit: item.product?.unit,
                    daysLeft
                };
            });
        }

        // Expired: expiryDate < today
        if (!type || type === 'expired') {
            alerts.expiredItems = await InventoryItem.find({
                status: 'expired',
                expiryDate: { $lt: today }
            })
                .populate('product', 'name sku category unit')
                .select('product batchNumber quantity expiryDate storageLocation')
                .sort({ expiryDate: 1 })
                .lean();

            // Add calculated fields
            alerts.expiredItems = alerts.expiredItems.map(item => {
                const daysExpired = Math.ceil((today - new Date(item.expiryDate)) / (1000 * 60 * 60 * 24));
                return {
                    ...item,
                    productName: item.product?.name,
                    productSKU: item.product?.sku,
                    category: item.product?.category,
                    unit: item.product?.unit,
                    daysExpired
                };
            });
        }

        // Calculate totals
        const summary = {
            lowStockCount: alerts.lowStock?.length || 0,
            outOfStockCount: alerts.outOfStock?.length || 0,
            needsReorderCount: alerts.needsReorder?.length || 0,
            expiringCount: alerts.expiringItems?.length || 0,
            expiredCount: alerts.expiredItems?.length || 0,
            totalAlerts: (alerts.lowStock?.length || 0) +
                (alerts.outOfStock?.length || 0) +
                (alerts.needsReorder?.length || 0) +
                (alerts.expiringItems?.length || 0) +
                (alerts.expiredItems?.length || 0)
        };

        res.status(200).json({
            success: true,
            data: alerts,
            summary
        });
    } catch (err) {
        console.error('Error fetching stock alerts:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock alerts',
            error: err.message
        });
    }
};;

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

// ==================== INVENTORY ITEM MANAGEMENT ====================

// Add inventory item (add stock to a product)
exports.addInventoryItem = async (req, res) => {
    try {
        const {
            product,
            batchNumber,
            manufactureDate,
            expiryDate,
            quantity,
            buyingPrice,
            sellingPrice,
            minStock,
            reorderPoint,
            storageLocation,
            supplierName,
            purchaseDate,
            receiptNumber,
            notes
        } = req.body;

        // Validate product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is active
        if (productExists.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Cannot add inventory for inactive product'
            });
        }

        // Get user ID (fallback to null if not authenticated - for testing)
        const userId = req.user ? req.user._id : null;

        // Add stock using the model's static method
        const inventoryItem = await InventoryItem.addStock({
            product,
            batchNumber,
            manufactureDate,
            expiryDate,
            quantity,
            buyingPrice,
            sellingPrice,
            minStock: minStock || 10,
            reorderPoint: reorderPoint || 20,
            storageLocation,
            supplierName,
            purchaseDate,
            receiptNumber,
            notes
        }, userId);

        // Check if this item needs reorder alert
        const needsAlert = inventoryItem.availability === 'low-stock' || inventoryItem.availability === 'out-of-stock';

        // Log activity only if user is authenticated
        if (userId) {
            await Activity.create({
                type: 'inventory_receipt',
                description: `Added ${quantity} ${productExists.unit} of ${productExists.name} (Batch: ${batchNumber})`,
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    role: req.user.role
                },
                entityType: 'Product',
                entityId: product,
                entityName: productExists.name,
                severity: needsAlert ? 'warning' : 'info',
                metadata: {
                    productId: product,
                    inventoryItemId: inventoryItem._id,
                    quantity,
                    batchNumber,
                    availability: inventoryItem.availability,
                    needsReorder: inventoryItem.needsReorder
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Inventory item added successfully',
            data: inventoryItem,
            alert: needsAlert ? {
                type: inventoryItem.availability,
                message: inventoryItem.availability === 'out-of-stock' 
                    ? `${productExists.name} is out of stock`
                    : `${productExists.name} is running low (${inventoryItem.quantity} remaining)`
            } : null
        });
    } catch (err) {
        console.error('Error in addInventoryItem:', err);
        
        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Inventory item with this batch number, expiry date, and manufacture date already exists for this product'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding inventory item',
            error: err.message
        });
    }
};

// Get all inventory items with filters
exports.getInventoryItems = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            product,
            status,
            expiryStatus,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};

        if (product) {
            query.product = product;
        }

        if (status) {
            query.status = status;
        }

        // Filter by expiry status
        if (expiryStatus) {
            const today = new Date();
            if (expiryStatus === 'expired') {
                query.expiryDate = { $lt: today };
            } else if (expiryStatus === 'expiring-soon') {
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                query.expiryDate = { $gte: today, $lte: thirtyDaysFromNow };
            }
        }

        // Search by batch number
        if (search) {
            query.batchNumber = { $regex: search, $options: 'i' };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with population
        const items = await InventoryItem.find(query)
            .populate('product', 'name sku category unit')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v');

        // Get total count
        const total = await InventoryItem.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        // Calculate total stock value
        const totalValue = items.reduce((sum, item) => {
            return sum + (item.quantity * item.sellingPrice);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                items,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages
                },
                summary: {
                    totalValue,
                    totalItems: items.length
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory items',
            error: err.message
        });
    }
};

// Get single inventory item
exports.getInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id)
            .populate('product', 'name sku category unit description')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .select('-__v');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching inventory item',
            error: err.message
        });
    }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
    try {
        const updates = req.body;
        
        // Don't allow updating certain critical fields
        delete updates.product;
        delete updates.batchNumber;
        delete updates.manufactureDate;
        delete updates.expiryDate;
        delete updates.quantity; // Use adjustStock instead
        delete updates.transactions;

        const item = await InventoryItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        // Update allowed fields
        Object.keys(updates).forEach(key => {
            item[key] = updates[key];
        });

        item.updatedBy = req.user._id;
        await item.save();

        res.status(200).json({
            success: true,
            message: 'Inventory item updated successfully',
            data: item
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating inventory item',
            error: err.message
        });
    }
};

// Adjust inventory stock (manual adjustment)
exports.adjustInventoryStock = async (req, res) => {
    try {
        const { adjustment, reason, notes } = req.body;

        if (!adjustment || adjustment === 0) {
            return res.status(400).json({
                success: false,
                message: 'Adjustment amount is required and must not be zero'
            });
        }

        const item = await InventoryItem.findById(req.params.id).populate('product', 'name sku unit');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        const newQuantity = item.quantity + adjustment;

        if (newQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot adjust stock. Resulting quantity would be negative. Current: ${item.quantity}, Adjustment: ${adjustment}`
            });
        }

        item.quantity = newQuantity;
        item.updatedBy = req.user._id;
        item.transactions.push({
            type: 'adjustment',
            quantity: adjustment,
            balanceAfter: newQuantity,
            performedBy: {
                id: req.user._id,
                name: req.user.name,
                role: req.user.role
            },
            notes: `${reason || 'Manual adjustment'}: ${notes || ''}`
        });

        await item.save();

        // Log activity
        await Activity.create({
            type: 'inventory_adjustment',
            description: `Adjusted stock for ${item.product.name} (Batch: ${item.batchNumber}): ${adjustment > 0 ? '+' : ''}${adjustment} ${item.product.unit}`,
            user: {
                id: req.user._id,
                name: req.user.name,
                role: req.user.role
            },
            entityType: 'Product',
            entityId: item.product._id,
            entityName: item.product.name,
            severity: 'warning',
            metadata: {
                productId: item.product._id,
                inventoryItemId: item._id,
                adjustment,
                newQuantity,
                reason
            }
        });

        res.status(200).json({
            success: true,
            message: 'Stock adjusted successfully',
            data: item
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error adjusting stock',
            error: err.message
        });
    }
};

// Get inventory summary for a product (all batches)
exports.getProductInventorySummary = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get all inventory items for this product
        const items = await InventoryItem.find({ 
            product: productId,
            status: { $in: ['available', 'reserved'] }
        }).sort({ expiryDate: 1 });

        // Calculate totals
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);
        const avgBuyingPrice = items.length > 0 
            ? items.reduce((sum, item) => sum + item.buyingPrice, 0) / items.length 
            : 0;
        const avgSellingPrice = items.length > 0
            ? items.reduce((sum, item) => sum + item.sellingPrice, 0) / items.length
            : 0;

        // Group by expiry status
        const today = new Date();
        const expiredItems = items.filter(item => new Date(item.expiryDate) < today);
        const expiringSoonItems = items.filter(item => {
            const daysLeft = item.daysUntilExpiry;
            return daysLeft >= 0 && daysLeft <= 30;
        });

        res.status(200).json({
            success: true,
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    sku: product.sku,
                    category: product.category,
                    unit: product.unit,
                    minStock: product.minStock
                },
                summary: {
                    totalQuantity,
                    totalValue,
                    avgBuyingPrice: Math.round(avgBuyingPrice * 100) / 100,
                    avgSellingPrice: Math.round(avgSellingPrice * 100) / 100,
                    totalBatches: items.length,
                    expiredBatches: expiredItems.length,
                    expiringSoonBatches: expiringSoonItems.length,
                    stockStatus: totalQuantity === 0 ? 'out-of-stock' : 
                                totalQuantity <= product.minStock ? 'low-stock' : 'in-stock'
                },
                batches: items
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product inventory summary',
            error: err.message
        });
    }
};
