const express = require('express');
const app = express();
const PORT = 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


// Temporary in-memory playlist
const playlist = [];


// Page 1: Music Details
app.get('/', (req, res) => {
res.render('musicDetails');
});


// Page 2: Music Player
app.post('/player', (req, res) => {
const { title, artist, genre } = req.body;


const song = { title, artist, genre };
playlist.push(song);


res.render('musicPlayer', song);
});


// Page 3: Playlist
app.get('/playlist', (req, res) => {
res.render('playlist', { playlist });
});


app.listen(PORT, () => {
console.log(`Music app running at http://localhost:${PORT}`);
});