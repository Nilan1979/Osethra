/**
 * Clear All Products Script
 * 
 * This script removes ALL products from the database.
 * Use this to clean the database before re-entering products with the new structure.
 * 
 * WARNING: This action is IRREVERSIBLE. All product data will be permanently deleted.
 * 
 * Usage: node clear-products.js
 */

const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');
require('dotenv').config();

const clearAllProducts = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Count products before deletion
    const productCount = await Product.countDocuments();
    console.log(`\n📦 Total products in database: ${productCount}`);
    
    if (productCount === 0) {
      console.log('✨ Database is already clean. No products to delete.');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Ask for confirmation (in production, you might want to add a CLI prompt)
    console.log('\n⚠️  WARNING: You are about to delete ALL products from the database!');
    console.log('⚠️  This action is IRREVERSIBLE!');
    console.log('\n💡 Starting deletion in 3 seconds... Press Ctrl+C to cancel.\n');
    
    // Wait 3 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🗑️  Deleting all products...');
    
    // Delete all products
    const result = await Product.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} products`);
    
    // Verify deletion
    const remainingCount = await Product.countDocuments();
    console.log(`📊 Remaining products: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('\n✨ Database cleaned successfully!');
      console.log('💡 You can now add new products with the updated structure.');
    } else {
      console.log('\n⚠️  Warning: Some products may still remain in the database.');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error clearing products:', error.message);
    console.error('Full error:', error);
    
    // Close connection on error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
};

// Run the script
console.log('═══════════════════════════════════════════════════════');
console.log('🧹 Product Database Cleanup Script');
console.log('═══════════════════════════════════════════════════════\n');

clearAllProducts();
