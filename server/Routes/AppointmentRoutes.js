const express = require("express");
const router = express.Router();
const AppointmentController = require("../Controllers/AppointmentController");

router.get("/", AppointmentController.getAllAppointments);
router.get("/report/pdf", AppointmentController.generatePDFReport);
router.get("/:id/pdf", AppointmentController.generateIndividualPDF);
router.post("/", AppointmentController.addAppointment);
router.get("/:id", AppointmentController.getById);
router.put("/:id", AppointmentController.updateAppointment);
router.delete("/:id", AppointmentController.deleteAppointment);

module.exports = router;
