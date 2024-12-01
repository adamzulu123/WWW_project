const express = require('express');
const {logout, change_password} = require('../controllers/userController');

const router = express.Router();

router.get('/user-account', (req, res)=>{
    res.render('UserAccount'); 
})

router.post('/logout', logout);
router.post('/change_password', change_password);

module.exports = router;

