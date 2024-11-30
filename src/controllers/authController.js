const bcrypt = require('bcryptjs');
const pool = require('../database');


const login = async (req, res) =>{
    const {email, password, account_type} = req.body; 

    //sprawdzamy czy wszystko podane 
    if (!email || !password || !account_type) {
        return res.status(400).render('LogIn', { 
            loginError: 'Email, password, and account type are required',
            registerError: null
        });
    }

    try{
        const query = `SELECT * FROM Users WHERE email = ? AND account_type = ?`;
        const query_values = [email, account_type];
        const [results] = await pool.query(query, query_values); 
        console.log(results); //sprawdzenie zwracanych danych 

        if(results.length > 0){
            const user = results[0]; //pobieramy uzytkownika z wyników

            //porównujemy hasło podane przez uzytkownika z tym co jest zaszyfrowane w bazie danych 
            const passMatch = await bcrypt.compare(password, user.password); 

            if(passMatch){
                req.session.loggedin = true;
                req.session.email = email;
                console.log('Session:', req.session); 
                res.redirect('/');
            }else{
                //niepoprawne dane podane 
                res.render('LogIn', { 
                    loginError: 'Invalid login credentials',
                    registerError: null
                 });
            }
        } else{
            //niepoprawne dane podane 
            res.render('LogIn', {
                loginError: 'Invalid login credentials',
                registerError: null
            });
        }

    }catch(err){
        console.error("Error during login", err);
        res.status(500).send("Server error")
    }
};


module.exports = {login};