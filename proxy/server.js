const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config.js');

const app = express();

let handler = createProxyMiddleware({ target: config.archiver_bpl_url, changeOrigin: true });

app.use(cors());
app.use('/mgmt/bpl', handler);

// Heartbeat
app.get('/ping', (req, res) => {
    res.json({ result: 'Success' });
});

// Archiver info
app.get('/archiverinfo', (req, res) => {
    res.json({ url: config.archiver_bpl_url });
});

// Create port
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`The proxy is listening on port ${port}.`);
});