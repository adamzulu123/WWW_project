const PaymentMethod  = require('../models/PaymentMethods');

/*
ten middleware jest odpowiedzialny za ładowanie danych dotycznacych metod płatnosci na stronach które tego wymagaja. 
kolejnosc rejestrowania kontrolerów na ma znaczenia, bo potem dzieki next wywołuje sie je w odpowiedniej kolejnosci na danej trasie. 
*/
const loadPaymentMethods = async (req, res, next) => {
    try {
        const user = req.session.user;

        if (!user || !user.id) {
            return next(); // jeśli użytkownik nie jest zalogowany, przejdź do następnego middleware lub kotrolera na danej trasie 
        }

        const user_id = user.id;

        //const [paymentMethods] = await pool.query('SELECT * FROM PaymentMethods WHERE user_id = ?', [user_id]);
        const paymentMethods = await PaymentMethod.findAll({
            where: {user_id},
        });

        res.locals.paymentMethods = paymentMethods || [];  // Umieszczamy metody płatności w res.locals

        next(); // Przechodzimy do następnego middleware lub kontrolera
    } catch (err) {
        console.error(err);
        res.status(500).send('Middleware error', err);
    }
};

module.exports = loadPaymentMethods;
