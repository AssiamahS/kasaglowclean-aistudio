import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'live-console.log');

// Clear log file on startup
fs.writeFileSync(LOG_FILE, `=== Console Log Started: ${new Date().toISOString()} ===\n`);

// Intercept console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

function writeToFile(level, args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');

  const logEntry = `[${timestamp}] [${level}] ${message}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    // Silently fail if file write fails
  }
}

console.log = function(...args) {
  writeToFile('LOG', args);
  originalLog.apply(console, args);
};

console.error = function(...args) {
  writeToFile('ERROR', args);
  originalError.apply(console, args);
};

console.warn = function(...args) {
  writeToFile('WARN', args);
  originalWarn.apply(console, args);
};

console.info = function(...args) {
  writeToFile('INFO', args);
  originalInfo.apply(console, args);
};

console.log('🔍 Live console logging enabled - logs are being written to live-console.log');
