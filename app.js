console.log('YouTube Key:', process.env.YOUTUBE_API_KEY);


const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Temporary in-memory playlist
const playlist = [];

// YouTube search helper
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

  return response.data.items[0];
}

// page 4: YouTube video details helper
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

  return response.data.items[0];
}



// Page 1: Music Details
app.get('/', (req, res) => {
  res.render('musicDetails');
});

// Page 2: Music Player
app.post('/player', async (req, res) => {
  const { title, artist, genre } = req.body;
  const query = `${title} ${artist}`;

  try {
    const video = await searchYouTube(query);

    if (!video) {
      return res.send('No video found');
    }

    const song = {
      title: video.snippet.title,
      artist,
      genre,
      videoId: video.id.videoId,
      thumbnail: video.snippet.thumbnails.medium.url
    };

    playlist.push(song);
    res.render('musicPlayer', song);
    } catch (error) {
    console.error(error.response?.data || error.message);
    res.send('Error fetching video from YouTube');
    }
});

// Page 3: Playlist
app.get('/playlist', (req, res) => {
  res.render('playlist', { playlist });
});

app.listen(PORT, () => {
  console.log(`Music app running at http://localhost:${PORT}`);
});

// Page 4: Song Details (Uses YouTube Videos API)
app.get('/song/:videoId', async (req, res) => {
  try {
    const video = await getVideoDetails(req.params.videoId);

    if (!video) {
      return res.send('Song details not found');
    }

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
  } catch (err) {
    console.error(err.message);
    res.send('Error loading song details');
  }
});

// 🚨 ALWAYS LAST
app.listen(PORT, () => {
  console.log(`Music app running at http://localhost:${PORT}`);
});