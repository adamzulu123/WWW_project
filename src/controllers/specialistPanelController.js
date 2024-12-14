const { Appointment, User, UserAppointment, PaymentMethod } = require('../models');
const moment = require('moment'); 
const { render } = require('ejs');


const loadSpecialistPanel = async (req, res) => {
    return res.render('SpecialistPanel');

};

const addMeeting = async (req, res) => {
    const {doctor_name, address, date, time, type, available_spots, duration, price } = req.body; 
    const user = req.session.user;
    const doctor_id = user.id;
    const status = 'available';


    // Sprawdzenie poprawności danych (opcjonalne)
    if (!moment(date, 'YYYY-MM-DD', true).isValid() || !moment(time, 'HH:mm', true).isValid()) {
        return res.status(400).send('Invalid date or time format');
    }

    //tworzymym
    await Appointment.create({
        doctor_name, address, date, time, type, available_spots, status, duration, price, doctor_id,
    }); 

    //pobieranie spotkań
    const meetings = await Appointment.findAll({
        where: { doctor_id },
        order: [['date', 'ASC']] 
    });


    return res.render('SpecialistPanel', { meetings });
};


const loadSpecialistMeetings = async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            return res.redirect('/login'); 
        }

        const doctor_id = user.id;

        // Pobierz wszystkie spotkania dla specjalisty
        const appointments = await Appointment.findAll({
            where: { doctor_id: doctor_id },
            order: [['date', 'ASC'], ['time', 'ASC']] // Sortowanie według daty i czasu
        });

        return res.render('SpecialistPanel', { meetings: appointments });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error while adding new meeting');
    }
};

const cancelMeeting = async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
        }

        const doctor_id = user.id;
        const { appointmentId } = req.body;

        console.log('Received appointmentId:', appointmentId);

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
        }

        const doctorAppointment = await Appointment.findOne({
            where: { id: appointmentId, doctor_id },
        });

        if (!doctorAppointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found or access denied.' });
        }

        await doctorAppointment.destroy();

        res.json({ success: true, message: 'Appointment successfully canceled' });

    } catch (error) {
        console.error('Error while canceling appointment:', error);
        res.status(500).json({ success: false, message: 'Server error while canceling meeting' });
    }
};


const loadingMeetingMembers = async (req, res) => {
    try{
        const user = req.session.user;
        const user_id = user.id; 

        const {appointmentId} = req.body; 

        const appointment = await Appointment.findOne({
            where: { id: appointmentId },
            include: {
                model: User, 
                as: 'users', 
                attributes: ['id', 'first_name', 'last_name'],  
            }
        });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Meeting not found' });
        }

        const members = appointment.users;  // Pobranie użytkowników zapisanych na spotkanie

        if (members.length === 0) {
            return res.status(200).json({ success: true, members: [], message: 'Nobody registered for this meeting' });
        }

        // Mapowanie użytkowników na tablicę z imionami i nazwiskami
        const memberList = members.map(member => ({
            id: member.id,
            name: `${member.first_name} ${member.last_name}`,  
        }));

        console.log(memberList);

        return res.status(200).json({ success: true, members: memberList });


    }catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error while loading meeting members' });
    }

};





module.exports = {loadSpecialistPanel, addMeeting, loadSpecialistMeetings, cancelMeeting, loadingMeetingMembers};


