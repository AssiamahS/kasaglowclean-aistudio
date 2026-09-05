// functions/api/auth/callback.ts
// Handles Google OAuth callback and stores refresh token

export async function onRequestGet({ request, env }: any) {
  console.log('[OAUTH] /api/auth/callback hit');

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    console.error('[OAUTH] Google returned error:', error);
    return new Response('Google OAuth error: ' + error, { status: 400 });
  }

  if (!code) {
    console.error('[OAUTH] Missing authorization code');
    return new Response('Missing OAuth code', { status: 400 });
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.error('[OAUTH] Missing OAuth env vars', {
      hasClientId: !!env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!env.GOOGLE_CLIENT_SECRET,
    });
    return new Response('OAuth not configured', { status: 500 });
  }

  const REDIRECT_URI = `${env.SITE_URL || 'https://kasaglowclean.com'}/api/auth/callback`;

  console.log('[OAUTH] Exchanging code for tokens');
  console.log('[OAUTH] Redirect URI:', REDIRECT_URI);

  try {
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResp.json();

    if (!tokenResp.ok) {
      console.error('[OAUTH] Token exchange failed', tokens);
      return new Response('Failed to exchange OAuth code: ' + (tokens.error_description || tokens.error), { status: 500 });
    }

    console.log('[OAUTH] Token exchange success', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });

    if (tokens.refresh_token) {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO admin_settings (key, value) VALUES ('google_refresh_token', ?)"
      )
        .bind(tokens.refresh_token)
        .run();

      console.log('[OAUTH] Refresh token stored in DB');
    } else {
      console.warn('[OAUTH] No refresh_token returned (already granted before?)');
    }

    const siteUrl = env.SITE_URL || 'https://kasaglowclean.com';
    return new Response(
      `
      <html>
        <head><meta http-equiv="refresh" content="1;url=${siteUrl}/admin" /></head>
        <body style="font-family: system-ui; text-align: center; padding: 40px; background: #f9fafb;">
          <h1 style="color: #0D9488;">Google Calendar Linked ✅</h1>
          <p style="color: #4B5563;">Redirecting you back to the admin panel...</p>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    console.error('[OAUTH] Callback error:', err);
    return new Response('OAuth callback error: ' + err.message, { status: 500 });
  }
}
