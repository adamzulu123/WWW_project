const express = require('express');
const {addPaymentMethod, deletePaymentMethod} = require('../controllers/paymentController');
const loadPaymentMethods = require('../middleware/loadPaymentMethods');

const router = express.Router();


router.post('/add-payment',loadPaymentMethods, addPaymentMethod);
router.post('/remove-payment',loadPaymentMethods,  deletePaymentMethod);

module.exports = router;



