const bcrypt = require('bcrypt');
const pool = require('../database'); 
const { unsubscribe } = require('../routes/register');

//wylogowanie
const logout = async (req, res) => {
    req.session.destroy(err => { 
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Server error while trying to logout');
        }
        console.log('Session after logout:', req.session);
        res.render('LogIn', {
            logoutDeleteInfo: 'You successfully logout!',
            messageType: 'success'
        } );
    });
};

//zmiana hasła 
const change_password = async (req, res) =>{
    const {newPassword} = req.body; 
    
    const user = req.session.user;

    if(!user.id){
        return res.render('UserAccount', {
            changePassInfo: 'User is not authenticated.',
            messageType: 'danger'
        });
    }

    if(!newPassword | newPassword.trim() === ''){
        return res.render('UserAccount', {
            changePassInfo: 'New password cannot be null!',
            messageType: 'danger'
        });
    }

    try{
        const salt = await bcrypt.genSalt(10);
        const bcryptednewpass = await bcrypt.hash(newPassword, salt);

        await pool.query(`UPDATE Users SET password = ? WHERE id= ?`, [bcryptednewpass, user.id]);

        res.render('UserAccount', { 
            changePassInfo: 'Password changed successfully!',
            messageType: 'success',
            user
        });

    }catch(err){
        console.log(err); 
        res.status(500).send('Server change password error');
    }
};

//wyswietlanie danych 
const user_account_details = async (req, res) => {
    if (!req.session.loggedin || !req.session.user) {
        return res.redirect('/login'); 
    }
    //korzystamy z danych ustawiony przed middleware!!!!! 
    const paymentMethods = res.locals.paymentMethods;

    res.render('UserAccount', {
        user: req.session.user, 
        paymentMethods: paymentMethods,     
        changePassInfo: null,        
        messageType: null,           
    });
};

//usuwanie konta
const delete_account = async (req, res) =>{
    if (!req.session.loggedin || !req.session.user) {
        return res.redirect('/login');
    }

    try{
        const [results] = await pool.query(`DELETE FROM Users WHERE id = ?`, [req.session.user.id]);
        console.log(results); //sprawdzanie czy usuwanie sie powiodło 

        req.session.destroy(err =>{
            if(err){
                console.error('Error destroying session after account deletion:', err);
                return res.status(500).send('Server error while trying to delete account');
            }
            console.log('Session after delete:', req.session);
            res.render('LogIn', {
                logoutDeleteInfo: 'Account deleted successfully!',
                messageType: 'warning'
            });

        });

    }catch(err){
        console.log('Delete error', err);
        res.status(500).send('Server error while trying to delete account');
    }
}


module.exports = { logout, change_password, user_account_details, delete_account};


