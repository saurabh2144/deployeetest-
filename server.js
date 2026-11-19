const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const CHECK_INTERVAL_MS = 15000; // Check GitHub every 15 seconds

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

// --- HTTP SERVER ---
const server = http.createServer((req, res) => {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(__dirname, reqPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      const ext = path.extname(filePath);
      // Disable caching so browser immediately gets updated files after deployment
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[Main RPA Server] Running at http://localhost:${PORT}`);
  console.log(`[CD Agent] Watching remote 'main' branch every ${CHECK_INTERVAL_MS / 1000}s...`);
  console.log(`=======================================================`);
});

// --- CONTINUOUS DEPLOYMENT (CD) AUTO-PULL RUNNER ---
let isChecking = false;

function checkAndAutoDeploy() {
  if (isChecking) return;
  isChecking = true;

  try {
    // Fetch latest git state from remote
    execSync('git fetch origin main', { stdio: 'pipe' });

    // Compare local main with remote main
    const localHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const remoteHash = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();

    if (localHash !== remoteHash) {
      console.log(`\n🔔 [CD EVENT] New commit detected on remote 'main'!`);
      console.log(`  Local:  ${localHash.substring(0, 7)}`);
      console.log(`  Remote: ${remoteHash.substring(0, 7)}`);
      console.log(`🔄 Automatically deploying new changes...`);

      const pullOutput = execSync('git pull origin main', { encoding: 'utf8' });
      console.log(`✅ [CD DEPLOYED] Successfully pulled & applied changes:`);
      console.log(pullOutput.trim());
      console.log(`🚀 Main RPA Server is now running the latest version!\n`);
    }
  } catch (error) {
    // If remote or network issue, log softly without crashing server
    // console.log('[CD Watcher] Waiting for remote sync...');
  } finally {
    isChecking = false;
  }
}

// Start auto-deployment check interval
setInterval(checkAndAutoDeploy, CHECK_INTERVAL_MS);
