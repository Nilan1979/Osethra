/**
 * Seed Sample Products Script
 * 
 * This script adds 20 sample pharmaceutical products to the database.
 * These are realistic products commonly found in pharmacies.
 * 
 * Usage: node seed-sample-products.js
 */

const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Paracetamol 500mg Tablets',
    sku: 'PARA-500-TAB',
    category: 'Analgesics',
    description: 'Pain relief and fever reduction medication',
    manufacturer: 'ABC Pharmaceuticals',
    unit: 'tablets',
    barcode: '8901234567001',
    prescription: false,
    status: 'active',
    notes: 'Common pain reliever, safe for most patients'
  },
  {
    name: 'Amoxicillin 500mg Capsules',
    sku: 'AMOX-500-CAP',
    category: 'Antibiotics',
    description: 'Broad-spectrum antibiotic for bacterial infections',
    manufacturer: 'XYZ Pharma Ltd',
    unit: 'capsules',
    barcode: '8901234567002',
    prescription: true,
    status: 'active',
    notes: 'Requires prescription, check for penicillin allergy'
  },
  {
    name: 'Ibuprofen 400mg Tablets',
    sku: 'IBU-400-TAB',
    category: 'Analgesics',
    description: 'Anti-inflammatory and pain relief medication',
    manufacturer: 'MediCare Industries',
    unit: 'tablets',
    barcode: '8901234567003',
    prescription: false,
    status: 'active',
    notes: 'Take with food to avoid stomach upset'
  },
  {
    name: 'Omeprazole 20mg Capsules',
    sku: 'OMEP-20-CAP',
    category: 'Gastrointestinal',
    description: 'Proton pump inhibitor for acid reflux and ulcers',
    manufacturer: 'Global Health Ltd',
    unit: 'capsules',
    barcode: '8901234567004',
    prescription: true,
    status: 'active',
    notes: 'Take before meals for best results'
  },
  {
    name: 'Cetirizine 10mg Tablets',
    sku: 'CETI-10-TAB',
    category: 'Antihistamines',
    description: 'Allergy relief medication',
    manufacturer: 'AllerFree Pharma',
    unit: 'tablets',
    barcode: '8901234567005',
    prescription: false,
    status: 'active',
    notes: 'May cause drowsiness in some patients'
  },
  {
    name: 'Metformin 500mg Tablets',
    sku: 'METF-500-TAB',
    category: 'Antidiabetic',
    description: 'Blood sugar control medication for Type 2 diabetes',
    manufacturer: 'DiabCare Pharmaceuticals',
    unit: 'tablets',
    barcode: '8901234567006',
    prescription: true,
    status: 'active',
    notes: 'Monitor blood glucose levels regularly'
  },
  {
    name: 'Amlodipine 5mg Tablets',
    sku: 'AMLO-5-TAB',
    category: 'Antihypertensive',
    description: 'Blood pressure control medication',
    manufacturer: 'CardioHealth Ltd',
    unit: 'tablets',
    barcode: '8901234567007',
    prescription: true,
    status: 'active',
    notes: 'Take at same time daily for best results'
  },
  {
    name: 'Vitamin D3 1000IU Tablets',
    sku: 'VITD3-1000-TAB',
    category: 'Vitamins & Supplements',
    description: 'Vitamin D supplement for bone health',
    manufacturer: 'NutriVita Corp',
    unit: 'tablets',
    barcode: '8901234567008',
    prescription: false,
    status: 'active',
    notes: 'Supports bone and immune health'
  },
  {
    name: 'Aspirin 75mg Tablets',
    sku: 'ASP-75-TAB',
    category: 'Cardiovascular',
    description: 'Low-dose aspirin for heart health',
    manufacturer: 'HeartCare Pharma',
    unit: 'tablets',
    barcode: '8901234567009',
    prescription: false,
    status: 'active',
    notes: 'Often prescribed for cardiovascular protection'
  },
  {
    name: 'Salbutamol Inhaler 100mcg',
    sku: 'SALB-100-INH',
    category: 'Respiratory',
    description: 'Fast-acting bronchodilator for asthma relief',
    manufacturer: 'RespiCare Ltd',
    unit: 'pieces',
    barcode: '8901234567010',
    prescription: true,
    status: 'active',
    notes: 'Shake well before use, rinse mouth after'
  },
  {
    name: 'Diclofenac 50mg Tablets',
    sku: 'DICL-50-TAB',
    category: 'Analgesics',
    description: 'Non-steroidal anti-inflammatory drug (NSAID)',
    manufacturer: 'PainRelief Pharmaceuticals',
    unit: 'tablets',
    barcode: '8901234567011',
    prescription: true,
    status: 'active',
    notes: 'Take with food, avoid in stomach ulcers'
  },
  {
    name: 'Multivitamin Tablets',
    sku: 'MULTI-VIT-TAB',
    category: 'Vitamins & Supplements',
    description: 'Complete multivitamin and mineral supplement',
    manufacturer: 'WellBeing Nutra',
    unit: 'tablets',
    barcode: '8901234567012',
    prescription: false,
    status: 'active',
    notes: 'Daily nutritional support'
  },
  {
    name: 'Ciprofloxacin 500mg Tablets',
    sku: 'CIPRO-500-TAB',
    category: 'Antibiotics',
    description: 'Fluoroquinolone antibiotic for various infections',
    manufacturer: 'InfectFree Pharma',
    unit: 'tablets',
    barcode: '8901234567013',
    prescription: true,
    status: 'active',
    notes: 'Complete full course as prescribed'
  },
  {
    name: 'Loratadine 10mg Tablets',
    sku: 'LORA-10-TAB',
    category: 'Antihistamines',
    description: 'Non-drowsy allergy relief',
    manufacturer: 'AllerFree Pharma',
    unit: 'tablets',
    barcode: '8901234567014',
    prescription: false,
    status: 'active',
    notes: 'Non-drowsy formula, once daily'
  },
  {
    name: 'Atorvastatin 20mg Tablets',
    sku: 'ATOR-20-TAB',
    category: 'Cardiovascular',
    description: 'Cholesterol-lowering medication',
    manufacturer: 'LipidCare Ltd',
    unit: 'tablets',
    barcode: '8901234567015',
    prescription: true,
    status: 'active',
    notes: 'Monitor liver function periodically'
  },
  {
    name: 'Ranitidine 150mg Tablets',
    sku: 'RANI-150-TAB',
    category: 'Gastrointestinal',
    description: 'H2 blocker for acid reflux and heartburn',
    manufacturer: 'GastroHealth Pharma',
    unit: 'tablets',
    barcode: '8901234567016',
    prescription: false,
    status: 'active',
    notes: 'Take before meals or at bedtime'
  },
  {
    name: 'Insulin Glargine 100U/ml',
    sku: 'INS-GLAR-100',
    category: 'Antidiabetic',
    description: 'Long-acting insulin for diabetes management',
    manufacturer: 'DiabCare Biologics',
    unit: 'vials',
    barcode: '8901234567017',
    prescription: true,
    status: 'active',
    notes: 'Store in refrigerator, requires proper injection technique'
  },
  {
    name: 'Cough Syrup 100ml',
    sku: 'COUGH-SYR-100',
    category: 'Respiratory',
    description: 'Relief from cough and cold symptoms',
    manufacturer: 'ColdCare Pharmaceuticals',
    unit: 'bottles',
    barcode: '8901234567018',
    prescription: false,
    status: 'active',
    notes: 'Shake well before use, measure with provided cup'
  },
  {
    name: 'Prednisone 5mg Tablets',
    sku: 'PRED-5-TAB',
    category: 'Corticosteroids',
    description: 'Anti-inflammatory corticosteroid',
    manufacturer: 'ImmunoHealth Ltd',
    unit: 'tablets',
    barcode: '8901234567019',
    prescription: true,
    status: 'active',
    notes: 'Do not stop abruptly, taper as directed'
  },
  {
    name: 'Calcium Carbonate 500mg Tablets',
    sku: 'CALC-500-TAB',
    category: 'Vitamins & Supplements',
    description: 'Calcium supplement for bone health',
    manufacturer: 'BoneStrong Nutra',
    unit: 'tablets',
    barcode: '8901234567020',
    prescription: false,
    status: 'active',
    notes: 'Best absorbed with vitamin D'
  }
];

const seedProducts = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Check existing products
    const existingCount = await Product.countDocuments();
    console.log(`\n📦 Existing products in database: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('\n⚠️  Warning: Database already contains products.');
      console.log('💡 This script will add 20 more products to existing ones.');
      console.log('\n⏳ Proceeding in 2 seconds... Press Ctrl+C to cancel.\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('📝 Adding 20 sample products...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const productData of sampleProducts) {
      try {
        const product = new Product(productData);
        await product.save();
        successCount++;
        console.log(`✅ ${successCount}. Added: ${productData.name} (${productData.sku})`);
      } catch (error) {
        errorCount++;
        const errorMsg = `❌ Failed: ${productData.name} - ${error.message}`;
        console.log(errorMsg);
        errors.push({ product: productData.name, error: error.message });
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Summary:');
    console.log('═'.repeat(60));
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📦 Total products in database: ${await Product.countDocuments()}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.product}: ${err.error}`);
      });
    }
    
    console.log('\n✨ Product seeding completed!');
    console.log('💡 You can now add inventory for these products.\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error seeding products:', error.message);
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
console.log('🌱 Sample Products Seeding Script');
console.log('═══════════════════════════════════════════════════════\n');

seedProducts();
