const express = require('express');
const path = require('path');
const pool = require('./src/database');
const session = require('express-session');
const bodyParser = require('body-parser');
const e = require('express');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: 'admin', //klucz do szyfrowania sesji 
	resave: true, //sesja zapisywana za kazdym razem 
	saveUninitialized: true //sesja tworzona nawet jak nie ma zadnych zmian
}));

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


//login operation
app.post('/login', (req, res) => {
    const {email, password, account_type} = req.body;

    const query = `SELECT * FROM Users WHERE email = '${email}' AND password = '${password}' AND account_type = '${account_type}'`;

    pool.query(query, (err, results) => {
        if(err){
            console.log("Error while logging", err)
            return res.status(500).send('Server error');
        }
        if(results.length > 0){
            req.session.loggedin = true;
            req.session.email = email;
            console.log('Session:', req.session); 
            res.redirect('/index.html');
        }else {
            //trzeba dodać obsługe w przypadku podania złych danych ze sie bedzie wyswietlało w prostokacie do logowania
            res.send('Invalid login credentials');
        }
    });
});


// Strona główna
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Strona logowania
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'LogIn.html')); // Ładuje formularz logowania
});

// Strona services tylko po zalogowaniu
app.get('/services', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'html', 'Services.html'));
    } else {
        res.redirect('/login');
    }
});

//strona meeting tylko po zalogowaniu 
app.get('/meetings', (req, res) =>{
    if(req.session.loggedin){
        res.sendFile(path.join(__dirname, 'html', 'Meetings.html'))
    }else{
        res.redirect('/login')
    }
})

//strona userAccount
app.get('/userAccount', (req, res) =>{
    if(req.session.loggedin){
        res.sendFile(path.join(__dirname, 'html', 'UserAccount.html'))
    }else{
        res.redirect('/login')
    }
})

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
