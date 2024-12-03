const pool = require('../database'); 

const addPaymentMethod = async (req, res) => {
    try{
        const { paymentType, cardholderName, cardNumber, cvc, expirationDate, paypalFullname, paypalEmail, paypalPhone } = req.body;

        const user = req.session.user;
        const user_id = user.id;
    
        //checking if payment method already exists
        let checkQuery = ``;
        let checkQueryValues = []; 

        if (paymentType === 'credit-card'){
            checkQuery = `SELECT COUNT(*) AS count FROM PaymentMethods WHERE card_number = ?`;
            checkQueryValues = [cardNumber];
        }
        else if (paymentType === 'paypal'){
            checkQuery = `SELECT COUNT(*) AS count FROM PaymentMethods WHERE paypal_email = ?`;
            checkQueryValues = [paypalEmail];
        }
        else{
            return res.render('UserAccount', {
                addPayment: 'Invalid payment type selected', 
                messageTypePayment: 'danger',
                user
            });
        }

        const [checkResult] = await pool.query(checkQuery, checkQueryValues);
        console.log("check result query: ", checkResult)

        if (checkResult[0].count > 0) {
            return res.render('UserAccount', {
                addPayment: `This ${paymentType} is already in use!`,
                messageTypePayment: 'danger',
                user
            });
        }
        
        //adding to database     
        let query = ``;
        let queryValues = []; 

        if (paymentType === 'credit-card'){
            query = `INSERT INTO PaymentMethods (user_id, payment_type, cardholder_name, card_number, cvc, expiration_date)
                    VALUES (?, ?, ?, ?, ?, ?)`;
        queryValues = [user_id, paymentType, cardholderName, cardNumber, cvc, expirationDate];

        }
        else if (paymentType === 'paypal'){
            query = `INSERT INTO PaymentMethods (user_id, payment_type, paypal_fullname, paypal_email, paypal_phone)
                    VALUES (?, ?, ?, ?, ?)`;
            queryValues = [user_id, paymentType, paypalFullname, paypalEmail, paypalPhone];
        }
        else{
            return res.render('UserAccount', {
                addPayment: 'Invalid payment type selected 2', 
                messageTypePayment: 'danger',
                user
            });
        }

        //adding selected type to database 
        const [results] = await pool.query(query, queryValues); 
        console.log(results); 

        //aktualizowanie danych 
        const [paymentMethods] = await pool.query('SELECT * FROM PaymentMethods WHERE user_id = ?', [user_id]);

        res.render('UserAccount', {
            addPayment: 'Payment method sucessfully added', 
            messageTypePayment: 'success',
            user,
            paymentMethods: paymentMethods
        });

    }catch(err){
        console.log(err);
        res.status(500).send('Server error while adding new payment method');
    }
};

//removing payment Methods 
const deletePaymentMethod = async (req, res) =>{
    try{
        const { method_id } = req.body;
        const user = req.session.user;
        const user_id = user.id;

        const [delete_result] = await pool.query(`DELETE FROM PaymentMethods WHERE id = ? AND user_id = ?`, [method_id ,user_id]);
        console.log(delete_result); 

        const [paymentMethods] = await pool.query('SELECT * FROM PaymentMethods WHERE user_id = ?', [user_id]);

        res.render('UserAccount', {
            addPayment: 'Payment method sucessfully removed', 
            messageTypePayment: 'warning',
            user, 
            paymentMethods: paymentMethods
        })

    }catch(err){
        console.log(err);
        res.status(500).send("Error while removing payment method", err); 
    }
};



module.exports = {addPaymentMethod, deletePaymentMethod};