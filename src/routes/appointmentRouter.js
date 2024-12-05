const express = require('express');
const { getEmptyServices, getAppointmentsByCategory, bookAppointment} = require('../controllers/appointmentController');

const router = express.Router();

// Domyślna strona "Services"
router.get('/services', getEmptyServices);

// Endpoint do wczytywania spotkań
router.get('/services/:category', getAppointmentsByCategory);

// endpoint do rezerwowania spotkań 
router.post('/book-appointment', bookAppointment);

module.exports = router;



