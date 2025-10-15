const Product = require('../Model/ProductModel');
const InventoryItem = require('../Model/InventoryItemModel');
const Issue = require('../Model/IssueModel');
const Activity = require('../Model/ActivityModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ==================== STOCK STATUS REPORT ====================

/**
 * Generate Stock Status Report
 * Shows current stock levels, min/max stock, and alerts
 */
exports.getStockStatusReport = async (req, res) => {
    try {
        const { category, status, stockStatus, format = 'json' } = req.query;

        // Build query for products
        let productQuery = {};
        if (category && category !== 'all') {
            productQuery.category = category;
        }
        if (status && status !== 'all') {
            productQuery.status = status;
        }

        // Get all products
        const products = await Product.find(productQuery).sort({ name: 1 });

        // Get inventory items for each product
        const reportData = await Promise.all(products.map(async (product) => {
            const inventoryItems = await InventoryItem.find({
                product: product._id,
                status: 'available'
            });

            // Calculate total stock from all batches
            const totalStock = inventoryItems.reduce((sum, item) => {
                // Only count non-expired items
                if (!item.expiryDate || new Date(item.expiryDate) > new Date()) {
                    return sum + item.quantity;
                }
                return sum;
            }, 0);

            // Calculate total value
            const totalValue = inventoryItems.reduce((sum, item) => {
                if (!item.expiryDate || new Date(item.expiryDate) > new Date()) {
                    return sum + (item.quantity * item.buyingPrice);
                }
                return sum;
            }, 0);

            // Determine stock status
            let stockStatusLabel = 'In Stock';
            if (totalStock === 0) {
                stockStatusLabel = 'Out of Stock';
            } else if (totalStock < 10) { // Using 10 as default min stock
                stockStatusLabel = 'Low Stock';
            }

            return {
                productId: product._id,
                name: product.name,
                sku: product.sku,
                category: product.category,
                unit: product.unit,
                totalStock,
                batches: inventoryItems.length,
                totalValue: totalValue.toFixed(2),
                stockStatus: stockStatusLabel,
                status: product.status
            };
        }));

        // Filter by stock status if specified
        let filteredData = reportData;
        if (stockStatus) {
            if (stockStatus === 'low') {
                filteredData = reportData.filter(item => item.stockStatus === 'Low Stock');
            } else if (stockStatus === 'out') {
                filteredData = reportData.filter(item => item.stockStatus === 'Out of Stock');
            } else if (stockStatus === 'in') {
                filteredData = reportData.filter(item => item.stockStatus === 'In Stock' && item.totalStock > 0);
            }
        }

        // Calculate summary statistics
        const summary = {
            totalProducts: filteredData.length,
            inStock: filteredData.filter(p => p.stockStatus === 'In Stock').length,
            lowStock: filteredData.filter(p => p.stockStatus === 'Low Stock').length,
            outOfStock: filteredData.filter(p => p.stockStatus === 'Out of Stock').length,
            totalValue: filteredData.reduce((sum, p) => sum + parseFloat(p.totalValue), 0).toFixed(2)
        };

        // Return based on format
        if (format === 'json') {
            return res.status(200).json({
                success: true,
                data: {
                    summary,
                    products: filteredData,
                    generatedAt: new Date()
                }
            });
        } else if (format === 'pdf') {
            return generateStockStatusPDF(res, filteredData, summary);
        } else if (format === 'excel') {
            return generateStockStatusExcel(res, filteredData, summary);
        }

        res.status(400).json({ success: false, message: 'Invalid format specified' });
    } catch (error) {
        console.error('Error generating stock status report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating stock status report',
            error: error.message
        });
    }
};

// ==================== BATCH/EXPIRY REPORT ====================

/**
 * Generate Batch/Expiry Report
 * Shows all batches with expiry dates and status
 */
exports.getBatchExpiryReport = async (req, res) => {
    try {
        const { category, days = 90, expiryStatus, format = 'json' } = req.query;

        // Build query
        let productQuery = {};
        if (category && category !== 'all') {
            productQuery.category = category;
        }

        const products = await Product.find(productQuery);
        const productIds = products.map(p => p._id);

        // Get all inventory items
        const inventoryItems = await InventoryItem.find({
            product: { $in: productIds },
            status: 'available'
        }).populate('product', 'name sku category unit');

        // Process inventory items with expiry information
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days));

        const reportData = inventoryItems.map(item => {
            const expiryDate = new Date(item.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            let expiryStatusLabel = 'Fresh';
            let alertLevel = 'success';
            
            if (daysUntilExpiry < 0) {
                expiryStatusLabel = 'Expired';
                alertLevel = 'error';
            } else if (daysUntilExpiry <= 30) {
                expiryStatusLabel = 'Critical';
                alertLevel = 'error';
            } else if (daysUntilExpiry <= 90) {
                expiryStatusLabel = 'Warning';
                alertLevel = 'warning';
            }

            return {
                productName: item.product?.name || 'Unknown',
                sku: item.product?.sku || 'N/A',
                category: item.product?.category || 'N/A',
                batchNumber: item.batchNumber,
                supplier: item.supplier || 'N/A',
                manufactureDate: item.manufactureDate,
                expiryDate: item.expiryDate,
                daysUntilExpiry,
                quantity: item.quantity,
                unit: item.product?.unit || 'units',
                buyingPrice: item.buyingPrice,
                totalValue: (item.quantity * item.buyingPrice).toFixed(2),
                expiryStatus: expiryStatusLabel,
                alertLevel,
                storageLocation: item.storageLocation || 'N/A'
            };
        });

        // Filter by expiry status if specified
        let filteredData = reportData;
        if (expiryStatus) {
            if (expiryStatus === 'expired') {
                filteredData = reportData.filter(item => item.expiryStatus === 'Expired');
            } else if (expiryStatus === 'critical') {
                filteredData = reportData.filter(item => item.expiryStatus === 'Critical');
            } else if (expiryStatus === 'warning') {
                filteredData = reportData.filter(item => item.expiryStatus === 'Warning');
            } else if (expiryStatus === 'fresh') {
                filteredData = reportData.filter(item => item.expiryStatus === 'Fresh');
            }
        } else {
            // By default, show items expiring within specified days
            filteredData = reportData.filter(item => item.daysUntilExpiry <= parseInt(days));
        }

        // Sort by days until expiry (ascending)
        filteredData.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

        // Calculate summary
        const summary = {
            totalBatches: filteredData.length,
            expired: filteredData.filter(i => i.expiryStatus === 'Expired').length,
            critical: filteredData.filter(i => i.expiryStatus === 'Critical').length,
            warning: filteredData.filter(i => i.expiryStatus === 'Warning').length,
            fresh: filteredData.filter(i => i.expiryStatus === 'Fresh').length,
            totalValueAtRisk: filteredData
                .filter(i => i.expiryStatus === 'Expired' || i.expiryStatus === 'Critical')
                .reduce((sum, i) => sum + parseFloat(i.totalValue), 0)
                .toFixed(2)
        };

        if (format === 'json') {
            return res.status(200).json({
                success: true,
                data: {
                    summary,
                    batches: filteredData,
                    generatedAt: new Date()
                }
            });
        } else if (format === 'pdf') {
            return generateBatchExpiryPDF(res, filteredData, summary);
        } else if (format === 'excel') {
            return generateBatchExpiryExcel(res, filteredData, summary);
        }

        res.status(400).json({ success: false, message: 'Invalid format specified' });
    } catch (error) {
        console.error('Error generating batch/expiry report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating batch/expiry report',
            error: error.message
        });
    }
};

// ==================== ISSUES/DISPENSING REPORT ====================

/**
 * Generate Issues/Dispensing Report
 * Shows all medication dispensing transactions
 */
exports.getIssuesReport = async (req, res) => {
    try {
        const { startDate, endDate, type, status, format = 'json' } = req.query;

        // Build query
        let query = {};
        
        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Type filter
        if (type && type !== 'all') {
            query.type = type;
        }

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get issues with populated product details
        const issues = await Issue.find(query)
            .populate('items.product', 'name sku category unit')
            .sort({ createdAt: -1 });

        // Process issues data
        const reportData = issues.map(issue => {
            const totalAmount = issue.totalAmount || issue.items.reduce((sum, item) => 
                sum + (item.quantity * (item.unitPrice || 0)), 0
            );

            return {
                issueNumber: issue.issueNumber,
                date: issue.createdAt,
                type: issue.type,
                status: issue.status,
                patientName: issue.patient?.name || 'N/A',
                patientId: issue.patient?.id || 'N/A',
                departmentName: issue.department?.name || 'N/A',
                items: issue.items.map(item => ({
                    productName: item.product?.name || item.productName,
                    sku: item.product?.sku || 'N/A',
                    quantity: item.quantity,
                    unit: item.product?.unit || 'units',
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                })),
                totalItems: issue.items.length,
                totalQuantity: issue.items.reduce((sum, item) => sum + item.quantity, 0),
                totalAmount: totalAmount.toFixed(2),
                issuedBy: issue.issuedBy?.name || 'Unknown',
                notes: issue.notes || ''
            };
        });

        // Calculate summary
        const summary = {
            totalIssues: reportData.length,
            totalAmount: reportData.reduce((sum, issue) => sum + parseFloat(issue.totalAmount), 0).toFixed(2),
            totalItems: reportData.reduce((sum, issue) => sum + issue.totalItems, 0),
            totalQuantity: reportData.reduce((sum, issue) => sum + issue.totalQuantity, 0),
            byType: {
                outpatient: reportData.filter(i => i.type === 'outpatient').length,
                inpatient: reportData.filter(i => i.type === 'inpatient').length,
                emergency: reportData.filter(i => i.type === 'emergency').length,
                department: reportData.filter(i => i.type === 'department').length,
                general: reportData.filter(i => i.type === 'general').length
            },
            byStatus: {
                issued: reportData.filter(i => i.status === 'issued').length,
                pending: reportData.filter(i => i.status === 'pending').length,
                partial: reportData.filter(i => i.status === 'partial').length,
                cancelled: reportData.filter(i => i.status === 'cancelled').length
            }
        };

        if (format === 'json') {
            return res.status(200).json({
                success: true,
                data: {
                    summary,
                    issues: reportData,
                    generatedAt: new Date()
                }
            });
        } else if (format === 'pdf') {
            return generateIssuesReportPDF(res, reportData, summary, { startDate, endDate });
        } else if (format === 'excel') {
            return generateIssuesReportExcel(res, reportData, summary);
        }

        res.status(400).json({ success: false, message: 'Invalid format specified' });
    } catch (error) {
        console.error('Error generating issues report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating issues report',
            error: error.message
        });
    }
};

// ==================== SALES/REVENUE REPORT ====================

/**
 * Generate Sales/Revenue Report
 * Shows financial performance and revenue analysis
 */
exports.getSalesRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, category, groupBy = 'daily', format = 'json' } = req.query;

        // Build date query
        let dateQuery = {};
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        dateQuery = {
            createdAt: {
                $gte: start,
                $lte: end
            }
        };

        // Get all issues in date range
        const issues = await Issue.find({
            ...dateQuery,
            status: { $in: ['issued', 'partial'] } // Only completed transactions
        }).populate('items.product', 'name sku category unit');

        // Process sales data
        let salesData = [];
        let categorySales = {};
        let productSales = {};
        let dailySales = {};

        issues.forEach(issue => {
            const issueDate = new Date(issue.createdAt).toISOString().split('T')[0];
            
            issue.items.forEach(item => {
                const product = item.product;
                const categoryName = product?.category || 'Uncategorized';
                const productName = product?.name || item.productName;
                const revenue = item.totalPrice || (item.quantity * (item.unitPrice || 0));
                
                // Estimate cost (we'll use buying price from inventory items - simplified)
                const estimatedCost = revenue * 0.6; // Assuming 40% margin as default
                const profit = revenue - estimatedCost;

                // Category aggregation
                if (!categorySales[categoryName]) {
                    categorySales[categoryName] = {
                        category: categoryName,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                        quantity: 0,
                        transactions: 0
                    };
                }
                categorySales[categoryName].revenue += revenue;
                categorySales[categoryName].cost += estimatedCost;
                categorySales[categoryName].profit += profit;
                categorySales[categoryName].quantity += item.quantity;
                categorySales[categoryName].transactions += 1;

                // Product aggregation
                if (!productSales[productName]) {
                    productSales[productName] = {
                        product: productName,
                        sku: product?.sku || 'N/A',
                        category: categoryName,
                        revenue: 0,
                        quantity: 0,
                        transactions: 0
                    };
                }
                productSales[productName].revenue += revenue;
                productSales[productName].quantity += item.quantity;
                productSales[productName].transactions += 1;

                // Daily aggregation
                if (!dailySales[issueDate]) {
                    dailySales[issueDate] = {
                        date: issueDate,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                        transactions: 0,
                        items: 0
                    };
                }
                dailySales[issueDate].revenue += revenue;
                dailySales[issueDate].cost += estimatedCost;
                dailySales[issueDate].profit += profit;
                dailySales[issueDate].items += item.quantity;
            });

            const issueDate = new Date(issue.createdAt).toISOString().split('T')[0];
            if (dailySales[issueDate]) {
                dailySales[issueDate].transactions += 1;
            }
        });

        // Convert to arrays and sort
        const categoryData = Object.values(categorySales)
            .map(cat => ({
                ...cat,
                profitMargin: cat.revenue > 0 ? ((cat.profit / cat.revenue) * 100).toFixed(2) : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);

        const productData = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 20); // Top 20 products

        const dailyData = Object.values(dailySales)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate overall summary
        const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
        const totalCost = dailyData.reduce((sum, day) => sum + day.cost, 0);
        const totalProfit = totalRevenue - totalCost;

        const summary = {
            totalRevenue: totalRevenue.toFixed(2),
            totalCost: totalCost.toFixed(2),
            totalProfit: totalProfit.toFixed(2),
            profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0,
            totalTransactions: issues.length,
            totalItems: dailyData.reduce((sum, day) => sum + day.items, 0),
            averageTransactionValue: issues.length > 0 ? (totalRevenue / issues.length).toFixed(2) : 0,
            dateRange: {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            }
        };

        if (format === 'json') {
            return res.status(200).json({
                success: true,
                data: {
                    summary,
                    dailySales: dailyData,
                    categorySales: categoryData,
                    topProducts: productData,
                    generatedAt: new Date()
                }
            });
        } else if (format === 'pdf') {
            return generateSalesRevenuePDF(res, { summary, dailySales: dailyData, categorySales: categoryData, topProducts: productData });
        } else if (format === 'excel') {
            return generateSalesRevenueExcel(res, { summary, dailySales: dailyData, categorySales: categoryData, topProducts: productData });
        }

        res.status(400).json({ success: false, message: 'Invalid format specified' });
    } catch (error) {
        console.error('Error generating sales/revenue report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating sales/revenue report',
            error: error.message
        });
    }
};

// ==================== PDF GENERATION FUNCTIONS ====================

function generateStockStatusPDF(res, data, summary) {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=stock-status-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Stock Status Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Products: ${summary.totalProducts}`);
    doc.text(`In Stock: ${summary.inStock}`);
    doc.text(`Low Stock: ${summary.lowStock}`);
    doc.text(`Out of Stock: ${summary.outOfStock}`);
    doc.text(`Total Inventory Value: Rs. ${summary.totalValue}`);
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).text('Product Details', { underline: true });
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 200;
    const col3 = 300;
    const col4 = 380;
    const col5 = 460;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Product Name', col1, tableTop);
    doc.text('SKU', col2, tableTop);
    doc.text('Stock', col3, tableTop);
    doc.text('Value', col4, tableTop);
    doc.text('Status', col5, tableTop);
    doc.moveDown();

    // Table Rows
    doc.font('Helvetica').fontSize(8);
    data.forEach((item, index) => {
        const y = doc.y;
        
        if (y > 700) {
            doc.addPage();
            doc.y = 50;
        }

        doc.text(item.name.substring(0, 30), col1, doc.y, { width: 140 });
        doc.text(item.sku, col2, y);
        doc.text(item.totalStock + ' ' + item.unit, col3, y);
        doc.text('Rs. ' + item.totalValue, col4, y);
        doc.text(item.stockStatus, col5, y);
        doc.moveDown(0.5);
    });

    doc.end();
}

function generateBatchExpiryPDF(res, data, summary) {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=batch-expiry-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Batch & Expiry Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Batches: ${summary.totalBatches}`);
    doc.text(`Expired: ${summary.expired}`);
    doc.text(`Critical (< 30 days): ${summary.critical}`);
    doc.text(`Warning (< 90 days): ${summary.warning}`);
    doc.text(`Value at Risk: Rs. ${summary.totalValueAtRisk}`);
    doc.moveDown(2);

    // Table
    doc.fontSize(12).text('Batch Details', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Product', 50, doc.y);
    doc.text('Batch', 180, doc.y);
    doc.text('Expiry', 260, doc.y);
    doc.text('Days', 340, doc.y);
    doc.text('Qty', 400, doc.y);
    doc.text('Value', 460, doc.y);
    doc.text('Status', 540, doc.y);
    doc.moveDown();

    doc.font('Helvetica').fontSize(7);
    data.forEach((item) => {
        if (doc.y > 500) {
            doc.addPage();
            doc.y = 50;
        }

        const y = doc.y;
        doc.text(item.productName.substring(0, 25), 50, y);
        doc.text(item.batchNumber, 180, y);
        doc.text(new Date(item.expiryDate).toLocaleDateString(), 260, y);
        doc.text(item.daysUntilExpiry.toString(), 340, y);
        doc.text(item.quantity + ' ' + item.unit, 400, y);
        doc.text('Rs. ' + item.totalValue, 460, y);
        doc.text(item.expiryStatus, 540, y);
        doc.moveDown(0.5);
    });

    doc.end();
}

function generateIssuesReportPDF(res, data, summary, filters) {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=issues-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Issues/Dispensing Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    if (filters.startDate || filters.endDate) {
        doc.text(`Period: ${filters.startDate || 'All'} to ${filters.endDate || 'Today'}`, { align: 'center' });
    }
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Issues: ${summary.totalIssues}`);
    doc.text(`Total Amount: Rs. ${summary.totalAmount}`);
    doc.text(`Total Items: ${summary.totalItems}`);
    doc.text(`Total Quantity: ${summary.totalQuantity}`);
    doc.moveDown();
    doc.text('By Type:');
    doc.fontSize(9);
    doc.text(`  Outpatient: ${summary.byType.outpatient}`);
    doc.text(`  Inpatient: ${summary.byType.inpatient}`);
    doc.text(`  Emergency: ${summary.byType.emergency}`);
    doc.text(`  Department: ${summary.byType.department}`);
    doc.moveDown(2);

    // Issues List
    doc.fontSize(12).text('Issue Details', { underline: true });
    doc.moveDown(0.5);

    data.forEach((issue, index) => {
        if (doc.y > 650) {
            doc.addPage();
            doc.y = 50;
        }

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`${issue.issueNumber} - ${new Date(issue.date).toLocaleDateString()} - ${issue.type.toUpperCase()}`);
        doc.font('Helvetica').fontSize(9);
        doc.text(`Patient: ${issue.patientName} | Items: ${issue.totalItems} | Amount: Rs. ${issue.totalAmount}`);
        doc.moveDown(0.5);
    });

    doc.end();
}

function generateSalesRevenuePDF(res, reportData) {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales-revenue-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    const { summary, dailySales, categorySales, topProducts } = reportData;

    // Header
    doc.fontSize(20).text('Sales & Revenue Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Period: ${summary.dateRange.start} to ${summary.dateRange.end}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Financial Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Revenue: Rs. ${summary.totalRevenue}`);
    doc.text(`Total Cost: Rs. ${summary.totalCost}`);
    doc.text(`Total Profit: Rs. ${summary.totalProfit}`);
    doc.text(`Profit Margin: ${summary.profitMargin}%`);
    doc.text(`Total Transactions: ${summary.totalTransactions}`);
    doc.text(`Average Transaction Value: Rs. ${summary.averageTransactionValue}`);
    doc.moveDown(2);

    // Category Sales
    doc.fontSize(12).text('Sales by Category', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Category', 50, doc.y);
    doc.text('Revenue', 250, doc.y);
    doc.text('Profit', 350, doc.y);
    doc.text('Margin', 450, doc.y);
    doc.moveDown();

    doc.font('Helvetica').fontSize(8);
    categorySales.forEach(cat => {
        if (doc.y > 700) {
            doc.addPage();
            doc.y = 50;
        }
        const y = doc.y;
        doc.text(cat.category, 50, y);
        doc.text(`Rs. ${cat.revenue.toFixed(2)}`, 250, y);
        doc.text(`Rs. ${cat.profit.toFixed(2)}`, 350, y);
        doc.text(`${cat.profitMargin}%`, 450, y);
        doc.moveDown(0.5);
    });

    doc.end();
}

// Excel generation functions (simplified - actual implementation would use ExcelJS)
function generateStockStatusExcel(res, data, summary) {
    // Placeholder - would implement using ExcelJS
    res.status(501).json({ success: false, message: 'Excel export coming soon' });
}

function generateBatchExpiryExcel(res, data, summary) {
    res.status(501).json({ success: false, message: 'Excel export coming soon' });
}

function generateIssuesReportExcel(res, data, summary) {
    res.status(501).json({ success: false, message: 'Excel export coming soon' });
}

function generateSalesRevenueExcel(res, reportData) {
    res.status(501).json({ success: false, message: 'Excel export coming soon' });
}
