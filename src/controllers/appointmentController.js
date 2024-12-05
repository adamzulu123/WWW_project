const { Appointment, User, UserAppointment } = require('../models');

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

module.exports = {getEmptyServices, getAppointmentsByCategory, bookAppointment};




