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
