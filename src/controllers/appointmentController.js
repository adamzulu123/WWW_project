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

module.exports = {getEmptyServices, getAppointmentsByCategory};




