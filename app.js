const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

// middleware - EJS setup
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// empty playlist array
const playlist = [];

// YouTube API helper
async function searchYouTube(query) {
  const response = await axios.get(
    'https://www.googleapis.com/youtube/v3/search',
    {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY
      }
    }
  );
  // return first video item
  return response.data.items[0];
}

// details page helper
async function getVideoDetails(videoId) {
  const response = await axios.get(
    'https://www.googleapis.com/youtube/v3/videos',
    {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    }
  );
  // return first video item
  return response.data.items[0];
}

// adds a song to the playlist
app.get('/', (req, res) => {
  res.render('musicDetails');
});

// loads music player page
app.post('/player', async (req, res) => {
  const { title, artist, genre } = req.body;
  const query = `${title} ${artist}`;
  // calls YouTube API to search for video helper
  try {
    const video = await searchYouTube(query);
    // if no video found message
    if (!video) {
      return res.send('No video found');
    }
    // builds song object
    const song = {
      title: video.snippet.title,
      artist,
      genre,
      videoId: video.id.videoId,
      thumbnail: video.snippet.thumbnails.medium.url
    };
    // adds song to temperary array
    playlist.push(song);
    res.render('musicPlayer', song);
    } catch (error) {
    console.error(error.response?.data || error.message);
    res.send('Error fetching video from YouTube');
    }
});

// renders song details page from local storage
app.get('/playlist', (req, res) => {
  res.render('playlist', { playlist });
});

// renders song details page from YouTube API
app.get('/song/:videoId', async (req, res) => {
  try {
    const video = await getVideoDetails(req.params.videoId);
    // if no video found message
    if (!video) {
      return res.send('Song details not found');
    }
    // renders song details page
    res.render('songDetails', {
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      description: video.snippet.description,
      views: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      published: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.high.url,
      videoId: req.params.videoId
    });
    // error handling
  } catch (err) {
    console.error(err.message);
    res.send('Error loading song details');
  }
});

// sstarts the server
app.listen(PORT, () => {
  console.log(`Music app running at http://localhost:${PORT}`);
});