/**
 * Migration Script: Convert Products to New Inventory System
 * 
 * This script migrates existing products to the new separated structure:
 * - Products become master data only (no stock)
 * - Stock data moves to InventoryItems (with batch tracking)
 * 
 * Usage: node migrate-products.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');
const InventoryItem = require('./Model/InventoryItemModel');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/osethra', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

// Backup current products before migration
const backupProducts = async () => {
    try {
        const products = await Product.find({});
        const backupData = {
            timestamp: new Date(),
            productsCount: products.length,
            products: products
        };
        
        const fs = require('fs');
        const backupPath = `./backup-products-${Date.now()}.json`;
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        console.log(`✅ Backup created: ${backupPath}`);
        return backupPath;
    } catch (err) {
        console.error('❌ Backup failed:', err.message);
        throw err;
    }
};

// Migrate products to new structure
const migrateProducts = async () => {
    try {
        console.log('\n📦 Starting product migration...\n');

        // Get all existing products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to migrate`);

        let migratedCount = 0;
        let inventoryCreatedCount = 0;
        let errors = [];

        for (const product of products) {
            try {
                console.log(`\nProcessing: ${product.name} (${product.sku})`);

                // Check if product has stock-related fields to migrate
                const hasStockData = product.currentStock !== undefined || 
                                   product.buyingPrice !== undefined ||
                                   product.sellingPrice !== undefined;

                if (hasStockData && product.currentStock > 0) {
                    console.log(`  - Has stock: ${product.currentStock} ${product.unit}`);

                    // Create inventory item from existing stock
                    const inventoryData = {
                        product: product._id,
                        batchNumber: product.batchNumber || `MIGRATED-${product.sku}-${Date.now()}`,
                        manufactureDate: product.manufactureDate || new Date(),
                        expiryDate: product.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now if not set
                        quantity: product.currentStock || 0,
                        buyingPrice: product.buyingPrice || product.defaultBuyingPrice || 0,
                        sellingPrice: product.sellingPrice || product.defaultSellingPrice || 0,
                        storageLocation: product.storageLocation || product.defaultStorageLocation || 'Not specified',
                        supplierName: product.supplier || 'Unknown',
                        purchaseDate: product.createdAt || new Date(),
                        status: 'available',
                        notes: 'Migrated from old system',
                        createdBy: product.createdBy,
                        transactions: [{
                            type: 'receipt',
                            quantity: product.currentStock || 0,
                            balanceAfter: product.currentStock || 0,
                            reference: 'MIGRATION',
                            date: new Date(),
                            notes: 'Initial stock from migration'
                        }]
                    };

                    // Check if expiry date is valid
                    if (new Date(inventoryData.expiryDate) < new Date()) {
                        inventoryData.status = 'expired';
                        console.log(`  ⚠️  Batch is expired`);
                    }

                    // Create inventory item
                    const inventoryItem = await InventoryItem.create(inventoryData);
                    console.log(`  ✅ Created inventory item: ${inventoryItem.batchNumber}`);
                    inventoryCreatedCount++;
                }

                // Update product to new schema (remove old fields)
                const updateData = {
                    // Preserve existing master data
                    name: product.name,
                    sku: product.sku,
                    category: product.category,
                    description: product.description,
                    manufacturer: product.manufacturer,
                    supplier: product.supplier,
                    minStock: product.minStock,
                    maxStock: product.maxStock,
                    reorderPoint: product.reorderPoint,
                    unit: product.unit,
                    barcode: product.barcode,
                    prescription: product.prescription,
                    status: product.status,
                    notes: product.notes,
                    
                    // Set default pricing from old values
                    defaultBuyingPrice: product.buyingPrice || product.defaultBuyingPrice,
                    defaultSellingPrice: product.sellingPrice || product.defaultSellingPrice,
                    defaultStorageLocation: product.storageLocation || product.defaultStorageLocation,
                    
                    // Clear old fields (these will be removed by schema)
                    $unset: {
                        currentStock: '',
                        batchNumber: '',
                        manufactureDate: '',
                        expiryDate: '',
                        buyingPrice: '',
                        sellingPrice: '',
                        storageLocation: '',
                        profitMargin: '',
                        orderHistory: ''
                    }
                };

                await Product.findByIdAndUpdate(product._id, updateData);
                console.log(`  ✅ Updated product master data`);
                migratedCount++;

            } catch (err) {
                console.error(`  ❌ Error migrating ${product.name}:`, err.message);
                errors.push({
                    product: product.name,
                    sku: product.sku,
                    error: err.message
                });
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total products processed: ${products.length}`);
        console.log(`Products migrated: ${migratedCount}`);
        console.log(`Inventory items created: ${inventoryCreatedCount}`);
        console.log(`Errors: ${errors.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            errors.forEach(err => {
                console.log(`  - ${err.sku}: ${err.error}`);
            });
        }
        
        console.log('\n✅ Migration completed!\n');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        throw err;
    }
};

// Main execution
const runMigration = async () => {
    try {
        console.log('🚀 Product Migration Script');
        console.log('='.repeat(60));
        
        // Connect to database
        await connectDB();
        
        // Ask for confirmation
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('\n⚠️  This will migrate all products. Continue? (yes/no): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                try {
                    // Create backup
                    const backupPath = await backupProducts();
                    console.log(`\n💾 Backup saved to: ${backupPath}`);
                    
                    // Run migration
                    await migrateProducts();
                    
                    console.log('✅ All done! You can now use the new inventory system.');
                    console.log('📝 Backup file saved in case you need to rollback.\n');
                } catch (err) {
                    console.error('\n❌ Migration failed:', err);
                } finally {
                    readline.close();
                    mongoose.connection.close();
                }
            } else {
                console.log('❌ Migration cancelled');
                readline.close();
                mongoose.connection.close();
            }
        });

    } catch (err) {
        console.error('❌ Script failed:', err.message);
        process.exit(1);
    }
};

// Run the migration
runMigration();
