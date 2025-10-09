/**
 * Validation Middleware for Inventory Management
 * Validates product, issue, and prescription data before processing
 */

/**
 * Validate product data (for create and update operations)
 */
exports.validateProduct = (req, res, next) => {
    console.log('=== VALIDATION MIDDLEWARE ===');
    console.log('Request method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
        name,
        sku,
        category,
        buyingPrice,
        sellingPrice,
        currentStock,
        initialStock,
        minStock,
        maxStock,
        unit,
        manufactureDate,
        expiryDate
    } = req.body;

    const errors = [];    // Required fields validation
    if (!name || name.trim().length === 0) {
        errors.push('Product name is required');
    } else if (name.length < 3) {
        errors.push('Product name must be at least 3 characters long');
    } else if (name.length > 200) {
        errors.push('Product name must not exceed 200 characters');
    }

    if (!sku || sku.trim().length === 0) {
        errors.push('SKU is required');
    } else if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
        errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
    }

    if (!category || category.trim().length === 0) {
        errors.push('Category is required');
    }

    if (!unit || unit.trim().length === 0) {
        errors.push('Unit is required');
    }

    // Price validations
    if (buyingPrice === undefined || buyingPrice === null || buyingPrice === '') {
        errors.push('Buying price is required');
    } else {
        const buyingPriceNum = Number(buyingPrice);
        if (isNaN(buyingPriceNum)) {
            errors.push('Buying price must be a valid number');
        } else if (buyingPriceNum <= 0) {
            errors.push('Buying price must be greater than 0');
        }
    }

    if (sellingPrice === undefined || sellingPrice === null || sellingPrice === '') {
        errors.push('Selling price is required');
    } else {
        const sellingPriceNum = Number(sellingPrice);
        const buyingPriceNum = Number(buyingPrice);

        if (isNaN(sellingPriceNum)) {
            errors.push('Selling price must be a valid number');
        } else if (sellingPriceNum <= 0) {
            errors.push('Selling price must be greater than 0');
        } else if (!isNaN(buyingPriceNum) && sellingPriceNum < buyingPriceNum) {
            errors.push('Selling price must be greater than or equal to buying price');
        }
    }

    // Stock validations
    // Support both currentStock and initialStock for POST requests
    const stockField = req.method === 'POST'
        ? (currentStock !== undefined ? currentStock : initialStock)
        : currentStock;
    const stockFieldName = req.method === 'POST' ? 'Initial stock' : 'Current stock';

    if (stockField === undefined || stockField === null || stockField === '') {
        errors.push(`${stockFieldName} is required`);
    } else {
        const stockNum = Number(stockField);
        if (isNaN(stockNum)) {
            errors.push(`${stockFieldName} must be a valid number`);
        } else if (stockNum < 0) {
            errors.push(`${stockFieldName} cannot be negative`);
        } else if (!Number.isInteger(stockNum)) {
            errors.push(`${stockFieldName} must be a whole number`);
        }
    }

    if (minStock === undefined || minStock === null || minStock === '') {
        errors.push('Minimum stock is required');
    } else {
        const minStockNum = Number(minStock);
        if (isNaN(minStockNum)) {
            errors.push('Minimum stock must be a valid number');
        } else if (minStockNum < 0) {
            errors.push('Minimum stock cannot be negative');
        } else if (!Number.isInteger(minStockNum)) {
            errors.push('Minimum stock must be a whole number');
        }
    }

    if (maxStock !== undefined && maxStock !== null && maxStock !== '') {
        const maxStockNum = Number(maxStock);
        const minStockNum = Number(minStock);

        if (isNaN(maxStockNum)) {
            errors.push('Maximum stock must be a valid number');
        } else if (maxStockNum < 0) {
            errors.push('Maximum stock cannot be negative');
        } else if (!Number.isInteger(maxStockNum)) {
            errors.push('Maximum stock must be a whole number');
        } else if (!isNaN(minStockNum) && maxStockNum < minStockNum) {
            errors.push('Maximum stock must be greater than or equal to minimum stock');
        }
    }

    // Date validations
    if (manufactureDate && expiryDate) {
        const mfgDate = new Date(manufactureDate);
        const expDate = new Date(expiryDate);

        if (isNaN(mfgDate.getTime())) {
            errors.push('Invalid manufacture date');
        }

        if (isNaN(expDate.getTime())) {
            errors.push('Invalid expiry date');
        }

        if (!isNaN(mfgDate.getTime()) && !isNaN(expDate.getTime()) && expDate <= mfgDate) {
            errors.push('Expiry date must be after manufacture date');
        }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        console.log('Validation errors:', errors);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    console.log('Validation passed!');
    next();
};

/**
 * Validate issue data
 */
exports.validateIssue = (req, res, next) => {
    const { type, patient, department, items, totalAmount } = req.body;

    const errors = [];

    // Type validation
    const validTypes = ['outpatient', 'inpatient', 'department', 'emergency', 'general'];

    if (!type) {
        errors.push('Issue type is required');
    } else if (!validTypes.includes(type)) {
        errors.push(`Issue type must be one of: ${validTypes.join(', ')}`);
    }

    // Patient validation (required for outpatient, inpatient, emergency - optional for general)
    if (['outpatient', 'inpatient', 'emergency'].includes(type)) {
        if (!patient) {
            errors.push(`Patient information is required for ${type} issues`);
        } else {
            if (!patient.id || patient.id.trim().length === 0) {
                errors.push('Patient ID is required');
            }
            if (!patient.name || patient.name.trim().length === 0) {
                errors.push('Patient name is required');
            }

            // Additional validation for inpatient
            if (type === 'inpatient') {
                if (!patient.bedNumber || patient.bedNumber.trim().length === 0) {
                    errors.push('Bed number is required for inpatient issues');
                }
                if (!patient.wardId || patient.wardId.trim().length === 0) {
                    errors.push('Ward ID is required for inpatient issues');
                }
            }
        }
    }

    // For general type, patient info is optional - no validation needed

    // Department validation (required for department type)
    if (type === 'department') {
        if (!department) {
            errors.push('Department information is required for department issues');
        } else {
            if (!department.id || department.id.trim().length === 0) {
                errors.push('Department ID is required');
            }
            if (!department.name || department.name.trim().length === 0) {
                errors.push('Department name is required');
            }
        }
    }

    // Items validation
    if (!items || !Array.isArray(items)) {
        errors.push('Items must be provided as an array');
    } else if (items.length === 0) {
        errors.push('At least one item is required');
    } else {
        items.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`Item ${index + 1}: Product ID is required`);
            }
            // productName is optional - it will be fetched from the database

            if (item.quantity === undefined || item.quantity === null) {
                errors.push(`Item ${index + 1}: Quantity is required`);
            } else {
                const qty = Number(item.quantity);
                if (isNaN(qty)) {
                    errors.push(`Item ${index + 1}: Quantity must be a valid number`);
                } else if (qty <= 0) {
                    errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
                } else if (!Number.isInteger(qty)) {
                    errors.push(`Item ${index + 1}: Quantity must be a whole number`);
                }
            }
            // unitPrice is optional - selling price will be used if not provided
            if (item.unitPrice !== undefined && item.unitPrice !== null) {
                const price = Number(item.unitPrice);
                if (isNaN(price)) {
                    errors.push(`Item ${index + 1}: Unit price must be a valid number`);
                } else if (price < 0) {
                    errors.push(`Item ${index + 1}: Unit price cannot be negative`);
                }
            }
            // totalPrice is optional - it will be calculated on the backend
        });
    }

    // Total amount is optional - it will be calculated on the backend

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate prescription data
 */
exports.validatePrescription = (req, res, next) => {
    const { patient, doctor, medications, date } = req.body;

    const errors = [];

    // Patient validation
    if (!patient) {
        errors.push('Patient information is required');
    } else {
        if (!patient.id || patient.id.trim().length === 0) {
            errors.push('Patient ID is required');
        }
        if (!patient.name || patient.name.trim().length === 0) {
            errors.push('Patient name is required');
        }
    }

    // Doctor validation
    if (!doctor) {
        errors.push('Doctor information is required');
    } else {
        if (!doctor.id || doctor.id.trim().length === 0) {
            errors.push('Doctor ID is required');
        }
        if (!doctor.name || doctor.name.trim().length === 0) {
            errors.push('Doctor name is required');
        }
    }

    // Medications validation
    if (!medications || !Array.isArray(medications)) {
        errors.push('Medications must be provided as an array');
    } else if (medications.length === 0) {
        errors.push('At least one medication is required');
    } else {
        medications.forEach((med, index) => {
            if (!med.name || med.name.trim().length === 0) {
                errors.push(`Medication ${index + 1}: Name is required`);
            }
            if (!med.dosage || med.dosage.trim().length === 0) {
                errors.push(`Medication ${index + 1}: Dosage is required`);
            }
            if (med.quantity === undefined || med.quantity === null) {
                errors.push(`Medication ${index + 1}: Quantity is required`);
            } else {
                const qty = Number(med.quantity);
                if (isNaN(qty)) {
                    errors.push(`Medication ${index + 1}: Quantity must be a valid number`);
                } else if (qty <= 0) {
                    errors.push(`Medication ${index + 1}: Quantity must be greater than 0`);
                }
            }
            if (!med.duration || med.duration.trim().length === 0) {
                errors.push(`Medication ${index + 1}: Duration is required`);
            }
        });
    }

    // Date validation
    if (!date) {
        errors.push('Prescription date is required');
    } else {
        const prescriptionDate = new Date(date);
        if (isNaN(prescriptionDate.getTime())) {
            errors.push('Invalid prescription date');
        }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate category data
 */
exports.validateCategory = (req, res, next) => {
    const { name } = req.body;

    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Category name is required');
    } else if (name.length < 2) {
        errors.push('Category name must be at least 2 characters long');
    } else if (name.length > 50) {
        errors.push('Category name must not exceed 50 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate dispense prescription data
 */
exports.validateDispensePrescription = (req, res, next) => {
    const { medications } = req.body;

    const errors = [];

    if (!medications || !Array.isArray(medications)) {
        errors.push('Medications must be provided as an array');
    } else if (medications.length === 0) {
        errors.push('At least one medication must be dispensed');
    } else {
        medications.forEach((med, index) => {
            if (!med.medicationId) {
                errors.push(`Medication ${index + 1}: Medication ID is required`);
            }
            if (med.quantityDispensed === undefined || med.quantityDispensed === null) {
                errors.push(`Medication ${index + 1}: Quantity dispensed is required`);
            } else {
                const qty = Number(med.quantityDispensed);
                if (isNaN(qty)) {
                    errors.push(`Medication ${index + 1}: Quantity dispensed must be a valid number`);
                } else if (qty <= 0) {
                    errors.push(`Medication ${index + 1}: Quantity dispensed must be greater than 0`);
                } else if (!Number.isInteger(qty)) {
                    errors.push(`Medication ${index + 1}: Quantity dispensed must be a whole number`);
                }
            }
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate update issue status data
 */
exports.validateIssueStatus = (req, res, next) => {
    const { status } = req.body;

    const errors = [];

    const validStatuses = ['pending', 'issued', 'partial', 'returned', 'cancelled'];

    if (!status) {
        errors.push('Status is required');
    } else if (!validStatuses.includes(status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};
