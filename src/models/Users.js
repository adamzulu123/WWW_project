const {Sequelize, DataTypes, Model } = require('sequelize'); 
const sequelize = require('../database');

class User extends Model{ }

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true, // Dodanie unikalnego ograniczenia
            validate: {
                isEmail: true, // Walidacja e-mail
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        account_type: {
            type: DataTypes.ENUM('User', 'Specialist'),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize, // Połączenie z bazą danych
        modelName: 'User', // Nazwa modelu (dla Sequelize)
        tableName: 'Users', // Nazwa tabeli w bazie danych
        timestamps: false, // Jeśli tabela nie ma kolumn `updatedAt` i `createdAt`
    }
);

module.exports = User; 



