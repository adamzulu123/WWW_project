const express = require('express');
const path = require('path');
const pool = require('./src/database');
const session = require('express-session');
const bodyParser = require('body-parser');
const e = require('express');
const bcrypt = require('bcryptjs');

//routers 
const registerRouter = require('./src/routes/register');
const loginRouter = require('./src/routes/login');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: 'admin', //klucz do szyfrowania sesji 
	resave: true, //sesja zapisywana za kazdym razem 
	saveUninitialized: true //sesja tworzona nawet jak nie ma zadnych zmian
}));

// Pliki EJS w katalogu views - do dynamicznej zmiany plików (wyswietlanie błędów itp)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

// Serwowanie plików statycznych z folderów: html, css, js
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css',express.static(__dirname +'/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname+ '/images'));

// Endpoint do sprawdzenia, czy użytkownik jest zalogowany
app.get('/check-session', (req, res) => {
    if (req.session.loggedin) {
        res.json({ loggedin: true });
    } else {
        res.json({ loggedin: false });
    }
});

//logowanie
app.use(loginRouter);
//rejestracja
app.use(registerRouter);

// Strona główna
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});


