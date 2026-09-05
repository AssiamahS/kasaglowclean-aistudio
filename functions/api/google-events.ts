// functions/api/google-events.ts
// GET /api/google-events?start=ISO&end=ISO
// Fetches events from Google Calendar for bidirectional sync

async function getGoogleAccessToken(env: any): Promise<string | null> {
  try {
    const row = await env.DB.prepare(
      "SELECT value FROM admin_settings WHERE key = 'google_refresh_token'"
    ).first();

    const refreshToken = row?.value;
    if (!refreshToken) return null;

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await resp.json();
    if (!resp.ok || !data.access_token) return null;

    return data.access_token as string;
  } catch {
    return null;
  }
}

export async function onRequestGet({ request, env }: any) {
  try {
    const accessToken = await getGoogleAccessToken(env);

    if (!accessToken) {
      return new Response(JSON.stringify({ ok: false, linked: false, events: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const timeMin = url.searchParams.get('start') || new Date().toISOString();
    const timeMax = url.searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch events from Google Calendar
    const calUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    calUrl.searchParams.set('timeMin', new Date(timeMin).toISOString());
    calUrl.searchParams.set('timeMax', new Date(timeMax).toISOString());
    calUrl.searchParams.set('singleEvents', 'true');
    calUrl.searchParams.set('orderBy', 'startTime');
    calUrl.searchParams.set('maxResults', '250');

    const calResp = await fetch(calUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!calResp.ok) {
      const err = await calResp.json().catch(() => ({}));
      console.error('[GCAL] Failed to fetch events', err);
      return new Response(JSON.stringify({ ok: false, error: 'Failed to fetch Google Calendar events', events: [] }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const calData = await calResp.json();
    const items = calData.items || [];

    // Get all local googleEventIds to identify which events are already synced locally
    let localEventIds = new Set<string>();
    try {
      const localRows = await env.DB.prepare(
        'SELECT googleEventId FROM appointments WHERE googleEventId IS NOT NULL'
      ).all();
      localEventIds = new Set((localRows.results || []).map((r: any) => r.googleEventId));
    } catch {
      // ignore
    }

    // Map Google Calendar events to appointment format
    const events = items.map((item: any) => ({
      id: `gcal-${item.id}`,
      googleEventId: item.id,
      title: item.summary || 'Google Calendar Event',
      start: item.start?.dateTime || item.start?.date,
      end: item.end?.dateTime || item.end?.date,
      status: item.status,
      isGoogleOnly: !localEventIds.has(item.id),
      source: 'google',
    }));

    return new Response(JSON.stringify({ ok: true, linked: true, events }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[GCAL] google-events error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message, events: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
