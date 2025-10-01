const Appointment = require("../Model/AppointmentModel");
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Get appointments by doctor ID
const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        const appointments = await Appointment.find({ doctorId })
            .sort({ date: 1, time: 1 }); // Sort by date and time in ascending order

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ 
                message: `No appointments found for doctor with ID: ${doctorId}` 
            });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ 
            message: "Error fetching doctor appointments", 
            error: error.message 
        });
    }
};

// Get latest appointments (most recent 5)
const getLatestAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .sort({ createdAt: -1, date: -1 }) // Sort by creation time and date in descending order
            .limit(5); // Get latest 5 appointments

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching latest appointments:', error);
        res.status(500).json({ 
            message: "Error fetching latest appointments", 
            error: error.message 
        });
    }
};

// Get all appointments with search
const getAllAppointments = async (req, res, next) => {
    try {
        let query = {};
        
        // Search by patient name if search parameter exists
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }
        
        const appointments = await Appointment.find(query);
        
        if (!appointments) {
            return res.status(404).json({ message: "No appointments found" });
        }
        
        return res.status(200).json({ appointments });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching appointments" });
    }
};

// Generate PDF report
const generatePDFReport = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        
        // Create a new PDF document
        const doc = new PDFDocument({
            margin: 30,
            size: 'A4',
            layout: 'landscape'
        });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=appointments.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('Appointments Report', { align: 'center' });
        doc.moveDown();

        // Table configuration
        const tableTop = 150;
        const columnSpacing = 60;
        let currentTop = tableTop;

        // Define columns and their widths
        const columns = {
            name: { x: 50, width: 100, title: 'Patient Name' },
            contact: { x: 150, width: 100, title: 'Contact' },
            age: { x: 250, width: 40, title: 'Age' },
            gender: { x: 290, width: 60, title: 'Gender' },
            doctor: { x: 350, width: 100, title: 'Doctor' },
            date: { x: 450, width: 80, title: 'Date' },
            time: { x: 530, width: 60, title: 'Time' },
            status: { x: 590, width: 80, title: 'Status' },
            reason: { x: 670, width: 100, title: 'Reason' }
        };

        // Draw table header
        doc.fontSize(10).font('Helvetica-Bold');
        Object.entries(columns).forEach(([key, column]) => {
            doc.text(column.title, column.x, currentTop, {
                width: column.width,
                align: 'left'
            });
        });

        // Draw header line
        currentTop += 20;
        doc.moveTo(50, currentTop).lineTo(770, currentTop).stroke();
        currentTop += 10;

        // Draw table rows
        doc.font('Helvetica');
        appointments.forEach((apt, index) => {
            // Check if we need a new page
            if (currentTop > 500) { // A4 landscape height minus margin
                doc.addPage();
                currentTop = 50;
            }

            // Draw row data
            doc.text(apt.name || '', columns.name.x, currentTop, { width: columns.name.width });
            doc.text(apt.contact || '', columns.contact.x, currentTop, { width: columns.contact.width });
            doc.text(apt.age?.toString() || '', columns.age.x, currentTop, { width: columns.age.width });
            doc.text(apt.gender || '', columns.gender.x, currentTop, { width: columns.gender.width });
            doc.text(apt.doctor || '', columns.doctor.x, currentTop, { width: columns.doctor.width });
            doc.text(new Date(apt.date).toLocaleDateString() || '', columns.date.x, currentTop, { width: columns.date.width });
            doc.text(apt.time || '', columns.time.x, currentTop, { width: columns.time.width });
            doc.text(apt.status || 'N/A', columns.status.x, currentTop, { width: columns.status.width });
            doc.text(apt.reason || '', columns.reason.x, currentTop, { width: columns.reason.width });

            // Draw row line
            currentTop += 20;
            doc.moveTo(50, currentTop).lineTo(770, currentTop).stroke();
            currentTop += 10;
        });

        // Add footer with date
        doc.fontSize(8)
           .text(
               `Report generated on ${new Date().toLocaleString()}`,
               50,
               doc.page.height - 50,
               { align: 'center' }
           );
        
        // Finalize the PDF
        doc.end();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error generating PDF" });
    }
};

// Add new appointment
const addAppointment = async (req, res, next) => {
    const { name, address, contact, age, gender, doctor, doctorId, date, time, reason } = req.body;

    let appointment;
    try {
        appointment = new Appointment({
            name, address, contact, age, gender, doctor, doctorId, date, time, reason
        });
        await appointment.save();
    } catch (err) {
        console.log(err);
    }

    if (!appointment) {
        return res.status(404).json({ message: "Unable to add appointment" });
    }

    return res.status(200).json({ appointment });
};

// Get appointment by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let appointment;

    try {
        appointment = await Appointment.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({ appointment });
};

// Update appointment
const updateAppointment = async (req, res, next) => {
    const id = req.params.id;
    const { name, address, contact, age, gender, doctor, date, time, reason, status } = req.body;

    let appointment;
    try {
        appointment = await Appointment.findByIdAndUpdate(id, {
            name, address, contact, age, gender, doctor, date, time, reason, status
        }, { new: true });
    } catch (err) {
        console.log(err);
    }

    if (!appointment) {
        return res.status(404).json({ message: "Unable to update appointment" });
    }

    return res.status(200).json({ appointment });
};

// Delete appointment
const deleteAppointment = async (req, res, next) => {
    const id = req.params.id;
    let appointment;

    try {
        appointment = await Appointment.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!appointment) {
        return res.status(404).json({ message: "Unable to delete appointment" });
    }

    return res.status(200).json({ appointment });
};

// Generate individual appointment PDF
// Generate individual PDF report
const generateIndividualPDF = async (req, res) => {
    try {
        const id = req.params.id;
        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Create a new PDF document
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=appointment-${id}.pdf`);

        // Create a write stream
        const stream = doc.pipe(res);

        // Add hospital logo/header
        doc.fontSize(24).text('Hospital Management System', { align: 'center' });
        doc.moveDown();
        
        // Add blue line under header
        doc.strokeColor('#000066')
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        
        doc.moveDown();
        doc.fontSize(18).text('Appointment Details', { align: 'center' });
        doc.moveDown();

        // Function to add a field with proper formatting
        const addField = (label, value) => {
            doc.fontSize(12);
            doc.font('Helvetica-Bold').text(label + ': ', { continued: true });
            doc.font('Helvetica').text(value || 'N/A');
            doc.moveDown(0.5);
        };

        // Add appointment details
        addField('Patient Name', appointment.name);
        addField('Contact Number', appointment.contact);
        addField('Age', appointment.age);
        addField('Gender', appointment.gender);
        addField('Doctor', appointment.doctor);
        addField('Date', new Date(appointment.date).toLocaleDateString());
        addField('Time', appointment.time);
        addField('Status', appointment.status || 'N/A');

        // Add reason for visit in a box
        doc.moveDown()
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Reason for Visit:')
           .moveDown(0.5);

        // Draw a box for the reason
        const reasonY = doc.y;
        doc.rect(50, reasonY, 500, 100)
           .strokeColor('#000066')
           .stroke();
        
        doc.font('Helvetica')
           .text(appointment.reason || 'N/A', 60, reasonY + 10, {
               width: 480,
               align: 'left'
           });

        // Add footer with generation time
        doc.moveDown(2)
           .fontSize(10)
           .font('Helvetica-Oblique')
           .fillColor('#666666')
           .text(
               `Generated on ${new Date().toLocaleString()}`,
               50,
               doc.page.height - 50,
               { align: 'center' }
           );

        // Finalize the PDF
        doc.end();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error generating PDF" });
    }
};

module.exports = {
    getAllAppointments,
    getLatestAppointments,
    addAppointment,
    getById,
    updateAppointment,
    deleteAppointment,
    generatePDFReport,
    generateIndividualPDF,
    getAppointmentsByDoctor
};
