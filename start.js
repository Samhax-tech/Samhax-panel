const { spawn, spawnSync } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

// CONFIGURATION (Edit these!)
const CONFIG = {
  SESSION: "Update_sessiom_id_like_rgn~samhax", // Replace with your session
  REPO_URL: "https://github.com/souravkl11/raganork-md.git",
  DIR: "raganork-md",
  MAX_RESTARTS: 5, // Max crash restarts
  RESTART_DELAY: 5000, // 5 sec delay between restarts
};

// INSTALL & SETUP FUNCTIONS
function installFFmpeg() {
  if (!existsSync("./ffmpeg")) {
    console.log("⬇️ Downloading FFmpeg...");
    spawnSync("curl", ["-L", "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz", "-o", "ffmpeg.tar.xz"], { stdio: "inherit" });
    spawnSync("tar", ["-xf", "ffmpeg.tar.xz"], { stdio: "inherit" });
    spawnSync("mv", ["ffmpeg-*-static/ffmpeg", "./ffmpeg"], { stdio: "inherit" });
    spawnSync("chmod", ["+x", "./ffmpeg"], { stdio: "inherit" });
    spawnSync("rm", ["-rf", "ffmpeg.tar.xz", "ffmpeg-*-static"], { stdio: "inherit" });
    console.log("✅ FFmpeg installed");
  }
}

function setupYarn() {
  try {
    spawnSync("yarn", ["--version"], { stdio: "ignore" });
  } catch {
    console.log("📦 Installing Yarn...");
    spawnSync("npm", ["install", "-g", "corepack"], { stdio: "inherit" });
    spawnSync("corepack", ["enable"], { stdio: "inherit" });
    spawnSync("corepack", ["prepare", "yarn@1.22.22", "--activate"], { stdio: "inherit" });
  }
}

function cloneRepo() {
  if (!existsSync(CONFIG.DIR)) {
    console.log("⬇️ Cloning Raganork-MD...");
    spawnSync("git", ["clone", CONFIG.REPO_URL, CONFIG.DIR], { stdio: "inherit" });
    writeFileSync(`${CONFIG.DIR}/config.env`, `SESSION=${CONFIG.SESSION}`);
  }
}

function installDeps() {
  console.log("📦 Installing dependencies...");
  spawnSync("yarn", ["install", "--ignore-engines"], { cwd: CONFIG.DIR, stdio: "inherit" });
}

// BOT PROCESS MANAGEMENT
let restartCount = 0;
function startBot() {
  const bot = spawn("yarn", ["start"], { cwd: CONFIG.DIR, stdio: "inherit" });

  bot.on("exit", (code) => {
    if (code !== 0) {
      restartCount++;
      if (restartCount > CONFIG.MAX_RESTARTS) {
        console.log("🛑 Too many crashes. Stopping...");
        process.exit(1);
      }
      console.log(`♻️ Restarting (${restartCount}/${CONFIG.MAX_RESTARTS})`);
      setTimeout(startBot, CONFIG.RESTART_DELAY);
    }
  });
}

// MAIN EXECUTION
console.log("🚀 Starting Raganork-MD Setup...");
installFFmpeg();
setupYarn();
cloneRepo();
installDeps();
startBot();
