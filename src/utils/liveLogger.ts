// Live console logger - stores logs in memory for Claude to access via API

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

// Store logs in window object so they're accessible globally
declare global {
  interface Window {
    __LIVE_LOGS__: LogEntry[];
    __MAX_LOGS__: number;
  }
}

window.__LIVE_LOGS__ = [];
window.__MAX_LOGS__ = 1000; // Keep last 1000 logs

function addLog(level: string, args: any[]) {
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: args.length === 1 && typeof args[0] === 'object' ? args[0] : undefined,
  };

  window.__LIVE_LOGS__.push(entry);

  // Keep only the last MAX_LOGS entries
  if (window.__LIVE_LOGS__.length > window.__MAX_LOGS__) {
    window.__LIVE_LOGS__.shift();
  }

  // Send to endpoint for live debugging
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(() => {
    // Silently fail if endpoint not available
  });
}

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

export function initLiveLogger() {
  console.log = function(...args: any[]) {
    addLog('LOG', args);
    originalConsole.log.apply(console, args);
  };

  console.error = function(...args: any[]) {
    addLog('ERROR', args);
    originalConsole.error.apply(console, args);
  };

  console.warn = function(...args: any[]) {
    addLog('WARN', args);
    originalConsole.warn.apply(console, args);
  };

  console.info = function(...args: any[]) {
    addLog('INFO', args);
    originalConsole.info.apply(console, args);
  };

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    addLog('ERROR', [`Unhandled Error: ${event.message}`, event.error]);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    addLog('ERROR', [`Unhandled Promise Rejection: ${event.reason}`]);
  });

  console.log('🔍 Live logging initialized - Claude can see your console output at /api/logs');

  // Intercept fetch requests to log network activity
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;
    const method = config?.method || 'GET';

    // Skip logging the logger's own requests to avoid infinite loop
    if (url.includes('/api/log')) {
      return originalFetch.apply(this, args);
    }

    console.log(`🌐 ${method} ${url}`);

    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();

      console.log(`✅ ${method} ${url} - ${response.status} ${response.statusText}`);

      return clonedResponse;
    } catch (error) {
      console.error(`❌ ${method} ${url} - Network Error:`, error);
      throw error;
    }
  };

  // Intercept XMLHttpRequest to log AJAX calls
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    (this as any)._method = method;
    (this as any)._url = url;
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const method = (this as any)._method;
    const url = (this as any)._url;

    console.log(`🌐 ${method} ${url}`);

    this.addEventListener('load', function() {
      console.log(`✅ ${method} ${url} - ${this.status} ${this.statusText}`);
    });

    this.addEventListener('error', function() {
      console.error(`❌ ${method} ${url} - XHR Error`);
    });

    return originalXHRSend.apply(this, args);
  };
}

// Export function to get logs (accessible from browser console)
(window as any).getLiveLogs = () => window.__LIVE_LOGS__;
(window as any).clearLiveLogs = () => { window.__LIVE_LOGS__ = []; };
