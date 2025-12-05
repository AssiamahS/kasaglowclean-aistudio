// Cloudflare Function to receive live console logs
// This endpoint is for debugging - it just echoes logs to server console

export async function onRequest(context: any) {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const logEntry = await context.request.json();
    const logLine = `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.message}`;

    // Echo to server console for debugging
    console.log(logLine);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Failed to log:', error);
    return new Response('Error', { status: 500 });
  }
}
