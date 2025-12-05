// Cloudflare Function to receive and store live console logs
// Logs are stored in MEMORY ONLY (ephemeral, auto-expire after 1 hour)

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  expiresAt: number; // Unix timestamp when this log expires
}

let logs: LogEntry[] = [];
const MAX_LOGS = 1000;
const LOG_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Clean up expired logs
function cleanExpiredLogs() {
  const now = Date.now();
  logs = logs.filter(log => log.expiresAt > now);
}

export async function onRequestPost(context: any) {
  try {
    const logEntry = await context.request.json();

    // Add expiry timestamp (1 hour from now)
    const enhancedEntry: LogEntry = {
      ...logEntry,
      expiresAt: Date.now() + LOG_EXPIRY_MS
    };

    logs.push(enhancedEntry);

    // Clean expired logs before size check
    cleanExpiredLogs();

    // Keep only last MAX_LOGS
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(-MAX_LOGS);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
}

export async function onRequestGet() {
  // Clean expired logs before returning
  cleanExpiredLogs();

  return new Response(JSON.stringify(logs, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function onRequestDelete() {
  logs = [];
  return new Response('Logs cleared', { status: 200 });
}
