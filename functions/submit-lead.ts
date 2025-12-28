// functions/submit-lead.ts
// Cloudflare Pages Function for handling lead form submissions

import { estimateRequestEmail } from '../src/emails/estimate-email';

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

// Helper: get Google access token from stored refresh token
async function getGoogleAccessToken(env: Env): Promise<string | null> {
  try {
    const row = await env.DB.prepare(
      "SELECT value FROM admin_settings WHERE key = 'google_refresh_token'"
    ).first();

    const refreshToken = (row as any)?.value;
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
    if (!data.access_token) {
      console.error('No access_token from Google for lead', data);
      return null;
    }

    return data.access_token as string;
  } catch (err) {
    console.error('getGoogleAccessToken (lead) error', err);
    return null;
  }
}

// Optional bridge: create a calendar event from lead if dateTime is supplied
async function pushLeadToGoogleCalendar(data: any, env: Env) {
  try {
    if (!data?.dateTime) return; // current form likely doesn't send this yet

    const accessToken = await getGoogleAccessToken(env);
    if (!accessToken) return;

    const startIso = new Date(data.dateTime).toISOString();
    const endIso = new Date(new Date(data.dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

    const eventBody = {
      summary: `🧹 KasaGlow Lead: ${data.service || 'Cleaning Service'}`,
      description: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || ''}\nMessage: ${data.message || ''}`,
      start: { dateTime: startIso, timeZone: 'America/New_York' },
      end: { dateTime: endIso, timeZone: 'America/New_York' },
      reminders: { useDefault: true },
    };

    const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      console.error('Lead Google event create failed', body);
    }
  } catch (err) {
    console.error('pushLeadToGoogleCalendar error', err);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const data = await context.request.json().catch(() => null);

    // Validate required fields
    if (!data?.name || !data?.email) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Name and email are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Save to D1 database
    try {
      await context.env.DB.prepare(
        `INSERT INTO submissions (name, email, phone, service, message, timestamp, read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        data.name,
        data.email,
        data.phone || '',
        data.service || '',
        data.message || '',
        new Date().toISOString(),
        0 // unread by default
      ).run();
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to save submission' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Optionally send email notification via Resend
    if (context.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KasaGlow Cleaning <noreply@kasaglowclean.com>',
            to: ['info@kasaglowclean.com'],
            subject: 'New Lead - Free Estimate Request',
            html: estimateRequestEmail(
              data.name,
              data.email,
              data.phone || '',
              data.service || '',
              data.message || ''
            ),
          })
        });
      } catch (emailError) {
        console.error('Email error (non-fatal):', emailError);
        // Don't fail the request if email fails
      }
    }

    // Optional: also push to Google Calendar if dateTime is present
    // (safe no-op if not present)
    pushLeadToGoogleCalendar(data, context.env).catch((err) =>
      console.error('Lead calendar push error', err)
    );

    return new Response(
      JSON.stringify({ ok: true, message: 'Lead submitted successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Error processing lead:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
