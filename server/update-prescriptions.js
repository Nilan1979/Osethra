const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Prescription = require('./Model/PrescriptionModel');
const Product = require('./Model/ProductModel');
const User = require('./Model/UserModel');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

const updatePrescriptions = async () => {
    try {
        console.log('\n🗑️  Clearing existing prescriptions...');
        await Prescription.deleteMany({});
        console.log('✅ Existing prescriptions cleared');

        // Get the doctor user
        console.log('\n🔍 Finding doctor...');
        const doctor = await User.findOne({ role: 'doctor' });
        
        if (!doctor) {
            console.error('❌ No doctor found in database. Please run seed-doctor.js first');
            process.exit(1);
        }
        
        console.log(`✅ Found doctor: ${doctor.name}`);

        // Get medication products
        console.log('\n🔍 Finding medication products...');
        const medications = await Product.find({ 
            category: 'Medications',
            status: 'active'
        }).limit(15);

        if (medications.length === 0) {
            console.error('❌ No medication products found. Please run seed-inventory.js first');
            process.exit(1);
        }

        console.log(`✅ Found ${medications.length} medication products`);

        // Patient data
        const patients = [
            { name: 'Amal Perera', id: new mongoose.Types.ObjectId(), age: 45, gender: 'Male' },
            { name: 'Nimal Silva', id: new mongoose.Types.ObjectId(), age: 58, gender: 'Male' },
            { name: 'Shalini Jayawardena', id: new mongoose.Types.ObjectId(), age: 32, gender: 'Female' },
            { name: 'Rohan Mendis', id: new mongoose.Types.ObjectId(), age: 28, gender: 'Male' },
            { name: 'Kumari Dissanayake', id: new mongoose.Types.ObjectId(), age: 52, gender: 'Female' },
            { name: 'Chaminda Fernando', id: new mongoose.Types.ObjectId(), age: 41, gender: 'Male' },
            { name: 'Dilani Wickramasinghe', id: new mongoose.Types.ObjectId(), age: 36, gender: 'Female' },
            { name: 'Prasad Gunasekara', id: new mongoose.Types.ObjectId(), age: 47, gender: 'Male' },
            { name: 'Malini Rajapaksa', id: new mongoose.Types.ObjectId(), age: 29, gender: 'Female' },
            { name: 'Sarath Bandara', id: new mongoose.Types.ObjectId(), age: 63, gender: 'Male' },
        ];

        // Prescription data
        const prescriptionData = [
            {
                patient: patients[0],
                diagnosis: 'Acute Respiratory Infection',
                medications: [
                    { product: medications[0], dosage: '500mg', frequency: '3 times daily', duration: '7 days', quantity: 21 },
                    { product: medications[1], dosage: '500mg', frequency: 'As needed for fever', duration: '5 days', quantity: 10 },
                ],
                status: 'pending',
                priority: 'normal',
                notes: 'Patient has mild fever and cough. Complete the full course of antibiotics.'
            },
            {
                patient: patients[1],
                diagnosis: 'Type 2 Diabetes Mellitus',
                medications: [
                    { product: medications[2], dosage: '500mg', frequency: '2 times daily', duration: '30 days', quantity: 60 },
                    { product: medications[3], dosage: '10mg', frequency: '1 at night', duration: '30 days', quantity: 30 },
                ],
                status: 'pending',
                priority: 'urgent',
                notes: 'Monitor blood sugar levels regularly. Take medication with meals.'
            },
            {
                patient: patients[2],
                diagnosis: 'Gastritis',
                medications: [
                    { product: medications[4], dosage: '20mg', frequency: '1 before breakfast', duration: '14 days', quantity: 14 },
                    { product: medications[5], dosage: '400mg', frequency: '3 times daily after meals', duration: '5 days', quantity: 15 },
                ],
                status: 'completed',
                priority: 'normal',
                notes: 'Avoid spicy foods and NSAIDs. Take medication on empty stomach.'
            },
            {
                patient: patients[3],
                diagnosis: 'Skin Infection',
                medications: [
                    { product: medications[6], dosage: '500mg', frequency: '4 times daily', duration: '7 days', quantity: 28 },
                    { product: medications[7], dosage: '10mg', frequency: '1 at night for itching', duration: '7 days', quantity: 7 },
                ],
                status: 'pending',
                priority: 'normal',
                notes: 'Keep affected area clean and dry. Complete antibiotic course.'
            },
            {
                patient: patients[4],
                diagnosis: 'Hypertension',
                medications: [
                    { product: medications[8], dosage: '50mg', frequency: '1 daily', duration: '30 days', quantity: 30 },
                    { product: medications[9], dosage: '75mg', frequency: '1 daily', duration: '30 days', quantity: 30 },
                    { product: medications[10], dosage: '40mg', frequency: '1 at night', duration: '30 days', quantity: 30 },
                ],
                status: 'pending',
                priority: 'urgent',
                notes: 'Monitor blood pressure daily. Low salt diet recommended.'
            },
            {
                patient: patients[5],
                diagnosis: 'Upper Respiratory Tract Infection',
                medications: [
                    { product: medications[11], dosage: '500mg', frequency: '1 daily', duration: '3 days', quantity: 3 },
                ],
                status: 'completed',
                priority: 'normal',
                notes: 'Short course antibiotic therapy completed successfully.'
            },
            {
                patient: patients[6],
                diagnosis: 'Allergic Rhinitis',
                medications: [
                    { product: medications[12], dosage: '10mg', frequency: '1 at night', duration: '10 days', quantity: 10 },
                    { product: medications[1], dosage: '500mg', frequency: 'As needed', duration: '5 days', quantity: 5 },
                ],
                status: 'completed',
                priority: 'normal',
                notes: 'Avoid allergen exposure. Continue treatment if symptoms persist.'
            },
            {
                patient: patients[7],
                diagnosis: 'Migraine',
                medications: [
                    { product: medications[5], dosage: '400mg', frequency: 'As needed', duration: '10 days', quantity: 10 },
                    { product: medications[1], dosage: '500mg', frequency: 'As needed', duration: '10 days', quantity: 10 },
                ],
                status: 'pending',
                priority: 'normal',
                notes: 'Take at onset of headache. Rest in dark, quiet room.'
            },
            {
                patient: patients[8],
                diagnosis: 'Urinary Tract Infection',
                medications: [
                    { product: medications[0], dosage: '500mg', frequency: '2 times daily', duration: '5 days', quantity: 10 },
                    { product: medications[1], dosage: '500mg', frequency: 'As needed for pain', duration: '3 days', quantity: 6 },
                ],
                status: 'completed',
                priority: 'normal',
                notes: 'Increase fluid intake. Complete antibiotic course.'
            },
            {
                patient: patients[9],
                diagnosis: 'Chronic Heart Disease',
                medications: [
                    { product: medications[9], dosage: '75mg', frequency: '1 daily', duration: '30 days', quantity: 30 },
                    { product: medications[8], dosage: '50mg', frequency: '1 daily', duration: '30 days', quantity: 30 },
                    { product: medications[10], dosage: '20mg', frequency: '1 at night', duration: '30 days', quantity: 30 },
                ],
                status: 'completed',
                priority: 'urgent',
                notes: 'Regular cardiac monitoring required. Follow-up in 2 weeks.'
            },
        ];

        console.log('\n📝 Creating new prescriptions...');
        
        const prescriptions = [];
        let prescriptionCounter = 1;

        for (const data of prescriptionData) {
            const now = new Date();
            const prescriptionDate = new Date(now);
            prescriptionDate.setDate(now.getDate() - Math.floor(Math.random() * 3)); // Random date within last 3 days

            // Generate prescription number
            const dateStr = prescriptionDate.toISOString().split('T')[0].replace(/-/g, '');
            const prescriptionNumber = `RX-${dateStr}-${String(prescriptionCounter).padStart(4, '0')}`;

            const prescription = {
                prescriptionNumber: prescriptionNumber,
                patient: {
                    id: data.patient.id,
                    name: data.patient.name,
                    age: data.patient.age,
                    gender: data.patient.gender
                },
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    specialization: doctor.specialization || 'General Physician',
                    licenseNumber: doctor.licenseNumber || 'LIC-12345'
                },
                medications: data.medications.map(med => ({
                    name: med.product.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    duration: med.duration,
                    quantity: med.quantity,
                    instructions: `Take ${med.frequency}. ${med.duration ? 'Duration: ' + med.duration : ''}`
                })),
                date: prescriptionDate,
                time: prescriptionDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                status: data.status,
                diagnosis: data.diagnosis,
                notes: data.notes,
                priority: data.priority
            };

            // If completed, add dispensed info
            if (data.status === 'completed') {
                const dispensedDate = new Date(prescriptionDate);
                dispensedDate.setHours(dispensedDate.getHours() + Math.floor(Math.random() * 4) + 1); // 1-5 hours later

                prescription.dispensedBy = {
                    id: new mongoose.Types.ObjectId(),
                    name: 'Pharmacist Admin'
                };
                prescription.dispensedAt = dispensedDate;
            }

            prescriptions.push(prescription);
            prescriptionCounter++;
        }

        // Insert prescriptions
        const createdPrescriptions = await Prescription.insertMany(prescriptions);
        
        console.log(`\n✅ Successfully created ${createdPrescriptions.length} prescriptions:`);
        
        const pending = createdPrescriptions.filter(p => p.status === 'pending').length;
        const completed = createdPrescriptions.filter(p => p.status === 'completed').length;
        
        console.log(`   - Pending: ${pending}`);
        console.log(`   - Completed: ${completed}`);
        
        console.log('\n📋 Prescription Summary:');
        createdPrescriptions.forEach((prescription, index) => {
            console.log(`\n${index + 1}. ${prescription.prescriptionNumber}`);
            console.log(`   Patient: ${prescription.patient.name}`);
            console.log(`   Diagnosis: ${prescription.diagnosis}`);
            console.log(`   Medications: ${prescription.medications.length}`);
            prescription.medications.forEach(med => {
                console.log(`      - ${med.name}: ${med.dosage}, ${med.frequency}`);
            });
            console.log(`   Status: ${prescription.status.toUpperCase()}`);
            console.log(`   Priority: ${prescription.priority}`);
        });

        console.log('\n✅ Prescription update completed successfully!\n');
        
        mongoose.connection.close();
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Error updating prescriptions:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

updatePrescriptions();
