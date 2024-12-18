const { Appointment, User, UserAppointment, PaymentMethod } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment'); 


// SERVICES PAGE 


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
        const user = req.session.user;
        const user_id = user.id;
        const { category } = req.params;

        const appointments = await Appointment.findAll({
            where: {
                type: category,
                status: 'available',
            },
            order: [['date', 'ASC']] //sortowanie spotkań po dacie
        });

        for (let appointment of appointments) { //iterujemy po spotkaniach pobranych 
            const appointmentDate = moment(`${appointment.date}T${appointment.time}`, 'YYYY-MM-DDTHH:mm:ss').toDate(); //tworzenie obiektu z czasu i daty spotania 
            const now = moment().toDate(); //pobieramy aktualna date 
            
            // Jeśli spotkanie już minęło, zmieniamy jego status
            if (appointmentDate < now) { 
                await appointment.update({ status: 'not_available' }); // Ustawiamy status na 'not_available'
                console.log(`Spotkanie ID: ${appointment.id} zmienione na 'not_available'.`);
            }
        }

         // Po aktualizacji pobierz świeże dane
         const updatedAppointments = await Appointment.findAll({
            where: {
                type: category,
                status: 'available',
            },
            order: [['date', 'ASC']]
        });


        //sprawdzamy czy spotaknie jest juz zarezerwowane!!!
        const userAppointments = await UserAppointment.findAll({
            where: {
                user_id: user_id,
                appointment_id: updatedAppointments.map(appointment => appointment.id), //mapowanie i pobieranie tych dostepnych zarezerwoanych spotkań 
            },
        });

        if (!userAppointments){
            console.log("No booking done")
        }

        //dodajemy isBooked 
        const updatedUserAppointments = updatedAppointments.map(appointment => {
            // Sprawdzamy, czy dane spotkanie zostało już zarezerwowane przez użytkownika
            const isBooked = userAppointments.some(userAppointment => userAppointment.appointment_id === appointment.id);

            return {
                ...appointment.toJSON(), // Konwertujemy na zwykły obiekt JSON
                isBooked: isBooked // Dodajemy nowe pole isBooked
            };
        });

        res.json(updatedUserAppointments);

        //res.json(appointments); //przesyłamy do frontend dane w formacie json 

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










// MEETINGS PAGE 


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

    //sprawdzanie czy juz jakies spotkanie sie nie odbyło po dacie i wtedy ustawiamy is_completed na 1 - czyli ze zakonczone !!!!!!
    for (let appointment of userWithAppointments.appointments) { //iterujemy po spotkaniach pobranych 
        const appointmentDate = moment(`${appointment.date}T${appointment.time}`, 'YYYY-MM-DDTHH:mm:ss').toDate(); //tworzenie obiektu z czasu i daty spotania 
        const now = moment().toDate(); //pobieramy aktualna date 

        if (appointmentDate < now && !appointment.UserAppointment.is_completed) {
            await UserAppointment.update(
                {is_completed: 1},
                {
                    where: {
                        user_id: user_id,
                        appointment_id: appointment.id,
                    },
                }
            );
            console.log(`Spotkanie ID: ${appointment.id} dla użytkownika ID: ${user_id} oznaczone jako zakończone.`);
        }
    }

    // Wczytanie spotkań użytkownika z bazy danych po aktualizacji czasowej - czy juz spotkanie się odbyło 
    const updatedUserWithAppointments = await User.findOne({
        where: { id: user_id },
        include: [{
            model: Appointment,
            as: 'appointments', 
            through: { attributes: ['is_completed', 'is_paid'] }, // Wykluczamy dane z tabeli pośredniej
            required: true, // Zapewnia, że tylko użytkownicy z przypisanymi spotkaniami będą zwróceni
        }],
    });

    // Transformacja danych na odpowiednie wartości
    const transformAppointments = updatedUserWithAppointments.appointments.map(appointment => {
        const status = appointment.UserAppointment.is_completed ? 'Ended' : 'Pending';
        const paymentStatus = appointment.UserAppointment.is_paid === 1 ? 'Paid' : 'Not Paid';

        return {
            ...appointment.dataValues,   // Kopiujemy dane z Appointment
            status,                      // Dodajemy nowe pola
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

//cancelowanie zarezerwowanych spotkań 
const cancelAppointment = async (req, res) => {
    try{
        const user = req.session.user; 
        const user_id = user.id;

        const { appointmentId } = req.body;

        const userAppointment = await UserAppointment.findOne({
            where: {
                user_id: user_id,
                appointment_id: appointmentId,
            },
        });

        if (!userAppointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found or not booked by this user' });
        }

        await userAppointment.destroy(); 

        //aktualizujemy liczbę miejsc 
        const appointment = await Appointment.findByPk(appointmentId); 
        if(appointment){
            //dodawanie jednego miejsca - bo zwalniamy rezerwacje 
            await appointment.increment('available_spots', { by: 1 }); 

            // Jeśli status spotkania był "not_available", zmieniamy go na "available", jeśli są wolne miejsca
            if (appointment.available_spots > 0 && appointment.status === 'not_available') {
                await appointment.update({ status: 'available' });
            }
        }

        res.json({ success: true, message: 'Appointment successfully canceled' });

    }catch(err){
        console.log(err);
        res.status(500).send("Server Error while canceling meeting");
    }
};


const confirmPayment = async (req, res) => {
    try{ 
        const user = req.session.user; 
        const user_id = user.id;
        const { appointmentId, billingAddress, paymentMethod } = req.body;

        if (!appointmentId || !billingAddress || !paymentMethod){
            return res.status(404).json({success: false, message: 'Missing required payment details'});
        }

        //pobieranie rezerwacji uzytkownika
        const userAppointment = await UserAppointment.findOne({
            where:{
                user_id: user_id,
                appointment_id: appointmentId,
            },
        });

        if (!userAppointment){
            return res.status(404).json({success: false, message: 'Failed to found this bookind or meeting'}); 
        }

        // Wyodrębniamy tylko ID metody płatności z wartości 'paymentMethod' (np. 'card-123' -> '123')
        //trzeba tak zrobic, bo wczesniej ustawiam na np card-1 albo paypal-23, w pliku Meetings.js w ładowaniu danych do płatnosci 
        const paymentMethodId = paymentMethod.split('-')[1];  

        //zmieniamy status is_paid na true bo zakładamy ze płatnosci uzytkownika przejdzie
        await userAppointment.update({
            is_paid: 1,
            payment_method_id: paymentMethodId, //przypisujemy ID metody jaka zapłacilismy 
        }); 

        //w sumie przez save() tez by mozna to zrobic!

        return res.json({success: true, message: 'Payment confirmed successfully!'});
    
    }catch(err){
        console.log(err);
        res.status(500).send("Server Error while confirming payment");
    }

};


//funkcja do pobierania szczegółowych danych na temat spotkania - details - po zapłaceniu mamy dostepne to pole 
const getAppointmentDetails = async (req, res) => {
    try{
        const { appointmentId } = req.query;
        const user = req.session.user; 
        const user_id = user.id;
        const user_firstName = user.firstName;
        const user_lastName = user.lastName;
        const user_email = user.email;

        //szukamy w bazie danego spotkania 
        const appointment = await Appointment.findOne({
            where: {id: appointmentId},
            include: [
                {
                    model: User,
                    as: 'users',
                    through: { attributes: ['payment_method_id', 'is_completed', 'is_paid', 'description'] },
                    required: true,
                },
            ],
        });

        if (!appointment){
            return res.status(404).json({success: false, message: 'Appointment not found'}); 
        }

        const userAppointmentDetails = appointment.users[0]?.UserAppointment; 

        if (!userAppointmentDetails) {
            return res.status(404).json({ success: false, message: 'Details not found for this user and appointment' });
        }

        return res.json({
            success: true,
            user:{
                id: user_id,
                firstName: user_firstName,
                lastName: user_lastName, 
                email: user_email,
            },
            appointment: {
                id: appointment.id,
                date: appointment.date,
                doctor_name: appointment.doctor_name,
                description: userAppointmentDetails.description,
                price: appointment.price,
                duration: appointment.duration,
                type: appointment.type,
                isCompleted: userAppointmentDetails.is_completed,
                isPaid: userAppointmentDetails.is_paid,
                payment_method_id: userAppointmentDetails.payment_method_id,
            },
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Server Error while trying to collect Appointment data");
    }

};


module.exports = {getEmptyServices, getAppointmentsByCategory, bookAppointment, 
    loadPaymentDetails, getUserMeetingsPage, cancelAppointment, confirmPayment,
    getAppointmentDetails };




