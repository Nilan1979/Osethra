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

async function checkInventory() {
    try {
        console.log('🔍 Checking current inventory...\n');

        const products = await Product.find({}).sort({ name: 1 });
        const inventoryItems = await InventoryItem.find({}).populate('product').sort({ createdAt: -1 });

        console.log('=' .repeat(70));
        console.log('📦 PRODUCTS IN DATABASE');
        console.log('='.repeat(70));
        console.log(`Total Products: ${products.length}\n`);

        if (products.length === 0) {
            console.log('❌ No products found in database');
        } else {
            products.forEach((product, index) => {
                const rxBadge = product.prescription ? '🔒' : '✓';
                console.log(`${index + 1}. ${rxBadge} ${product.name} (${product.sku})`);
            });
        }

        console.log('\n' + '='.repeat(70));
        console.log('📦 INVENTORY ITEMS IN DATABASE');
        console.log('='.repeat(70));
        console.log(`Total Inventory Items: ${inventoryItems.length}\n`);

        if (inventoryItems.length === 0) {
            console.log('❌ No inventory items found in database');
        } else {
            inventoryItems.forEach((item, index) => {
                const statusEmoji = item.availability === 'in-stock' ? '🟢' : 
                                   item.availability === 'low-stock' ? '🟡' : '🔴';
                const productName = item.product ? item.product.name : 'Unknown Product';
                console.log(`${index + 1}. ${statusEmoji} ${productName} - Batch: ${item.batchNumber} (Qty: ${item.quantity}, Status: ${item.availability})`);
            });
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 STOCK STATUS SUMMARY');
        console.log('='.repeat(70));
        const inStock = await InventoryItem.countDocuments({ availability: 'in-stock' });
        const lowStock = await InventoryItem.countDocuments({ availability: 'low-stock' });
        const outOfStock = await InventoryItem.countDocuments({ availability: 'out-of-stock' });

        console.log(`🟢 In Stock: ${inStock}`);
        console.log(`🟡 Low Stock: ${lowStock}`);
        console.log(`🔴 Out of Stock: ${outOfStock}`);
        console.log(`📦 Total: ${inventoryItems.length}`);

    } catch (error) {
        console.error('❌ Error checking inventory:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
        process.exit(0);
    }
}

// Run the check
checkInventory();
