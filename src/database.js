const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ładowanie zmiennych środowiskowych

//połaczenie z baza 
const sequelize = new Sequelize({
    host: process.env.MySQL_host,
    dialect: 'mysql', 
    username: process.env.MySQL_user,
    password: process.env.MySQL_password,
    database: process.env.MySQL_db,
    port: process.env.MySQL_port,
    logging: console.log, //wyświetlanie kazdego zapytania do bazy w terminalu 
});

//sprawdzanie czy połaczenia działa
sequelize.authenticate()
    .then(() => {
        console.log('Database connection is ON!');
    })
    .catch((error) => {
        console.error('Error while trying to connect with database:', error);
    });

module.exports = sequelize;


//powyzej aktualizajca na sequelize - bo pozwala na mapowanie obiektów na na tabele bazy danych i wgl upraszczajac w ten sposób prace 
//z kodem i nie trzeba pisac recznie zapytań SQL więc teoretycznie super

/* STARY KOD
const mysql = require('mysql2/promise');
require('dotenv').config(); // Ładowanie zmiennych środowiskowych

// Tworzymy połączenie do bazy danych
const pool = mysql.createPool({
    host: process.env.MySQL_host,
    user: process.env.MySQL_user,
    password: process.env.MySQL_password,
    database: process.env.MySQL_db,
    port: process.env.MySQL_port
});

// Eksportujemy pulę połączeń
module.exports = pool;
*/



