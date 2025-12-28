// functions/api/appointments.ts
// API endpoints for appointment management (GET/POST/PUT/DELETE)
// Includes email notifications via Resend AND Google Calendar sync

import { appointmentEmail, appointmentUpdateEmail } from '../../src/emails/appointment-confirmation.js';

// Helper: get Google access token from stored refresh token
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

// GET - Fetch appointments for a date range
export async function onRequestGet({ request, env }: any) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    let query = `
      SELECT a.*, c.name AS clientName, c.email AS clientEmail
      FROM appointments a
      JOIN clients c ON a.clientId = c.id
      WHERE 1=1
    `;
    const binds: any[] = [];

    if (start) { query += " AND a.dateTime >= ?"; binds.push(start); }
    if (end) { query += " AND a.dateTime <= ?"; binds.push(end); }

    query += " ORDER BY a.dateTime ASC";

    const result = await env.DB.prepare(query).bind(...binds).all();

    return new Response(JSON.stringify(result.results || []), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error('GET appointments error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Create new appointment
export async function onRequestPost({ request, env }: any) {
  try {
    const { clientId, dateTime, service, notes } = await request.json();

    const stmt = await env.DB.prepare(`
      INSERT INTO appointments (clientId, dateTime, service, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(clientId, dateTime, service || '', notes || '').run();

    const appointmentId = stmt.meta.last_row_id;

    // Send confirmation email via Resend
    if (env.RESEND_API_KEY) {
      try {
        const client = await env.DB.prepare(
          `SELECT email, name FROM clients WHERE id = ?`
        ).bind(clientId).first();

        if (client && client.email) {
          const formattedDate = new Date(dateTime).toLocaleString();

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Kasaglow Cleaning <noreply@kasaglowclean.com>",
              to: [client.email],
              subject: "Your Cleaning Appointment Has Been Scheduled",
              html: appointmentEmail(client.name, formattedDate, service || 'Cleaning Service'),
            }),
          });
        }
      } catch (emailErr) {
        console.error("Failed to send confirmation email", emailErr);
        // Don't fail the appointment creation if email fails
      }
    }

    // Google Calendar sync: create event
    try {
      const accessToken = await getGoogleAccessToken(env);
      if (accessToken) {
        const client = await env.DB.prepare(
          `SELECT email, name FROM clients WHERE id = ?`
        ).bind(clientId).first();

        const startIso = new Date(dateTime).toISOString();
        const endIso = new Date(new Date(dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString(); // +2 hours

        const eventBody = {
          summary: `🧹 KasaGlow: ${service || 'Cleaning Service'}`,
          description: client
            ? `Client: ${client.name} (${client.email})\nNotes: ${notes || ''}`
            : `Notes: ${notes || ''}`,
          start: { dateTime: startIso, timeZone: 'America/New_York' },
          end: { dateTime: endIso, timeZone: 'America/New_York' },
          reminders: { useDefault: true },
        };

        const eventResp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        });

        const eventJson = await eventResp.json();
        if (eventResp.ok && eventJson.id) {
          await env.DB.prepare(
            `UPDATE appointments SET googleEventId = ? WHERE id = ?`
          ).bind(eventJson.id, appointmentId).run();
        } else {
          console.error('Google event create failed', eventJson);
        }
      }
    } catch (calErr) {
      console.error('Google Calendar create error', calErr);
    }

    return new Response(JSON.stringify({ ok: true, id: appointmentId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error('POST appointment error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PUT - Update appointment
export async function onRequestPut({ request, env }: any) {
  try {
    const { id, dateTime, service, status, notes } = await request.json();

    await env.DB.prepare(`
      UPDATE appointments
      SET dateTime = ?, service = ?, status = ?, notes = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).bind(dateTime, service || '', status || 'upcoming', notes || '', id).run();

    // Send update email via Resend
    if (env.RESEND_API_KEY) {
      try {
        const appointment = await env.DB.prepare(`
          SELECT c.email, c.name, a.service
          FROM appointments a
          JOIN clients c ON a.clientId = c.id
          WHERE a.id = ?
        `).bind(id).first();

        if (appointment && appointment.email) {
          const formattedDate = new Date(dateTime).toLocaleString();

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Kasaglow Cleaning <noreply@kasaglowclean.com>",
              to: [appointment.email],
              subject: "Your Appointment Has Been Updated",
              html: appointmentUpdateEmail(
                appointment.name,
                formattedDate,
                service || appointment.service || 'Cleaning Service'
              ),
            }),
          });
        }
      } catch (emailErr) {
        console.error("Failed to send update email", emailErr);
        // Don't fail the update if email fails
      }
    }

    // Google Calendar sync: update event (if we have an event ID)
    try {
      const accessToken = await getGoogleAccessToken(env);
      if (accessToken) {
        const row = await env.DB.prepare(
          `SELECT a.googleEventId, a.dateTime, a.service, c.name, c.email
           FROM appointments a
           JOIN clients c ON a.clientId = c.id
           WHERE a.id = ?`
        ).bind(id).first();

        if (row && row.googleEventId) {
          const startIso = new Date(row.dateTime || dateTime).toISOString();
          const endIso = new Date(new Date(row.dateTime || dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

          const eventBody = {
            summary: `🧹 KasaGlow: ${service || row.service || 'Cleaning Service'}`,
            description: row.email
              ? `Client: ${row.name} (${row.email})\nNotes: ${notes || ''}`
              : `Notes: ${notes || ''}`,
            start: { dateTime: startIso, timeZone: 'America/New_York' },
            end: { dateTime: endIso, timeZone: 'America/New_York' },
          };

          const eventResp = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(row.googleEventId)}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventBody),
            }
          );

          if (!eventResp.ok) {
            const body = await eventResp.json().catch(() => ({}));
            console.error('Google event update failed', body);
          }
        }
      }
    } catch (calErr) {
      console.error('Google Calendar update error', calErr);
    }

    return new Response(JSON.stringify({ ok: true, status: "updated" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error('PUT appointment error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE - Delete appointment
export async function onRequestDelete({ request, env }: any) {
  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id) return new Response("Missing id", { status: 400 });

    // Fetch googleEventId before deleting
    let googleEventId: string | null = null;
    try {
      const row = await env.DB.prepare(
        "SELECT googleEventId FROM appointments WHERE id = ?"
      ).bind(Number(id)).first();
      googleEventId = row?.googleEventId || null;
    } catch (err) {
      console.error('Fetch googleEventId before delete error', err);
    }

    await env.DB.prepare("DELETE FROM appointments WHERE id = ?")
      .bind(Number(id))
      .run();

    // Google Calendar sync: delete event
    try {
      if (googleEventId) {
        const accessToken = await getGoogleAccessToken(env);
        if (accessToken) {
          const resp = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!resp.ok && resp.status !== 404) {
            const body = await resp.json().catch(() => ({}));
            console.error('Google event delete failed', body);
          }
        }
      }
    } catch (calErr) {
      console.error('Google Calendar delete error', calErr);
    }

    return new Response(JSON.stringify({ ok: true, status: "deleted" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error('DELETE appointment error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
