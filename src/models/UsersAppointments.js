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
        payment_method_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, 
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
        is_paid: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0,
        },
        description:{
            type: DataTypes.TEXT,
            allowNull: true,
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

