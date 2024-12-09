const express = require('express');
const { getEmptyServices, getAppointmentsByCategory, bookAppointment, loadPaymentDetails, getUserMeetingsPage} = require('../controllers/appointmentController');

const router = express.Router();

// Domyślna strona "Services"
router.get('/services', getEmptyServices);

// Endpoint do wczytywania spotkań
router.get('/services/:category', getAppointmentsByCategory);

// endpoint do rezerwowania spotkań 
router.post('/book-appointment', bookAppointment);

//endpoint do storny Meetings 
router.get('/meetings', getUserMeetingsPage)

//endpoint do ładowania danych płatności 
router.get('/load-payment-details', loadPaymentDetails);

module.exports = router;



