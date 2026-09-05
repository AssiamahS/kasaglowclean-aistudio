// functions/api/auth/start.ts
// Initiates Google OAuth flow for calendar sync

export async function onRequestGet({ env }: any) {
  console.log('[OAUTH] /api/auth/start hit - initiating OAuth flow');

  const REDIRECT_URI = `${env.SITE_URL || 'https://kasaglowclean.com'}/api/auth/callback`;

  console.log('[OAUTH] Redirect URI:', REDIRECT_URI);
  console.log('[OAUTH] Client ID present:', !!env.GOOGLE_CLIENT_ID);

  if (!env.GOOGLE_CLIENT_ID) {
    console.error('[OAUTH] Missing GOOGLE_CLIENT_ID');
    return new Response('OAuth not configured - missing GOOGLE_CLIENT_ID', { status: 500 });
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', encodeURI(REDIRECT_URI));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log('[OAUTH] Redirecting to Google:', authUrl.toString());

  return Response.redirect(authUrl.toString(), 302);
}
