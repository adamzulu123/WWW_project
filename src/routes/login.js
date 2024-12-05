const express = require('express');
const {login} = require('../controllers/authController')

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('LogIn'); 
});

router.post('/login', login);

module.exports = router; 






