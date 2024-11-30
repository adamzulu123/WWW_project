const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database');
const {register} = require('../controllers/registerController')
console.log('Login register:', register);

const router = express.Router(); //tworze register router do przekazywania routes i potem w serwerze trzeba go po odpowiednia sciezkę podpiąc 

// Obsługa rejestracji
router.post('/register', register);

module.exports = router;