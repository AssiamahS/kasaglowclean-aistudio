// functions/api/auth/status.ts
// Check if Google Calendar is linked

export async function onRequestGet(context) {
  const { env } = context;

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
