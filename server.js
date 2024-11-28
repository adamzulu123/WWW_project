const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serwowanie plików statycznych z folderów: html, css, js
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css',express.static(__dirname +'/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname+ '/images'));


// Główna trasa (powinna ładować plik index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
