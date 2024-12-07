const {Sequelize, DataTypes, Model } = require('sequelize'); 
const sequelize = require('../database');

class Appointment extends Model{}

Appointment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    doctor_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
    },
    time: {
        type: DataTypes.TIME, 
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('AI', 'PTSD', 'INDIVIDUAL', 'GROUP', 'COUPLES'),
        allowNull: false,
    },
    available_spots: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('available', 'not_available'),
        allowNull: false,
        defaultValue: 'available',
    },
    duration: { 
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '01:00', // Domyślna wartość
    },
},
{
    sequelize, 
    modelName: 'Appointment', 
    tableName: 'Appointments', 
    timestamps: false, 
}
);


module.exports = Appointment; 

