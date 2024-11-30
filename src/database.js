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



