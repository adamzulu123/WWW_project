const bcrypt = require('bcrypt');
const pool = require('../database'); 
const { unsubscribe } = require('../routes/register');

const logout = async (req, res) => {
    req.session.destroy(err => { 
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Server error while trying to logout');
        }
        console.log('Session after logout:', req.session);
        res.render('LogIn');
    });
};

const change_password = async (req, res) =>{
    const {newPassword} = req.body; 

    const userID = req.session.user.id; 

    if(!userID){
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

        await pool.query(`UPDATE Users SET password = ? WHERE id= ?`, [bcryptednewpass, userID]);

        res.render('UserAccount', { 
            changePassInfo: 'Password changed successfully!',
            messageType: 'success'  
        });

    }catch(err){
        console.log(err); 
        res.status(500).send('Server change password error');
    }

};


module.exports = { logout, change_password };




