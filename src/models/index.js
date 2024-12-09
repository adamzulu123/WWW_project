const sequelize = require('../database');
const User = require('./Users');
const Appointment = require('./Appointments');
const UserAppointment = require('./UsersAppointments');
const PaymentMethod = require('./PaymentMethods');

//relacja wiele-do-wielu z Users 
Appointment.belongsToMany(User, {
    through: UserAppointment, 
    foreignKey: 'appointment_id', 
    otherKey: 'user_id', 
    as: 'users', 
});

//realizowanie relacji wiele-do-wielu między Users a Appointments - przez tabele pośrednia UserAppointments
User.belongsToMany(Appointment, {
    through: UserAppointment, //tabela posrednia 
    foreignKey: 'user_id', 
    otherKey: 'appointment_id', 
    as: 'appointments', //alias pod taka nazwa dostepne 
})

// Eksport modeli i instancji Sequelize
module.exports = {
    sequelize,
    User,
    Appointment,
    UserAppointment,
    PaymentMethod,
};
