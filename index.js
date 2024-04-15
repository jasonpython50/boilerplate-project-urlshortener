require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

const urlMap = new Map();
let counter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;

  try {
    const parsedUrl = new URL(url);

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        const shortUrl = counter++;
        urlMap.set(shortUrl, url);
        res.json({ original_url: url, short_url: shortUrl });
      }
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  const { shortUrl } = req.params;
  const url = urlMap.get(Number(shortUrl));

  if (url) {
    res.redirect(url);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});