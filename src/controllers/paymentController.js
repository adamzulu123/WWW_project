const PaymentMethod  = require('../models/PaymentMethods');

const addPaymentMethod = async (req, res) => {
    try{
        const { paymentType, cardholderName, cardNumber, cvc, expirationDate, paypalFullname, paypalEmail, paypalPhone } = req.body;

        const user = req.session.user;
        const user_id = user.id;
        
        /*
        //checking if payment method already exists
        let checkQuery = ``;
        let checkQueryValues = []; 
        */

        // Walidacja typu płatności
        if (!paymentType || (paymentType !== 'credit-card' && paymentType !== 'paypal')) {
        return res.render('UserAccount', {
            addPayment: 'Invalid payment type selected', 
            messageTypePayment: 'danger',
            user
        });
        }

        let existingPaymentMethod = null;

        if (paymentType === 'credit-card'){
            //checkQuery = `SELECT COUNT(*) AS count FROM PaymentMethods WHERE card_number = ?`;
            //checkQueryValues = [cardNumber];
            existingPaymentMethod = await PaymentMethod.findOne({
                where: {
                    card_number: cardNumber,
                    user_id: user_id
                }
            });
        }
        else if (paymentType === 'paypal'){
            //checkQuery = `SELECT COUNT(*) AS count FROM PaymentMethods WHERE paypal_email = ?`;
            //chckQueryValues = [paypalEmail];
            existingPaymentMethod = await PaymentMethod.findOne({
                where: {
                    paypal_email: paypalEmail,
                    user_id: user_id
                }
            });
        }

        //if paymentMethod is already in use. 
        if (existingPaymentMethod) {
            return res.render('UserAccount', {
                addPayment: `This ${paymentType} is already in use!`,
                messageTypePayment: 'danger',
                user
            });
        }

        /*
        const [checkResult] = await pool.query(checkQuery, checkQueryValues);
        console.log("check result query: ", checkResult)

        if (checkResult[0].count > 0) {
            return res.render('UserAccount', {
                addPayment: `This ${paymentType} is already in use!`,
                messageTypePayment: 'danger',
                user
            });
        }
        */
        
        //let query = ``;
        //let queryValues = []; 
        let newPaymentMethod = null;

        if (paymentType === 'credit-card'){
            /*
            query = `INSERT INTO PaymentMethods (user_id, payment_type, cardholder_name, card_number, cvc, expiration_date)
                    VALUES (?, ?, ?, ?, ?, ?)`;
            queryValues = [user_id, paymentType, cardholderName, cardNumber, cvc, expirationDate];
            */
            
            newPaymentMethod = await PaymentMethod.create({
                user_id: user_id,
                payment_type: paymentType,
                cardholder_name: cardholderName,
                card_number: cardNumber,
                cvc: cvc,
                expiration_date: expirationDate
            });
        }
        else if (paymentType === 'paypal'){
            /*
            query = `INSERT INTO PaymentMethods (user_id, payment_type, paypal_fullname, paypal_email, paypal_phone)
                    VALUES (?, ?, ?, ?, ?)`;
            queryValues = [user_id, paymentType, paypalFullname, paypalEmail, paypalPhone];
            */

            newPaymentMethod = await PaymentMethod.create({
                user_id: user_id,
                payment_type: paymentType,
                paypal_fullname: paypalFullname,
                paypal_email: paypalEmail,
                paypal_phone: paypalPhone
            });
        }
        else{
            return res.render('UserAccount', {
                addPayment: 'Invalid payment type selected 2', 
                messageTypePayment: 'danger',
                user
            });
        }

        /*
        const [results] = await pool.query(query, queryValues); 
        console.log(results); 
        //aktualizowanie danych 
        const [paymentMethods] = await pool.query('SELECT * FROM PaymentMethods WHERE user_id = ?', [user_id]);
        */

        const paymentMethods = await PaymentMethod.findAll({
            where:{ user_id: user_id}
        });

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

        //const [delete_result] = await pool.query(`DELETE FROM PaymentMethods WHERE id = ? AND user_id = ?`, [method_id ,user_id]);
        //console.log(delete_result); 
        
        const deleteResult = await PaymentMethod.destroy({
            where: {
                id: method_id,
                user_id: user_id
            },
            /* Jakby w modelu było paranoid:true - to wtedy umozliwialibysmy soft delete, czyli rekord nie jest fizycznie usuwany z bazy danych. Zamiast tego ustawiana jest wartość w kolumnie deletedAt (domyślnie nazwa tej kolumny), wskazująca datę i czas usunięcia.
            Taki rekord jest niewidoczny dla zapytań Sequelize, chyba że użyjesz opcji paranoid: false.

            ale ja tego nie robie wiec nie musze pisać: force: true - w tej czesci aby usunac trwale rekord z bazy 
            */
        });

        if (deleteResult === 0){
            return res.render('UserAccount', {
                addPayment: 'Payment method not found or already removed',
                messageTypePayment: 'danger',
                user
            });
        }

        //const [paymentMethods] = await pool.query('SELECT * FROM PaymentMethods WHERE user_id = ?', [user_id]);

        const paymentMethods = await PaymentMethod.findAll({
            where:{ user_id: user_id}
        });

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