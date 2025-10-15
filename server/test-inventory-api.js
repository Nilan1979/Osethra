require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');
const InventoryItem = require('./Model/InventoryItemModel');

async function testInventoryAPI() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Test 1: Get all products
        console.log('=== TEST 1: Get Products ===');
        const products = await Product.find({ status: 'active' }).limit(5);
        console.log(`Found ${products.length} active products`);
        products.forEach(p => {
            console.log(`  - ${p.name} (${p._id})`);
        });
        console.log('');

        // Test 2: Get all inventory items
        console.log('=== TEST 2: Get Inventory Items ===');
        const inventoryItems = await InventoryItem.find({ status: 'available' })
            .populate('product', 'name')
            .limit(10);
        console.log(`Found ${inventoryItems.length} available inventory items`);
        inventoryItems.forEach(item => {
            const productName = item.product?.name || 'Unknown';
            const productId = item.product?._id || item.product;
            console.log(`  - ${productName} (Product ID: ${productId})`);
            console.log(`    Batch: ${item.batchNumber}, Qty: ${item.quantity}, Expires: ${item.expiryDate.toISOString().split('T')[0]}`);
        });
        console.log('');

        // Test 3: Check product-inventory matching
        console.log('=== TEST 3: Product-Inventory Matching ===');
        if (products.length > 0) {
            const testProduct = products[0];
            console.log(`Testing product: ${testProduct.name} (${testProduct._id})`);
            
            const productInventory = await InventoryItem.find({ 
                product: testProduct._id,
                status: 'available'
            });
            
            console.log(`Found ${productInventory.length} inventory items for this product:`);
            productInventory.forEach(item => {
                console.log(`  - Batch: ${item.batchNumber}, Qty: ${item.quantity}, Price: ${item.sellingPrice}`);
            });
            
            const totalStock = productInventory
                .filter(item => item.quantity > 0 && new Date(item.expiryDate) > new Date())
                .reduce((sum, item) => sum + item.quantity, 0);
            
            console.log(`Total available stock: ${totalStock}`);
        }
        console.log('');

        // Test 4: All products with stock summary
        console.log('=== TEST 4: Products with Stock Summary ===');
        const allProducts = await Product.find({ status: 'active' });
        const allInventory = await InventoryItem.find({ status: 'available' });
        
        console.log(`Total Products: ${allProducts.length}`);
        console.log(`Total Inventory Items: ${allInventory.length}`);
        console.log('');
        
        allProducts.slice(0, 5).forEach(product => {
            const productInventory = allInventory.filter(item => 
                item.product.toString() === product._id.toString()
            );
            
            const totalStock = productInventory
                .filter(item => item.quantity > 0 && new Date(item.expiryDate) > new Date())
                .reduce((sum, item) => sum + item.quantity, 0);
            
            console.log(`${product.name}: ${totalStock} units across ${productInventory.length} batches`);
        });

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
    }
}

testInventoryAPI();
