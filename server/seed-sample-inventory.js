const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');
const InventoryItem = require('./Model/InventoryItemModel');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/osethra';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('📦 Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

const sampleInventoryItems = [
    // Paracetamol - Multiple batches with different expiry dates
    {
        productSKU: 'PARA-500-TAB',
        batchNumber: 'PARA-BATCH-001',
        manufactureDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        quantity: 500,
        minStock: 50,
        reorderPoint: 100,
        buyingPrice: 2.50,
        sellingPrice: 5.00,
        storageLocation: 'Shelf A-1',
        supplierName: 'PharmaCorp Ltd',
        purchaseDate: new Date('2024-02-01'),
        receiptNumber: 'RCP-2024-001',
        notes: 'High-demand pain reliever - keep well stocked'
    },
    {
        productSKU: 'PARA-500-TAB',
        batchNumber: 'PARA-BATCH-002',
        manufactureDate: new Date('2024-06-10'),
        expiryDate: new Date('2026-06-10'),
        quantity: 300,
        minStock: 50,
        reorderPoint: 100,
        buyingPrice: 2.60,
        sellingPrice: 5.00,
        storageLocation: 'Shelf A-1',
        supplierName: 'PharmaCorp Ltd',
        purchaseDate: new Date('2024-07-15'),
        receiptNumber: 'RCP-2024-045',
        notes: 'Newer batch - good stock levels'
    },
    {
        productSKU: 'PARA-500-TAB',
        batchNumber: 'PARA-BATCH-003',
        manufactureDate: new Date('2024-09-20'),
        expiryDate: new Date('2026-09-20'),
        quantity: 8, // Low stock to trigger alert
        minStock: 50,
        reorderPoint: 100,
        buyingPrice: 2.55,
        sellingPrice: 5.00,
        storageLocation: 'Shelf A-1',
        supplierName: 'MediSupply Inc',
        purchaseDate: new Date('2024-10-01'),
        receiptNumber: 'RCP-2024-089',
        notes: 'Low stock - needs reorder urgently'
    },

    // Amoxicillin - Multiple batches
    {
        productSKU: 'AMOX-500-CAP',
        batchNumber: 'AMOX-BATCH-A1',
        manufactureDate: new Date('2024-02-20'),
        expiryDate: new Date('2025-02-20'),
        quantity: 200,
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 15.00,
        sellingPrice: 25.00,
        storageLocation: 'Shelf B-2',
        supplierName: 'AntiBio Pharma',
        purchaseDate: new Date('2024-03-10'),
        receiptNumber: 'RCP-2024-015',
        notes: 'Prescription antibiotic - high turnover'
    },
    {
        productSKU: 'AMOX-500-CAP',
        batchNumber: 'AMOX-BATCH-A2',
        manufactureDate: new Date('2024-07-01'),
        expiryDate: new Date('2025-07-01'),
        quantity: 150,
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 15.50,
        sellingPrice: 25.00,
        storageLocation: 'Shelf B-2',
        supplierName: 'AntiBio Pharma',
        purchaseDate: new Date('2024-08-05'),
        receiptNumber: 'RCP-2024-067',
        notes: 'Regular stock rotation'
    },

    // Ibuprofen - Multiple batches with different expiry dates
    {
        productSKU: 'IBU-400-TAB',
        batchNumber: 'IBU-2024-Q1',
        manufactureDate: new Date('2024-01-10'),
        expiryDate: new Date('2026-01-10'),
        quantity: 400,
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 3.50,
        sellingPrice: 7.00,
        storageLocation: 'Shelf A-2',
        supplierName: 'PainRelief Corp',
        purchaseDate: new Date('2024-01-25'),
        receiptNumber: 'RCP-2024-005',
        notes: 'Popular NSAID - monitor stock levels'
    },
    {
        productSKU: 'IBU-400-TAB',
        batchNumber: 'IBU-2024-Q3',
        manufactureDate: new Date('2024-08-15'),
        expiryDate: new Date('2026-08-15'),
        quantity: 5, // Very low stock - critical alert
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 3.60,
        sellingPrice: 7.00,
        storageLocation: 'Shelf A-2',
        supplierName: 'PainRelief Corp',
        purchaseDate: new Date('2024-09-10'),
        receiptNumber: 'RCP-2024-078',
        notes: 'CRITICAL: Very low stock - immediate reorder needed'
    },

    // Omeprazole
    {
        productSKU: 'OMEP-20-CAP',
        batchNumber: 'OMEP-BATCH-2024-01',
        manufactureDate: new Date('2024-03-01'),
        expiryDate: new Date('2026-03-01'),
        quantity: 180,
        minStock: 25,
        reorderPoint: 50,
        buyingPrice: 8.00,
        sellingPrice: 15.00,
        storageLocation: 'Shelf C-1',
        supplierName: 'GastroMed Supplies',
        purchaseDate: new Date('2024-04-10'),
        receiptNumber: 'RCP-2024-028',
        notes: 'Acid reducer - steady demand'
    },

    // Cetirizine - Good stock
    {
        productSKU: 'CETI-10-TAB',
        batchNumber: 'CETI-2024-SPRING',
        manufactureDate: new Date('2024-04-01'),
        expiryDate: new Date('2027-04-01'),
        quantity: 600,
        minStock: 50,
        reorderPoint: 100,
        buyingPrice: 1.50,
        sellingPrice: 3.50,
        storageLocation: 'Shelf D-3',
        supplierName: 'AllergyFree Pharma',
        purchaseDate: new Date('2024-05-15'),
        receiptNumber: 'RCP-2024-038',
        notes: 'Seasonal demand - stock up before allergy season'
    },

    // Metformin
    {
        productSKU: 'METF-500-TAB',
        batchNumber: 'METF-BATCH-2024-A',
        manufactureDate: new Date('2024-02-10'),
        expiryDate: new Date('2026-02-10'),
        quantity: 250,
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 4.00,
        sellingPrice: 8.50,
        storageLocation: 'Shelf E-1',
        supplierName: 'DiabetesCare Ltd',
        purchaseDate: new Date('2024-03-05'),
        receiptNumber: 'RCP-2024-020',
        notes: 'Diabetes medication - consistent prescription demand'
    },

    // Amlodipine
    {
        productSKU: 'AMLO-5-TAB',
        batchNumber: 'AMLO-2024-001',
        manufactureDate: new Date('2024-01-20'),
        expiryDate: new Date('2027-01-20'),
        quantity: 320,
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 5.50,
        sellingPrice: 12.00,
        storageLocation: 'Shelf F-2',
        supplierName: 'CardioHealth Pharma',
        purchaseDate: new Date('2024-02-15'),
        receiptNumber: 'RCP-2024-012',
        notes: 'Blood pressure medication - long-term prescriptions'
    },

    // Vitamin D3 - Multiple batches
    {
        productSKU: 'VITD-1000-CAP',
        batchNumber: 'VITD-2024-BATCH1',
        manufactureDate: new Date('2024-05-01'),
        expiryDate: new Date('2027-05-01'),
        quantity: 800,
        minStock: 100,
        reorderPoint: 200,
        buyingPrice: 6.00,
        sellingPrice: 12.00,
        storageLocation: 'Shelf G-1',
        supplierName: 'VitaHealth Inc',
        purchaseDate: new Date('2024-06-01'),
        receiptNumber: 'RCP-2024-042',
        notes: 'Popular supplement - high demand'
    },
    {
        productSKU: 'VITD-1000-CAP',
        batchNumber: 'VITD-2024-BATCH2',
        manufactureDate: new Date('2024-08-01'),
        expiryDate: new Date('2027-08-01'),
        quantity: 15, // Low stock
        minStock: 100,
        reorderPoint: 200,
        buyingPrice: 6.20,
        sellingPrice: 12.00,
        storageLocation: 'Shelf G-1',
        supplierName: 'VitaHealth Inc',
        purchaseDate: new Date('2024-09-05'),
        receiptNumber: 'RCP-2024-075',
        notes: 'Low stock - reorder soon'
    },

    // Aspirin
    {
        productSKU: 'ASP-75-TAB',
        batchNumber: 'ASP-2024-CARDIO',
        manufactureDate: new Date('2024-03-15'),
        expiryDate: new Date('2026-03-15'),
        quantity: 450,
        minStock: 50,
        reorderPoint: 100,
        buyingPrice: 1.20,
        sellingPrice: 2.50,
        storageLocation: 'Shelf A-3',
        supplierName: 'CardioAspirin Ltd',
        purchaseDate: new Date('2024-04-20'),
        receiptNumber: 'RCP-2024-032',
        notes: 'Low-dose for cardiovascular protection'
    },

    // Salbutamol
    {
        productSKU: 'SALB-100-INH',
        batchNumber: 'SALB-2024-RESP01',
        manufactureDate: new Date('2024-06-01'),
        expiryDate: new Date('2025-12-01'),
        quantity: 80,
        minStock: 15,
        reorderPoint: 30,
        buyingPrice: 45.00,
        sellingPrice: 85.00,
        storageLocation: 'Refrigerator Unit B',
        supplierName: 'RespiraCare Pharma',
        purchaseDate: new Date('2024-07-10'),
        receiptNumber: 'RCP-2024-055',
        notes: 'Asthma inhaler - requires refrigeration'
    },

    // Diclofenac - Expiring soon example
    {
        productSKU: 'DICL-50-TAB',
        batchNumber: 'DICL-2024-EARLY',
        manufactureDate: new Date('2023-11-01'),
        expiryDate: new Date('2024-11-15'), // Expiring very soon!
        quantity: 120,
        minStock: 20,
        reorderPoint: 40,
        buyingPrice: 4.50,
        sellingPrice: 9.00,
        storageLocation: 'Shelf A-4',
        supplierName: 'AntiInflam Corp',
        purchaseDate: new Date('2023-12-10'),
        receiptNumber: 'RCP-2023-145',
        notes: 'WARNING: Expiring soon - use/dispose urgently'
    },

    // Multivitamin
    {
        productSKU: 'MULTI-DAILY-TAB',
        batchNumber: 'MULTI-2024-WELLNESS',
        manufactureDate: new Date('2024-07-01'),
        expiryDate: new Date('2027-07-01'),
        quantity: 1000,
        minStock: 150,
        reorderPoint: 300,
        buyingPrice: 8.50,
        sellingPrice: 18.00,
        storageLocation: 'Shelf G-2',
        supplierName: 'WellnessVita Inc',
        purchaseDate: new Date('2024-08-15'),
        receiptNumber: 'RCP-2024-070',
        notes: 'Best seller - maintain high stock levels'
    },

    // Ciprofloxacin
    {
        productSKU: 'CIPRO-500-TAB',
        batchNumber: 'CIPRO-2024-AB01',
        manufactureDate: new Date('2024-04-10'),
        expiryDate: new Date('2026-04-10'),
        quantity: 100,
        minStock: 20,
        reorderPoint: 40,
        buyingPrice: 18.00,
        sellingPrice: 35.00,
        storageLocation: 'Shelf B-3',
        supplierName: 'AntiBio Pharma',
        purchaseDate: new Date('2024-05-20'),
        receiptNumber: 'RCP-2024-040',
        notes: 'Broad-spectrum antibiotic - prescription required'
    },

    // Loratadine
    {
        productSKU: 'LORA-10-TAB',
        batchNumber: 'LORA-2024-ALLERGY',
        manufactureDate: new Date('2024-05-15'),
        expiryDate: new Date('2027-05-15'),
        quantity: 350,
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 2.00,
        sellingPrice: 4.50,
        storageLocation: 'Shelf D-4',
        supplierName: 'AllergyFree Pharma',
        purchaseDate: new Date('2024-06-20'),
        receiptNumber: 'RCP-2024-048',
        notes: 'Non-drowsy antihistamine - popular choice'
    },

    // Atorvastatin
    {
        productSKU: 'ATOR-10-TAB',
        batchNumber: 'ATOR-2024-CHOL01',
        manufactureDate: new Date('2024-03-20'),
        expiryDate: new Date('2027-03-20'),
        quantity: 200,
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 12.00,
        sellingPrice: 25.00,
        storageLocation: 'Shelf F-3',
        supplierName: 'CardioHealth Pharma',
        purchaseDate: new Date('2024-04-25'),
        receiptNumber: 'RCP-2024-035',
        notes: 'Cholesterol medication - long-term therapy'
    }
];

async function seedInventory() {
    try {
        console.log('🌱 Starting inventory seeding...\n');

        let successCount = 0;
        let failCount = 0;
        const failedItems = [];

        for (const item of sampleInventoryItems) {
            try {
                // Find product by SKU
                const product = await Product.findOne({ sku: item.productSKU });
                
                if (!product) {
                    console.log(`❌ Product not found: ${item.productSKU}`);
                    failCount++;
                    failedItems.push({ item: item.productSKU, reason: 'Product not found' });
                    continue;
                }

                // Check if this exact inventory item already exists
                const existingItem = await InventoryItem.findOne({
                    product: product._id,
                    batchNumber: item.batchNumber,
                    manufactureDate: item.manufactureDate,
                    expiryDate: item.expiryDate
                });

                if (existingItem) {
                    console.log(`⚠️  Inventory item already exists: ${product.name} - Batch ${item.batchNumber}`);
                    failCount++;
                    failedItems.push({ item: `${item.productSKU} - ${item.batchNumber}`, reason: 'Already exists' });
                    continue;
                }

                // Create inventory item
                const inventoryItem = new InventoryItem({
                    product: product._id,
                    batchNumber: item.batchNumber,
                    manufactureDate: item.manufactureDate,
                    expiryDate: item.expiryDate,
                    quantity: item.quantity,
                    minStock: item.minStock,
                    reorderPoint: item.reorderPoint,
                    buyingPrice: item.buyingPrice,
                    sellingPrice: item.sellingPrice,
                    storageLocation: item.storageLocation,
                    supplierName: item.supplierName,
                    purchaseDate: item.purchaseDate,
                    receiptNumber: item.receiptNumber,
                    notes: item.notes,
                    status: 'available'
                });

                await inventoryItem.save();

                const statusEmoji = inventoryItem.availability === 'in-stock' ? '🟢' : 
                                   inventoryItem.availability === 'low-stock' ? '🟡' : '🔴';

                console.log(`✅ ${statusEmoji} Added: ${product.name} - Batch ${item.batchNumber} (Qty: ${item.quantity}, Status: ${inventoryItem.availability})`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error adding ${item.productSKU} - ${item.batchNumber}:`, error.message);
                failCount++;
                failedItems.push({ item: `${item.productSKU} - ${item.batchNumber}`, reason: error.message });
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 INVENTORY SEEDING SUMMARY');
        console.log('='.repeat(70));
        console.log(`✅ Successfully added: ${successCount} inventory items`);
        console.log(`❌ Failed: ${failCount} inventory items`);
        
        if (failedItems.length > 0) {
            console.log('\n❌ Failed items:');
            failedItems.forEach(({ item, reason }) => {
                console.log(`   - ${item}: ${reason}`);
            });
        }

        // Get inventory summary
        const totalItems = await InventoryItem.countDocuments();
        const lowStockItems = await InventoryItem.countDocuments({ availability: 'low-stock' });
        const outOfStockItems = await InventoryItem.countDocuments({ availability: 'out-of-stock' });
        const inStockItems = await InventoryItem.countDocuments({ availability: 'in-stock' });

        console.log('\n' + '='.repeat(70));
        console.log('📦 CURRENT INVENTORY STATUS');
        console.log('='.repeat(70));
        console.log(`Total inventory items: ${totalItems}`);
        console.log(`🟢 In Stock: ${inStockItems}`);
        console.log(`🟡 Low Stock: ${lowStockItems}`);
        console.log(`🔴 Out of Stock: ${outOfStockItems}`);

        console.log('\n✨ Inventory seeding completed!');

    } catch (error) {
        console.error('❌ Fatal error during seeding:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding
seedInventory();
