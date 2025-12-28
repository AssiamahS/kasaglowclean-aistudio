// functions/api/auth.ts
// Google OAuth bridge for KasaGlow admin calendar sync

export async function onRequest({ request, env }: any): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const REDIRECT_URI = `${env.SITE_URL || 'https://kasaglowclean.com'}/api/auth/callback`;

  // 1) STATUS: is Google linked?
  if (pathname.endsWith('/status')) {
    try {
      const row = await env.DB.prepare(
        "SELECT value FROM admin_settings WHERE key = 'google_refresh_token'"
      ).first();

      return Response.json({ linked: !!row?.value });
    } catch (err: any) {
      console.error('auth/status error', err);
      return Response.json({ linked: false }, { status: 500 });
    }
  }

  // 2) START: redirect to Google "Continue with Google"
  if (pathname.endsWith('/start')) {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return Response.redirect(authUrl, 302);
  }

  // 3) CALLBACK: Google sends ?code=...
  if (pathname.endsWith('/callback')) {
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response('Missing code', { status: 400 });
    }

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
      console.log('Google tokens response', tokens);

      if (tokens.refresh_token) {
        await env.DB.prepare(
          "INSERT OR REPLACE INTO admin_settings (key, value) VALUES ('google_refresh_token', ?)"
        )
          .bind(tokens.refresh_token)
          .run();
      }

      const html = `
        <html>
          <body style="font-family: system-ui; text-align: center; padding: 40px;">
            <h1>KasaGlow Calendar Linked ✅</h1>
            <p>You can close this tab and go back to the admin panel.</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 1500);
            </script>
          </body>
        </html>
      `;

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (err: any) {
      console.error('auth/callback error', err);
      return new Response('Failed to exchange code', { status: 500 });
    }
  }

  // 4) UNLINK: remove refresh token
  if (pathname.endsWith('/unlink')) {
    try {
      await env.DB.prepare(
        "DELETE FROM admin_settings WHERE key = 'google_refresh_token'"
      ).run();

      return Response.json({ ok: true });
    } catch (err: any) {
      console.error('auth/unlink error', err);
      return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
  }

  return new Response('Not found', { status: 404 });
}
