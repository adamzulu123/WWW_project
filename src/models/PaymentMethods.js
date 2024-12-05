const {Sequelize, DataTypes, Model } = require('sequelize'); 
const sequelize = require('../database');

class PaymentMethod extends Model{}

PaymentMethod.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        payment_type: {
            type: DataTypes.ENUM('credit-card', 'paypal'),
            allowNull: false,
        },
        card_number: {
            type: DataTypes.STRING(16),
            allowNull: true,
            unique: true,
        },
        cardholder_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        cvc: {
            type: DataTypes.STRING(4),
            allowNull: true,
        },
        expiration_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        paypal_fullname: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        paypal_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        paypal_phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize, 
        modelName: 'PaymentMethod',
        tableName: 'PaymentMethods',
        timestamps: false, // Jeśli tabela nie ma kolumn `updated_at`, `created_at` obsługiwanych przez Sequelize
    }
);

module.exports = PaymentMethod;



