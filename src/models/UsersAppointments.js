const {Sequelize, DataTypes, Model } = require('sequelize'); 
const sequelize = require('../database');

class UserAppointment extends Model{}

UserAppointment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, 
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        sequelize,
        modelName: 'UserAppointment',
        tableName: 'UserAppointments',
        timestamps: false, 

    }
);


module.exports = UserAppointment; 

