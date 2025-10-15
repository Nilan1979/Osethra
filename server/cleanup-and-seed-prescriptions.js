require('dotenv').config();
const mongoose = require('mongoose');
const Prescription = require('./Model/PrescriptionModel');
const Product = require('./Model/ProductModel');
const User = require('./Model/UserModel');

async function cleanupAndSeedPrescriptions() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Step 1: Check existing prescriptions
        console.log('=== STEP 1: Checking Existing Prescriptions ===');
        const existingPrescriptions = await Prescription.countDocuments();
        console.log(`Found ${existingPrescriptions} existing prescriptions`);

        if (existingPrescriptions > 0) {
            console.log('\n🗑️  Cleaning up existing prescriptions...');
            const deleteResult = await Prescription.deleteMany({});
            console.log(`✅ Deleted ${deleteResult.deletedCount} prescriptions`);
        }
        console.log('');

        // Step 2: Get available products (medications)
        console.log('=== STEP 2: Fetching Available Products ===');
        const products = await Product.find({ status: 'active' }).limit(15);
        console.log(`Found ${products.length} active products to use as medications`);
        
        if (products.length === 0) {
            console.log('❌ No products found. Please seed products first.');
            return;
        }

        // Display available products
        console.log('\nAvailable medications:');
        products.slice(0, 10).forEach((p, idx) => {
            console.log(`  ${idx + 1}. ${p.name} (${p.category})`);
        });
        console.log('');

        // Step 3: Get a doctor user
        console.log('=== STEP 3: Finding Doctor User ===');
        let doctor = await User.findOne({ role: 'doctor' });
        
        if (!doctor) {
            console.log('⚠️  No doctor found. Creating a sample doctor...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('doctor123', salt);
            
            doctor = await User.create({
                name: 'Dr. Sarah Johnson',
                email: 'dr.sarah@hospital.com',
                password: hashedPassword,
                role: 'doctor',
                contactNo: '+1-555-0101',
                address: '123 Medical Center, City'
            });
            console.log(`✅ Created doctor: ${doctor.name}`);
        } else {
            console.log(`✅ Found doctor: ${doctor.name}`);
        }
        console.log('');

        // Step 4: Create sample prescriptions
        console.log('=== STEP 4: Creating Sample Prescriptions ===');
        
        const samplePatients = [
            {
                id: new mongoose.Types.ObjectId(),
                name: 'Kumara Perera',
                age: 45,
                gender: 'Male',
                contactNo: '+94-77-1234567'
            },
            {
                id: new mongoose.Types.ObjectId(),
                name: 'Nimalika Fernando',
                age: 32,
                gender: 'Female',
                contactNo: '+94-76-2345678'
            },
            {
                id: new mongoose.Types.ObjectId(),
                name: 'Chandana Silva',
                age: 58,
                gender: 'Male',
                contactNo: '+94-75-3456789'
            },
            {
                id: new mongoose.Types.ObjectId(),
                name: 'Sanduni Wijesinghe',
                age: 27,
                gender: 'Female',
                contactNo: '+94-71-4567890'
            },
            {
                id: new mongoose.Types.ObjectId(),
                name: 'Pradeep Jayasuriya',
                age: 51,
                gender: 'Male',
                contactNo: '+94-77-5678901'
            }
        ];

        const prescriptionsData = [
            {
                patient: samplePatients[0],
                diagnosis: 'Common Cold and Fever',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Paracetamol'))?.name || 'Paracetamol 500mg',
                        dosage: '500mg',
                        quantity: 20,
                        frequency: 'Three times daily',
                        duration: '5 days',
                        instructions: 'Take after meals'
                    },
                    {
                        name: products.find(p => p.name.includes('Cetirizine'))?.name || 'Cetirizine 10mg',
                        dosage: '10mg',
                        quantity: 10,
                        frequency: 'Once daily at bedtime',
                        duration: '10 days',
                        instructions: 'May cause drowsiness'
                    }
                ],
                status: 'pending',
                priority: 'normal',
                notes: 'Patient reported symptoms for 2 days'
            },
            {
                patient: samplePatients[1],
                diagnosis: 'Bacterial Infection',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Amoxicillin'))?.name || 'Amoxicillin 500mg',
                        dosage: '500mg',
                        quantity: 21,
                        frequency: 'Three times daily',
                        duration: '7 days',
                        instructions: 'Complete the full course'
                    },
                    {
                        name: products.find(p => p.name.includes('Ibuprofen'))?.name || 'Ibuprofen 400mg',
                        dosage: '400mg',
                        quantity: 12,
                        frequency: 'Twice daily after meals',
                        duration: '6 days',
                        instructions: 'For pain and inflammation'
                    }
                ],
                status: 'pending',
                priority: 'urgent',
                notes: 'Patient allergic to penicillin alternatives'
            },
            {
                patient: samplePatients[2],
                diagnosis: 'Hypertension',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Amlodipine'))?.name || 'Amlodipine 5mg',
                        dosage: '5mg',
                        quantity: 30,
                        frequency: 'Once daily in the morning',
                        duration: '30 days',
                        instructions: 'Monitor blood pressure regularly'
                    },
                    {
                        name: products.find(p => p.name.includes('Aspirin'))?.name || 'Aspirin 75mg',
                        dosage: '75mg',
                        quantity: 30,
                        frequency: 'Once daily',
                        duration: '30 days',
                        instructions: 'Take with food'
                    }
                ],
                status: 'pending',
                priority: 'normal',
                followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                notes: 'Regular monthly prescription. Patient stable.'
            },
            {
                patient: samplePatients[3],
                diagnosis: 'Allergic Rhinitis',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Cetirizine'))?.name || 'Cetirizine 10mg',
                        dosage: '10mg',
                        quantity: 30,
                        frequency: 'Once daily',
                        duration: '30 days',
                        instructions: 'Best taken at night'
                    }
                ],
                status: 'pending',
                priority: 'normal',
                notes: 'Seasonal allergies'
            },
            {
                patient: samplePatients[4],
                diagnosis: 'Type 2 Diabetes',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Metformin'))?.name || 'Metformin 500mg',
                        dosage: '500mg',
                        quantity: 60,
                        frequency: 'Twice daily with meals',
                        duration: '30 days',
                        instructions: 'Monitor blood glucose levels'
                    },
                    {
                        name: products.find(p => p.name.includes('Vitamin'))?.name || 'Vitamin D3',
                        dosage: '1000 IU',
                        quantity: 30,
                        frequency: 'Once daily',
                        duration: '30 days',
                        instructions: 'Take in the morning'
                    }
                ],
                status: 'pending',
                priority: 'normal',
                followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                notes: 'Regular diabetes management. HbA1c checked.'
            },
            // Add a couple of completed prescriptions
            {
                patient: samplePatients[0],
                diagnosis: 'Headache',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Ibuprofen'))?.name || 'Ibuprofen 400mg',
                        dosage: '400mg',
                        quantity: 10,
                        frequency: 'As needed, max 3 times daily',
                        duration: '5 days',
                        instructions: 'Take with food'
                    }
                ],
                status: 'completed',
                priority: 'normal',
                notes: 'Follow-up not required',
                dispensedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                patient: samplePatients[1],
                diagnosis: 'Acid Reflux',
                medications: [
                    {
                        name: products.find(p => p.name.includes('Omeprazole'))?.name || 'Omeprazole 20mg',
                        dosage: '20mg',
                        quantity: 14,
                        frequency: 'Once daily before breakfast',
                        duration: '14 days',
                        instructions: 'Take 30 minutes before eating'
                    }
                ],
                status: 'completed',
                priority: 'normal',
                notes: 'Diet modification advised',
                dispensedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            }
        ];

        const createdPrescriptions = [];
        const now = new Date();

        for (let i = 0; i < prescriptionsData.length; i++) {
            const prescData = prescriptionsData[i];
            
            // Set date and time
            const prescDate = new Date(now - (i * 12 * 60 * 60 * 1000)); // Stagger by 12 hours
            const hours = prescDate.getHours().toString().padStart(2, '0');
            const minutes = prescDate.getMinutes().toString().padStart(2, '0');
            
            const prescription = await Prescription.create({
                patient: prescData.patient,
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    specialization: 'General Physician',
                    licenseNumber: 'MD-2024-001'
                },
                medications: prescData.medications,
                diagnosis: prescData.diagnosis,
                date: prescDate,
                time: `${hours}:${minutes}`,
                status: prescData.status,
                priority: prescData.priority,
                notes: prescData.notes,
                followUpDate: prescData.followUpDate,
                dispensedAt: prescData.dispensedAt
            });

            createdPrescriptions.push(prescription);
            console.log(`✅ Created prescription ${prescription.prescriptionNumber} for ${prescription.patient.name}`);
        }

        console.log(`\n✅ Successfully created ${createdPrescriptions.length} prescriptions`);

        // Summary
        console.log('\n=== SUMMARY ===');
        const pendingCount = createdPrescriptions.filter(p => p.status === 'pending').length;
        const completedCount = createdPrescriptions.filter(p => p.status === 'completed').length;
        const urgentCount = createdPrescriptions.filter(p => p.priority === 'urgent').length;
        
        console.log(`📊 Pending: ${pendingCount}`);
        console.log(`✅ Completed: ${completedCount}`);
        console.log(`🚨 Urgent: ${urgentCount}`);
        console.log(`👨‍⚕️ Doctor: ${doctor.name}`);
        console.log(`💊 Unique medications used: ${new Set(createdPrescriptions.flatMap(p => p.medications.map(m => m.name))).size}`);

        console.log('\n📋 Recent Prescriptions:');
        createdPrescriptions.slice(0, 5).forEach(p => {
            console.log(`  ${p.prescriptionNumber} - ${p.patient.name} (${p.status}) - ${p.medications.length} medications`);
        });

        console.log('\n✅ Prescription database cleanup and seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
    }
}

cleanupAndSeedPrescriptions();
