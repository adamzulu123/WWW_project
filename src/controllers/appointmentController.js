const { Appointment, User, UserAppointment, PaymentMethod } = require('../models');

//domyslnie pusta strona bez spotkań z zadnej kategorii 
const getEmptyServices = (req, res) => {
    res.render('services', {
        category: null, 
        appointments: [], 
    });
};

//ładowanie spotkań z danej kategorii 
const getAppointmentsByCategory = async (req, res) =>{
    try{ 
        const { category } = req.params;

        const appointments = await Appointment.findAll({
            where: {
                type: category,
                status: 'available',
            },
            order: [['date', 'ASC']] //sortowanie spotkań po dacie
        });

        res.json(appointments); //przesyłamy do frontend dane w formacie json 

    } catch(err){
        console.log(err);
        res.status(500).send('Server Error while meetings loading')
    }
};

//bukowanie spotkań przez uzytkownika
const bookAppointment = async (req, res) =>{
    try{
        //id pobieramy z sesji poniewaz juz i tak podacza logowania zostało ono tam zapisane 
        const user = req.session.user;
        const user_id = user.id;

        const {appointmentId} = req.body;

        console.log(`Booking appointment for user ${user_id}, appointment ID: ${appointmentId}`);  

        //findByPk to metoda która umozliwia otrzymanie jednego rekordu z tabeli na podstawie primary key 
        const appointment = await Appointment.findByPk(appointmentId);

        if(!appointment){
            console.log('Appointment not found'); 
            return res.json({ success: false, message: 'Appointment not found' });
        }
        //pomimo ze takie spotkania i tak nie sa wyswietlane to i tak sprawdzam na wszelki 
        if (appointment.available_spots <= 0) {
            console.log('No available spots for this appointment');
            return res.json({ success: false, message: 'No available spots' });
        }

        //sprawdzamy czy uzytkownik juz zarezerwował to spotkanie 
        const existingReservation = await UserAppointment.findOne({
            where:{
                user_id: user_id,
                appointment_id: appointmentId
            }
        });
        if(existingReservation){
            console.log('You have already booked this meeting!');
            return res.json({success: false, message: 'You have already booked this meeting!'});
        }

        //rezerwujemy spotkanie tworzac rekord w tabeli UserAppointment 
        await UserAppointment.create({
            user_id: user_id,
            appointment_id: appointmentId
        });

        //dekrementujemy liczbe dostepnych miejsc dostepnych o 1!
        await appointment.decrement('available_spots', { by: 1 });

        //jesli po bookowaniu 0 miejsc to zmieniamy stan an not_available 
        if (appointment.available_spots == 0){
            await appointment.update({status: 'not_available'});
        }

        console.log('Appointment successfully booked!');
        res.json({success: true, message: 'Appointment successufully booked!'});
    
    
    }catch(err){
        console.log(err);
        res.status(500).send('Server Error while trying to book meeting');

    }

};


//załadka meetings ładowanie strony za pomoca szablony ejs 
const getUserMeetingsPage = async (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.redirect('/login'); 
    }

    const user_id = user.id;

    // Wczytanie spotkań użytkownika z bazy danych
    const userWithAppointments = await User.findOne({
        where: { id: user_id },
        include: [{
            model: Appointment,
            as: 'appointments', 
            through: { attributes: ['is_completed', 'is_paid'] }, // Wykluczamy dane z tabeli pośredniej
            required: true, // Zapewnia, że tylko użytkownicy z przypisanymi spotkaniami będą zwróceni
        }],
    });

    // Transformacja danych na odpowiednie wartości
    const transformAppointments = userWithAppointments.appointments.map(appointment => {
        const status = appointment.UserAppointment.is_completed ? 'Ended' : 'Pending';
        const paymentStatus = appointment.UserAppointment.is_paid ? 'Paid' : 'Not Paid';

        return {
            ...appointment.dataValues,   // Kopiujemy dane z Appointment
            status,                      //dodajemy nowe pola
            paymentStatus,               
        };
    });
    
    res.render('Meetings', { appointments: transformAppointments });
};



//ładowanie danych płatności 
const loadPaymentDetails = async (req, res) =>{
    try{
        const user = req.session.user; //tylko zalogowany user ma do tego dostep wiec nie przejmujemy sie błedami tutaj (ogarniete przez fetch -Meeting.js)
        const user_id = user.id;
        const user_firstName = user.firstName;
        const user_lastName = user.lastName;
        const { appointmentId } = req.query;

        //pobieramy dane o spotkaniu 
        const userWithAppointments = await User.findOne({
            where: { id: user_id },
            include: [{
                model: Appointment,
                as: 'appointments',  
                through: {
                    attributes: ['is_completed', 'is_paid'],  
                },
                where: { id: appointmentId },  
                required: true, 
            },
        ],
        });

        //szukanie paymentMethods dodanych do konta uzytkownika 
        const paymentMethods = await PaymentMethod.findAll({
            where: { user_id: user_id }, 
            attributes: [
                'id',
                'payment_type',
                'card_number',
                'cardholder_name',
                'expiration_date',
                'paypal_email'
            ],
        });
        

        if (!userWithAppointments) {
            return res.status(404).json({ success: false, message: 'No pending appointment found' });
        }

        const appointment = userWithAppointments.appointments[0]; //wybieramy jedna wizyte z tablicy (ale i tak jest jedna bo uzywamy findOne) -tak dla pewnosci 
        
        res.json({
            success: true,
            appointment: {
                id: appointment.id,
                date: appointment.date,
                doctor_name: appointment.doctor_name,
                price: appointment.price,
                duration: appointment.duration,
                type: appointment.type,
            },
            //iterujemy po metodach płatnosci i method reprezentuje jeden obiekt metody płatnosci i gdzieki map mapujemy/dfiniujemy co obiekt ma zawierac 
            paymentMethods: paymentMethods.map(method => ({
                id: method.id,
                payment_type: method.payment_type,
                card_number: method.payment_type === 'credit-card' ? `**** **** **** ${method.card_number.slice(-4)}` : null,
                cardholder_name: method.cardholder_name,
                expiration_date: method.expiration_date,
                paypal_email: method.payment_type === 'paypal' ? method.paypal_email : null,
            })),
            firstName: user_firstName,
            lastName: user_lastName,
        });

    }catch(err){
        console.log(err);
        res.status(500).send("Server error while loading payment details  ");
    }

};


module.exports = {getEmptyServices, getAppointmentsByCategory, bookAppointment, loadPaymentDetails, getUserMeetingsPage};




