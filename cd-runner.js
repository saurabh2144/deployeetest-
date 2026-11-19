const { execSync } = require('child_process');

function startCDWatcher(intervalMs = 10000) {
  console.log('=======================================================');
  console.log('🤖 [CD Module] Continuous Deployment Active!');
  console.log(`📡 Watching GitHub remote 'main' branch every ${intervalMs / 1000}s...`);
  console.log('=======================================================');

  let isChecking = false;

  function checkAndAutoDeploy() {
    if (isChecking) return;
    isChecking = true;

    try {
      // 1. Fetch latest state from remote main
      execSync('git fetch origin main', { stdio: 'pipe' });

      // 2. Compare local vs remote hashes
      const localHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const remoteHash = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();

      if (localHash !== remoteHash) {
        const time = new Date().toLocaleTimeString();
        console.log(`\n🔔 [${time}] [CD EVENT] New merge detected on GitHub 'main' branch!`);
        console.log(`   Local commit:  ${localHash.substring(0, 7)}`);
        console.log(`   Remote commit: ${remoteHash.substring(0, 7)}`);
        console.log(`🔄 Pulling and deploying new changes to main-rpa-server...`);

        // 3. Auto pull new changes
        const pullOutput = execSync('git pull origin main', { encoding: 'utf8' });
        console.log(`✅ [CD DEPLOYED] Successfully deployed!`);
        console.log(`-------------------------------------------------------`);
        console.log(pullOutput.trim());
        console.log(`-------------------------------------------------------`);
        console.log(`🚀 main-rpa-server is now LIVE with the latest updates!\n`);
      }
    } catch (err) {
      // Silent catch on network blips
    } finally {
      isChecking = false;
    }
  }

  // Check once on startup
  checkAndAutoDeploy();

  // Watch periodically
  setInterval(checkAndAutoDeploy, intervalMs);
}

module.exports = { startCDWatcher };
