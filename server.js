const http = require('http');
const fs = require('fs');
const path = require('path');

// Load settings from .env (PORT, HOST)
if (fs.existsSync(path.join(__dirname, '.env'))) process.loadEnvFile(path.join(__dirname, '.env'));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Only these files are served - nothing else in the folder is exposed
const FILES = {
  '/': ['index.html', 'text/html'],
  '/index.html': ['index.html', 'text/html'],
  '/style.css': ['style.css', 'text/css'],
  '/script.js': ['script.js', 'application/javascript'],
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  const file = FILES[url];
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  fs.readFile(path.join(__dirname, file[0]), (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Server Error');
    }
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-cache' });
    res.end(content);
  });
});

server.listen(PORT, HOST, () => console.log(`[RPA Server] Running at http://${HOST}:${PORT}`));

// Graceful shutdown on PM2 restart
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
