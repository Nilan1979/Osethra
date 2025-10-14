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

const additionalProducts = [
    {
        name: 'Azithromycin 500mg Tablets',
        sku: 'AZITH-500-TAB',
        description: 'Macrolide antibiotic for bacterial infections',
        category: 'Antibiotics',
        manufacturer: 'MacroMed Pharma',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678920',
        status: 'active'
    },
    {
        name: 'Doxycycline 100mg Capsules',
        sku: 'DOXY-100-CAP',
        description: 'Tetracycline antibiotic for various infections',
        category: 'Antibiotics',
        manufacturer: 'TetracycMed Inc',
        prescription: true,
        unit: 'capsules',
        barcode: '5012345678921',
        status: 'active'
    },
    {
        name: 'Prednisolone 5mg Tablets',
        sku: 'PRED-5-TAB',
        description: 'Corticosteroid for inflammation and allergies',
        category: 'Steroids',
        manufacturer: 'SteroPharma Ltd',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678922',
        status: 'active'
    },
    {
        name: 'Ranitidine 150mg Tablets',
        sku: 'RANI-150-TAB',
        description: 'H2 blocker for acid reflux and ulcers',
        category: 'Gastrointestinal',
        manufacturer: 'GastroMed Supplies',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678923',
        status: 'active'
    },
    {
        name: 'Losartan 50mg Tablets',
        sku: 'LOSA-50-TAB',
        description: 'ARB for high blood pressure',
        category: 'Cardiovascular',
        manufacturer: 'CardioHealth Pharma',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678924',
        status: 'active'
    },
    {
        name: 'Folic Acid 5mg Tablets',
        sku: 'FOLIC-5-TAB',
        description: 'Vitamin B9 supplement',
        category: 'Vitamins & Supplements',
        manufacturer: 'VitaHealth Inc',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678925',
        status: 'active'
    },
    {
        name: 'Calcium Carbonate 500mg Tablets',
        sku: 'CALC-500-TAB',
        description: 'Calcium supplement for bone health',
        category: 'Vitamins & Supplements',
        manufacturer: 'BoneHealth Corp',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678926',
        status: 'active'
    },
    {
        name: 'Furosemide 40mg Tablets',
        sku: 'FURO-40-TAB',
        description: 'Loop diuretic for fluid retention',
        category: 'Diuretics',
        manufacturer: 'DiureticMed Ltd',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678927',
        status: 'active'
    },
    {
        name: 'Levothyroxine 100mcg Tablets',
        sku: 'LEVO-100-TAB',
        description: 'Thyroid hormone replacement',
        category: 'Hormones',
        manufacturer: 'ThyroidCare Inc',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678928',
        status: 'active'
    },
    {
        name: 'Montelukast 10mg Tablets',
        sku: 'MONT-10-TAB',
        description: 'Leukotriene receptor antagonist for asthma',
        category: 'Respiratory',
        manufacturer: 'RespiraCare Pharma',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678929',
        status: 'active'
    }
];

const additionalInventory = [
    // Azithromycin
    {
        productSKU: 'AZITH-500-TAB',
        batchNumber: 'AZITH-2024-001',
        manufactureDate: new Date('2024-03-15'),
        expiryDate: new Date('2026-03-15'),
        quantity: 180,
        minStock: 25,
        reorderPoint: 50,
        buyingPrice: 22.00,
        sellingPrice: 40.00,
        storageLocation: 'Shelf B-4',
        supplierName: 'MacroMed Pharma',
        purchaseDate: new Date('2024-04-10'),
        receiptNumber: 'RCP-2024-150',
        notes: 'Z-pack antibiotic - common prescription'
    },
    {
        productSKU: 'AZITH-500-TAB',
        batchNumber: 'AZITH-2024-002',
        manufactureDate: new Date('2024-08-01'),
        expiryDate: new Date('2026-08-01'),
        quantity: 4, // Low stock for testing
        minStock: 25,
        reorderPoint: 50,
        buyingPrice: 22.50,
        sellingPrice: 40.00,
        storageLocation: 'Shelf B-4',
        supplierName: 'MacroMed Pharma',
        purchaseDate: new Date('2024-09-05'),
        receiptNumber: 'RCP-2024-180',
        notes: 'CRITICAL LOW - reorder immediately'
    },
    // Doxycycline
    {
        productSKU: 'DOXY-100-CAP',
        batchNumber: 'DOXY-2024-SPRING',
        manufactureDate: new Date('2024-04-01'),
        expiryDate: new Date('2025-10-01'),
        quantity: 150,
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 18.00,
        sellingPrice: 32.00,
        storageLocation: 'Shelf B-5',
        supplierName: 'TetracycMed Inc',
        purchaseDate: new Date('2024-05-15'),
        receiptNumber: 'RCP-2024-155',
        notes: 'Versatile antibiotic - steady demand'
    },
    // Prednisolone - Multiple batches
    {
        productSKU: 'PRED-5-TAB',
        batchNumber: 'PRED-2024-Q1',
        manufactureDate: new Date('2024-01-20'),
        expiryDate: new Date('2026-01-20'),
        quantity: 300,
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 6.50,
        sellingPrice: 12.00,
        storageLocation: 'Shelf H-1',
        supplierName: 'SteroPharma Ltd',
        purchaseDate: new Date('2024-02-28'),
        receiptNumber: 'RCP-2024-160',
        notes: 'Steroid - requires careful dispensing'
    },
    {
        productSKU: 'PRED-5-TAB',
        batchNumber: 'PRED-2024-Q3',
        manufactureDate: new Date('2024-07-10'),
        expiryDate: new Date('2026-07-10'),
        quantity: 12, // Low stock
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 6.80,
        sellingPrice: 12.00,
        storageLocation: 'Shelf H-1',
        supplierName: 'SteroPharma Ltd',
        purchaseDate: new Date('2024-08-20'),
        receiptNumber: 'RCP-2024-175',
        notes: 'Low stock - monitor closely'
    },
    // Ranitidine
    {
        productSKU: 'RANI-150-TAB',
        batchNumber: 'RANI-2024-ACID',
        manufactureDate: new Date('2024-05-01'),
        expiryDate: new Date('2027-05-01'),
        quantity: 500,
        minStock: 60,
        reorderPoint: 120,
        buyingPrice: 3.20,
        sellingPrice: 6.50,
        storageLocation: 'Shelf C-2',
        supplierName: 'GastroMed Supplies',
        purchaseDate: new Date('2024-06-10'),
        receiptNumber: 'RCP-2024-165',
        notes: 'Popular antacid - high turnover'
    },
    // Losartan
    {
        productSKU: 'LOSA-50-TAB',
        batchNumber: 'LOSA-2024-BP01',
        manufactureDate: new Date('2024-02-15'),
        expiryDate: new Date('2027-02-15'),
        quantity: 280,
        minStock: 35,
        reorderPoint: 70,
        buyingPrice: 9.50,
        sellingPrice: 18.00,
        storageLocation: 'Shelf F-4',
        supplierName: 'CardioHealth Pharma',
        purchaseDate: new Date('2024-03-20'),
        receiptNumber: 'RCP-2024-170',
        notes: 'Blood pressure medication - chronic use'
    },
    // Folic Acid
    {
        productSKU: 'FOLIC-5-TAB',
        batchNumber: 'FOLIC-2024-001',
        manufactureDate: new Date('2024-06-01'),
        expiryDate: new Date('2027-06-01'),
        quantity: 750,
        minStock: 100,
        reorderPoint: 200,
        buyingPrice: 1.80,
        sellingPrice: 3.50,
        storageLocation: 'Shelf G-3',
        supplierName: 'VitaHealth Inc',
        purchaseDate: new Date('2024-07-05'),
        receiptNumber: 'RCP-2024-185',
        notes: 'Pregnancy supplement - high demand'
    },
    // Calcium Carbonate
    {
        productSKU: 'CALC-500-TAB',
        batchNumber: 'CALC-2024-BONE',
        manufactureDate: new Date('2024-04-20'),
        expiryDate: new Date('2027-04-20'),
        quantity: 900,
        minStock: 120,
        reorderPoint: 240,
        buyingPrice: 2.50,
        sellingPrice: 5.00,
        storageLocation: 'Shelf G-4',
        supplierName: 'BoneHealth Corp',
        purchaseDate: new Date('2024-05-25'),
        receiptNumber: 'RCP-2024-190',
        notes: 'Popular supplement - good margins'
    },
    // Furosemide
    {
        productSKU: 'FURO-40-TAB',
        batchNumber: 'FURO-2024-001',
        manufactureDate: new Date('2024-03-10'),
        expiryDate: new Date('2026-03-10'),
        quantity: 160,
        minStock: 25,
        reorderPoint: 50,
        buyingPrice: 7.00,
        sellingPrice: 13.50,
        storageLocation: 'Shelf I-1',
        supplierName: 'DiureticMed Ltd',
        purchaseDate: new Date('2024-04-15'),
        receiptNumber: 'RCP-2024-195',
        notes: 'Diuretic - elderly patient use'
    },
    // Levothyroxine - Multiple batches
    {
        productSKU: 'LEVO-100-TAB',
        batchNumber: 'LEVO-2024-Q1',
        manufactureDate: new Date('2024-02-01'),
        expiryDate: new Date('2026-02-01'),
        quantity: 220,
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 11.00,
        sellingPrice: 20.00,
        storageLocation: 'Shelf J-1',
        supplierName: 'ThyroidCare Inc',
        purchaseDate: new Date('2024-03-10'),
        receiptNumber: 'RCP-2024-200',
        notes: 'Thyroid medication - long-term prescriptions'
    },
    {
        productSKU: 'LEVO-100-TAB',
        batchNumber: 'LEVO-2024-Q3',
        manufactureDate: new Date('2024-08-05'),
        expiryDate: new Date('2026-08-05'),
        quantity: 7, // Low stock
        minStock: 30,
        reorderPoint: 60,
        buyingPrice: 11.50,
        sellingPrice: 20.00,
        storageLocation: 'Shelf J-1',
        supplierName: 'ThyroidCare Inc',
        purchaseDate: new Date('2024-09-12'),
        receiptNumber: 'RCP-2024-205',
        notes: 'Low stock - sensitive medication, reorder priority'
    },
    // Montelukast
    {
        productSKU: 'MONT-10-TAB',
        batchNumber: 'MONT-2024-ASTH',
        manufactureDate: new Date('2024-05-20'),
        expiryDate: new Date('2027-05-20'),
        quantity: 140,
        minStock: 20,
        reorderPoint: 40,
        buyingPrice: 28.00,
        sellingPrice: 50.00,
        storageLocation: 'Refrigerator Unit C',
        supplierName: 'RespiraCare Pharma',
        purchaseDate: new Date('2024-06-25'),
        receiptNumber: 'RCP-2024-210',
        notes: 'Asthma prevention - requires refrigeration'
    }
];

async function addMoreInventory() {
    try {
        console.log('🌱 Adding more products and inventory...\n');

        // Add Products
        let productSuccessCount = 0;
        let productSkipCount = 0;

        console.log('=' .repeat(70));
        console.log('📦 ADDING PRODUCTS');
        console.log('='.repeat(70));

        for (const productData of additionalProducts) {
            try {
                const existingProduct = await Product.findOne({ sku: productData.sku });
                
                if (existingProduct) {
                    console.log(`⚠️  Product already exists: ${productData.name} (${productData.sku})`);
                    productSkipCount++;
                    continue;
                }

                const product = new Product(productData);
                await product.save();

                const prescriptionBadge = productData.prescription ? '🔒' : '✓';
                console.log(`✅ ${prescriptionBadge} Added: ${productData.name} (${productData.sku})`);
                productSuccessCount++;

            } catch (error) {
                console.error(`❌ Error adding ${productData.name}:`, error.message);
            }
        }

        // Add Inventory
        let inventorySuccessCount = 0;
        let inventoryFailCount = 0;

        console.log('\n' + '='.repeat(70));
        console.log('📦 ADDING INVENTORY ITEMS');
        console.log('='.repeat(70));

        for (const item of additionalInventory) {
            try {
                const product = await Product.findOne({ sku: item.productSKU });
                
                if (!product) {
                    console.log(`❌ Product not found: ${item.productSKU}`);
                    inventoryFailCount++;
                    continue;
                }

                const existingItem = await InventoryItem.findOne({
                    product: product._id,
                    batchNumber: item.batchNumber
                });

                if (existingItem) {
                    console.log(`⚠️  Inventory already exists: ${product.name} - Batch ${item.batchNumber}`);
                    inventoryFailCount++;
                    continue;
                }

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
                inventorySuccessCount++;

            } catch (error) {
                console.error(`❌ Error adding ${item.productSKU} - ${item.batchNumber}:`, error.message);
                inventoryFailCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('📊 ADDITION SUMMARY');
        console.log('='.repeat(70));
        console.log(`\n📦 Products:`);
        console.log(`   ✅ Successfully added: ${productSuccessCount}`);
        console.log(`   ⚠️  Already existed: ${productSkipCount}`);
        
        console.log(`\n📦 Inventory Items:`);
        console.log(`   ✅ Successfully added: ${inventorySuccessCount}`);
        console.log(`   ❌ Failed/Skipped: ${inventoryFailCount}`);

        // Get totals
        const totalProducts = await Product.countDocuments();
        const totalInventory = await InventoryItem.countDocuments();
        const lowStockCount = await InventoryItem.countDocuments({ availability: 'low-stock' });
        const inStockCount = await InventoryItem.countDocuments({ availability: 'in-stock' });

        console.log('\n' + '='.repeat(70));
        console.log('📦 TOTAL DATABASE STATUS');
        console.log('='.repeat(70));
        console.log(`Total Products: ${totalProducts}`);
        console.log(`Total Inventory Items: ${totalInventory}`);
        console.log(`🟢 In Stock: ${inStockCount}`);
        console.log(`🟡 Low Stock: ${lowStockCount}`);

        console.log('\n✨ Addition completed!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
        process.exit(0);
    }
}

// Run the addition
addMoreInventory();
