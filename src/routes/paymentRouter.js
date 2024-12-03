const express = require('express');
const {addPaymentMethod, deletePaymentMethod} = require('../controllers/paymentController');
const loadPaymentMethods = require('../middleware/loadPaymentMethods');

const router = express.Router();

router.use(loadPaymentMethods);

router.post('/add-payment', addPaymentMethod);
router.post('/remove-payment', deletePaymentMethod);

module.exports = router;



