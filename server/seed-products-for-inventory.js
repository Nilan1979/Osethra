const mongoose = require('mongoose');
const Product = require('./Model/ProductModel');

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

const sampleProducts = [
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
        name: 'Aspirin 75mg Tablets',
        sku: 'ASP-75-TAB',
        description: 'Low-dose aspirin for cardiovascular protection',
        category: 'Cardiovascular',
        manufacturer: 'CardioAspirin Ltd',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678909',
        status: 'active'
    },
    {
        name: 'Salbutamol 100mcg Inhaler',
        sku: 'SALB-100-INH',
        description: 'Bronchodilator for asthma and COPD',
        category: 'Respiratory',
        manufacturer: 'RespiraCare Pharma',
        prescription: true,
        unit: 'pieces',
        barcode: '5012345678910',
        status: 'active'
    },
    {
        name: 'Diclofenac 50mg Tablets',
        sku: 'DICL-50-TAB',
        description: 'NSAID for pain and inflammation',
        category: 'Pain Relief',
        manufacturer: 'AntiInflam Corp',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678911',
        status: 'active'
    },
    {
        name: 'Multivitamin Daily Tablets',
        sku: 'MULTI-DAILY-TAB',
        description: 'Complete daily vitamin and mineral supplement',
        category: 'Vitamins & Supplements',
        manufacturer: 'WellnessVita Inc',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678912',
        status: 'active'
    },
    {
        name: 'Ciprofloxacin 500mg Tablets',
        sku: 'CIPRO-500-TAB',
        description: 'Fluoroquinolone antibiotic for bacterial infections',
        category: 'Antibiotics',
        manufacturer: 'AntiBio Pharma',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678913',
        status: 'active'
    },
    {
        name: 'Loratadine 10mg Tablets',
        sku: 'LORA-10-TAB',
        description: 'Non-drowsy antihistamine for allergies',
        category: 'Antihistamines',
        manufacturer: 'AllergyFree Pharma',
        prescription: false,
        unit: 'tablets',
        barcode: '5012345678914',
        status: 'active'
    },
    {
        name: 'Atorvastatin 10mg Tablets',
        sku: 'ATOR-10-TAB',
        description: 'Statin for cholesterol management',
        category: 'Cardiovascular',
        manufacturer: 'CardioHealth Pharma',
        prescription: true,
        unit: 'tablets',
        barcode: '5012345678915',
        status: 'active'
    }
];

async function seedProducts() {
    try {
        console.log('🌱 Starting product seeding...\n');

        let successCount = 0;
        let skipCount = 0;

        for (const productData of sampleProducts) {
            try {
                // Check if product already exists
                const existingProduct = await Product.findOne({ sku: productData.sku });
                
                if (existingProduct) {
                    console.log(`⚠️  Product already exists: ${productData.name} (${productData.sku})`);
                    skipCount++;
                    continue;
                }

                // Create product
                const product = new Product(productData);
                await product.save();

                const prescriptionBadge = productData.prescription ? '🔒' : '✓';
                console.log(`✅ ${prescriptionBadge} Added: ${productData.name} (${productData.sku})`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error adding ${productData.name}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 PRODUCT SEEDING SUMMARY');
        console.log('='.repeat(70));
        console.log(`✅ Successfully added: ${successCount} products`);
        console.log(`⚠️  Already existed: ${skipCount} products`);
        
        const totalProducts = await Product.countDocuments();
        console.log(`📦 Total products in database: ${totalProducts}`);

        console.log('\n✨ Product seeding completed!');

    } catch (error) {
        console.error('❌ Fatal error during seeding:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding
seedProducts();
