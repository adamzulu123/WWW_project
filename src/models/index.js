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

// Relacja między UserAppointment a PaymentMethod
UserAppointment.belongsTo(PaymentMethod, {
    foreignKey: 'payment_method_id',  // Klucz obcy w UserAppointment
    as: 'paymentMethod', // Alias dla powiązanej metody płatności
});

// PaymentMethod nie ma potrzeby zawierać odniesienia do UserAppointment - bo po co w rodzajach płatnosci maiałby byc klucz ze spotkania 
Appointment.belongsTo(User, {
    foreignKey: 'doctor_id',
    as: 'doctor', 
});


// Eksport modeli i instancji Sequelize
module.exports = {
    sequelize,
    User,
    Appointment,
    UserAppointment,
    PaymentMethod,
};
