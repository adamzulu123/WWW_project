const express = require('express');
const {logout, change_password, user_account_details, delete_account} = require('../controllers/userController');
const loadPaymentMethods = require('../middleware/loadPaymentMethods'); 

const router = express.Router();

// Dodajemy middleware loadPaymentMethods przed trasą user-account, aby metody płatności były załadowane przed renderowaniem strony
//i potem juz kontrollery moga korzystac z res.locals.paymentMethods które zostały ustawione przed nasz middleware 
//router.use(loadPaymentMethods); // Zastosowanie middleware dla wszystkich tras w tym routerze
router.get('/user-account',loadPaymentMethods, user_account_details);

router.post('/logout', logout);
router.post('/change_password', loadPaymentMethods, change_password);
router.post('/delete', delete_account);


module.exports = router;

