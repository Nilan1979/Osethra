require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');
const InventoryItem = require('./Model/InventoryItemModel');

// Use the same MongoDB connection as the server
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
}

console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

const products = [
    {
        name: 'Paracetamol 500mg Tablets',
        sku: 'PARA-500-TAB',
        description: 'Pain reliever and fever reducer',
        category: 'Pain Relief',
        manufacturer: 'PharmaCorp Ltd',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678901',
        status: 'active'
    },
    {
        name: 'Amoxicillin 500mg Capsules',
        sku: 'AMOX-500-CAP',
        description: 'Broad-spectrum antibiotic for bacterial infections',
        category: 'Antibiotics',
        manufacturer: 'AntiBio Pharma',
        prescription: true,
        unit: 'capsules',
        barcode: '5012345678902',
        status: 'active'
    },
    {
        name: 'Ibuprofen 400mg Tablets',
        sku: 'IBU-400-TAB',
        description: 'Non-steroidal anti-inflammatory drug (NSAID)',
        category: 'Pain Relief',
        manufacturer: 'PainRelief Corp',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678903',
        status: 'active'
    },
    {
        name: 'Omeprazole 20mg Capsules',
        sku: 'OMEP-20-CAP',
        description: 'Proton pump inhibitor for acid reflux',
        category: 'Gastrointestinal',
        manufacturer: 'GastroMed Supplies',
        prescription: false,
        unit: 'capsules',
        barcode: '5012345678904',
        status: 'active'
    },
    {
        name: 'Cetirizine 10mg Tablets',
        sku: 'CETI-10-TAB',
        description: 'Antihistamine for allergies',
        category: 'Antihistamines',
        manufacturer: 'AllergyFree Pharma',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678905',
        status: 'active'
    },
    {
        name: 'Metformin 500mg Tablets',
        sku: 'METF-500-TAB',
        description: 'Diabetes medication for blood sugar control',
        category: 'Diabetes',
        manufacturer: 'DiabetesCare Ltd',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678906',
        status: 'active'
    },
    {
        name: 'Amlodipine 5mg Tablets',
        sku: 'AMLO-5-TAB',
        description: 'Calcium channel blocker for high blood pressure',
        category: 'Cardiovascular',
        manufacturer: 'CardioHealth Pharma',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678907',
        status: 'active'
    },
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
        name: 'Vitamin D3 1000IU Capsules',
        sku: 'VITD-1000-CAP',
        description: 'Vitamin supplement for bone health',
        category: 'Vitamins & Supplements',
        manufacturer: 'VitaHealth Inc',
        prescription: false,
        unit: 'capsules',
        barcode: '5012345678908',
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
    }
];

const inventoryItems = [
    // Paracetamol - Multiple batches
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
        notes: 'High-demand pain reliever'
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
        notes: 'Good stock levels'
    },
    {
        productSKU: 'PARA-500-TAB',
        batchNumber: 'PARA-BATCH-003',
        manufactureDate: new Date('2024-09-20'),
        expiryDate: new Date('2026-09-20'),
        quantity: 8,
        minStock: 50,
        reorderPoint: 100,
        buyingPrice: 2.55,
        sellingPrice: 5.00,
        storageLocation: 'Shelf A-1',
        supplierName: 'MediSupply Inc',
        purchaseDate: new Date('2024-10-01'),
        receiptNumber: 'RCP-2024-089',
        notes: 'Low stock - needs reorder'
    },
    // Amoxicillin
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
        notes: 'Prescription antibiotic'
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
        notes: 'Regular stock'
    },
    // Ibuprofen
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
        notes: 'Popular NSAID'
    },
    {
        productSKU: 'IBU-400-TAB',
        batchNumber: 'IBU-2024-Q3',
        manufactureDate: new Date('2024-08-15'),
        expiryDate: new Date('2026-08-15'),
        quantity: 5,
        minStock: 40,
        reorderPoint: 80,
        buyingPrice: 3.60,
        sellingPrice: 7.00,
        storageLocation: 'Shelf A-2',
        supplierName: 'PainRelief Corp',
        purchaseDate: new Date('2024-09-10'),
        receiptNumber: 'RCP-2024-078',
        notes: 'CRITICAL: Low stock'
    },
    // Omeprazole
    {
        productSKU: 'OMEP-20-CAP',
        batchNumber: 'OMEP-2024-01',
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
        notes: 'Acid reducer'
    },
    // Cetirizine
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
        notes: 'Seasonal demand'
    },
    // Metformin
    {
        productSKU: 'METF-500-TAB',
        batchNumber: 'METF-2024-A',
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
        notes: 'Diabetes medication'
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
        notes: 'Blood pressure medication'
    },
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
        notes: 'Z-pack antibiotic'
    },
    {
        productSKU: 'AZITH-500-TAB',
        batchNumber: 'AZITH-2024-002',
        manufactureDate: new Date('2024-08-01'),
        expiryDate: new Date('2026-08-01'),
        quantity: 4,
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
    // Vitamin D3
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
        notes: 'Popular supplement'
    },
    {
        productSKU: 'VITD-1000-CAP',
        batchNumber: 'VITD-2024-BATCH2',
        manufactureDate: new Date('2024-08-01'),
        expiryDate: new Date('2027-08-01'),
        quantity: 15,
        minStock: 100,
        reorderPoint: 200,
        buyingPrice: 6.20,
        sellingPrice: 12.00,
        storageLocation: 'Shelf G-1',
        supplierName: 'VitaHealth Inc',
        purchaseDate: new Date('2024-09-05'),
        receiptNumber: 'RCP-2024-075',
        notes: 'Low stock'
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
        notes: 'Blood pressure medication'
    }
];

async function seedToAtlas() {
    try {
        console.log('\n🌱 Starting seeding to MongoDB Atlas...\n');

        // Seed Products
        let productCount = 0;
        let productSkipped = 0;

        console.log('=' .repeat(70));
        console.log('📦 SEEDING PRODUCTS');
        console.log('='.repeat(70));

        for (const productData of products) {
            const existing = await Product.findOne({ sku: productData.sku });
            if (existing) {
                console.log(`⚠️  Exists: ${productData.name}`);
                productSkipped++;
            } else {
                await Product.create(productData);
                const badge = productData.prescription ? '🔒' : '✓';
                console.log(`✅ ${badge} Added: ${productData.name}`);
                productCount++;
            }
        }

        // Seed Inventory
        let inventoryCount = 0;
        let inventorySkipped = 0;

        console.log('\n' + '='.repeat(70));
        console.log('📦 SEEDING INVENTORY');
        console.log('='.repeat(70));

        for (const item of inventoryItems) {
            const product = await Product.findOne({ sku: item.productSKU });
            if (!product) {
                console.log(`❌ Product not found: ${item.productSKU}`);
                continue;
            }

            const existing = await InventoryItem.findOne({
                product: product._id,
                batchNumber: item.batchNumber
            });

            if (existing) {
                console.log(`⚠️  Exists: ${product.name} - ${item.batchNumber}`);
                inventorySkipped++;
            } else {
                const inventoryItem = await InventoryItem.create({
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

                const emoji = inventoryItem.availability === 'in-stock' ? '🟢' : 
                             inventoryItem.availability === 'low-stock' ? '🟡' : '🔴';
                console.log(`✅ ${emoji} Added: ${product.name} - ${item.batchNumber} (Qty: ${item.quantity})`);
                inventoryCount++;
            }
        }

        // Summary
        const totalProducts = await Product.countDocuments();
        const totalInventory = await InventoryItem.countDocuments();
        const lowStock = await InventoryItem.countDocuments({ availability: 'low-stock' });
        const inStock = await InventoryItem.countDocuments({ availability: 'in-stock' });

        console.log('\n' + '='.repeat(70));
        console.log('📊 SEEDING SUMMARY');
        console.log('='.repeat(70));
        console.log(`\n📦 Products:`);
        console.log(`   ✅ Added: ${productCount}`);
        console.log(`   ⚠️  Skipped: ${productSkipped}`);
        console.log(`   📦 Total in DB: ${totalProducts}`);
        
        console.log(`\n📦 Inventory Items:`);
        console.log(`   ✅ Added: ${inventoryCount}`);
        console.log(`   ⚠️  Skipped: ${inventorySkipped}`);
        console.log(`   📦 Total in DB: ${totalInventory}`);

        console.log(`\n📊 Stock Status:`);
        console.log(`   🟢 In Stock: ${inStock}`);
        console.log(`   🟡 Low Stock: ${lowStock}`);

        console.log('\n✨ Seeding to MongoDB Atlas completed!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
        process.exit(0);
    }
}

seedToAtlas();
