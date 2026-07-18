// Shared helper for obtaining a Google API access token from a stored refresh token.
// Returns null when no refresh token is saved or when the exchange fails.

export async function getGoogleAccessToken(env: any): Promise<string | null> {
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

    const data = await resp.json() as any;
    if (!data.access_token) {
      console.error('No access_token from Google', data);
      return null;
    }

    return data.access_token as string;
  } catch (err) {
    console.error('getGoogleAccessToken error', err);
    return null;
  }
}

// Build a Google Calendar event body from appointment details.
// Use RRULE to let Google manage the series natively when frequency is set.
export function buildCalendarEvent(params: {
  service: string;
  clientName?: string | null;
  clientEmail?: string | null;
  notes?: string | null;
  startIso: string;
  endIso: string;
  frequency?: string | null;
  occurrences?: number;
}) {
  const {
    service, clientName, clientEmail, notes, startIso, endIso, frequency, occurrences
  } = params;

  const descriptionLines = [
    clientName || clientEmail ? `Client: ${clientName || ''}${clientEmail ? ` (${clientEmail})` : ''}` : null,
    notes ? `Notes: ${notes}` : null
  ].filter(Boolean);

  const body: any = {
    summary: `🧹 KasaGlow: ${service || 'Cleaning Service'}`,
    description: descriptionLines.join('\n'),
    start: { dateTime: startIso, timeZone: 'America/New_York' },
    end: { dateTime: endIso, timeZone: 'America/New_York' },
    reminders: { useDefault: true },
  };

  const rrule = frequencyToRRULE(frequency, occurrences);
  if (rrule) body.recurrence = [rrule];

  return body;
}

export function frequencyToRRULE(frequency?: string | null, occurrences = 8): string | null {
  if (!frequency) return null;
  const f = frequency.toLowerCase();
  if (f.includes('weekly') && !f.includes('bi')) return `RRULE:FREQ=WEEKLY;COUNT=${occurrences}`;
  if (f.includes('bi') || f.includes('biweekly') || f.includes('bi-weekly')) {
    return `RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=${occurrences}`;
  }
  if (f.includes('monthly')) return `RRULE:FREQ=MONTHLY;COUNT=${occurrences}`;
  return null;
}

// Interval in days for our own DB rows when we create sibling appointments.
// Returns 0 for one-time / unknown so callers skip the loop.
export function frequencyToIntervalDays(frequency?: string | null): number {
  if (!frequency) return 0;
  const f = frequency.toLowerCase();
  if (f.includes('weekly') && !f.includes('bi')) return 7;
  if (f.includes('bi')) return 14;
  if (f.includes('monthly')) return 28;
  return 0;
}
