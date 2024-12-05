const bcrypt = require('bcryptjs');
const User = require('../models/Users');

const register = async (req, res) => {
    const {first_name, last_name, age, email, password, account_type} = req.body;

    //sprawdzamy czy wszystkie pola podane 
    if (!first_name || !last_name || !age || !email || !password || !account_type){
        return res.render('LogIn', {
            registerError: 'All fields are required',
            loginError: null
        })
    }

    //sprawdzamy czy uzytkownik ma ponad 18 lat
    if (parseInt(age) < 18) {
        return res.render('LogIn', { 
            registerError: 'You must be at least 18 years old to register',
            loginError: null
        });
    }

    try{ 
        /*   
        const checkQuery = `SELECT * FROM Users WHERE email = ?`
        const result = await pool.query(checkQuery, [email]);
        const rows = result[0];
    
        if (rows && rows.length > 0) { //najpierw sprawdzamy czy nie jest undefined a potem czy juz nie istnieje taki uzytkownik 
        */
        const existingUser = await User.findOne({
            where:{
                email: email,
            },
        });
    
        if (existingUser){
            return res.render('LogIn', { 
                registerError: 'Email is already taken',
                loginError: null
            });
        }

        //szyfrowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        /*
        const query = `INSERT INTO Users (first_name, last_name, age, email, password, account_type) VALUES(?, ?, ?, ?, ?, ?)`;
        const query_values = [first_name, last_name, age, email, bcryptedpass, account_type];

        await pool.query(query, query_values);
        */

        //tworzenie nowego uzytkownika 
        await User.create({
            first_name,
            last_name,
            age,
            email,
            password: hashedPassword,
            account_type,
        });

        // Przekierowanie do strony logowania
        res.redirect('/login');

    }catch(err){
        console.error('Error during registration:', err);
        res.status(500).send('Server error');
    }
};

module.exports = {register};






