const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database');
const {login} = require('../controllers/authController')
console.log('Login function:', login);

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('LogIn', { loginError: null }); 
});

router.post('/login', login);

module.exports = router; 






