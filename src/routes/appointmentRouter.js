const express = require('express');
const { getEmptyServices, getAppointmentsByCategory } = require('../controllers/appointmentController');

const router = express.Router();

// Domyślna strona "Services"
router.get('/services', getEmptyServices);

// Endpoint do wczytywania spotkań
router.get('/services/:category', getAppointmentsByCategory);

module.exports = router;



