const express = require('express');
const {logout, change_password, user_account_details, delete_account} = require('../controllers/userController');

const router = express.Router();

router.get('/user-account', user_account_details);

router.post('/logout', logout);
router.post('/change_password', change_password);
router.post('/delete', delete_account);

module.exports = router;

