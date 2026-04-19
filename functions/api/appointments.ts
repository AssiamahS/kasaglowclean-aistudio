// functions/api/appointments.ts
// API endpoints for appointment management (GET/POST/PUT/DELETE)
// Includes email notifications via Resend AND Google Calendar sync

import { appointmentEmail, appointmentUpdateEmail } from '../../src/emails/appointment-confirmation.js';
import {
  getGoogleAccessToken,
  buildCalendarEvent,
  frequencyToIntervalDays
} from '../lib/google';

// GET - Fetch appointments for a date range
export async function onRequestGet({ request, env }: any) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    let query = `
      SELECT
        a.id,
        a.client_id,
        a.date_time,
        a.service,
        a.status,
        a.notes,
        a.googleEventId,
        c.name AS clientName,
        c.email AS clientEmail
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE 1=1
    `;
    const binds: any[] = [];

    if (start) { query += " AND a.date_time >= ?"; binds.push(start); }
    if (end) { query += " AND a.date_time <= ?"; binds.push(end); }

    query += " ORDER BY a.date_time ASC";

    const result = await env.DB.prepare(query).bind(...binds).all();

    return new Response(JSON.stringify(result.results ?? []), {
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

const RECURRING_COUNT = 8;
const APPOINTMENT_DURATION_HOURS = 2;

// POST - Create new appointment (with optional recurring series)
export async function onRequestPost({ request, env }: any) {
  try {
    const { clientId, dateTime, service, notes, frequency } = await request.json();

    // Insert parent row
    const stmt = await env.DB.prepare(`
      INSERT INTO appointments (client_id, date_time, service, notes, frequency, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(clientId, dateTime, service || '', notes || '', frequency || '').run();

    const appointmentId = stmt.meta.last_row_id;

    // Create sibling DB rows for recurring series (calendar view + individual cancellation)
    const intervalDays = frequencyToIntervalDays(frequency);
    const createdIds: number[] = [appointmentId];
    if (intervalDays > 0) {
      const startMs = new Date(dateTime).getTime();
      for (let i = 1; i < RECURRING_COUNT; i += 1) {
        const childDate = new Date(startMs + i * intervalDays * 86400000).toISOString();
        const child = await env.DB.prepare(`
          INSERT INTO appointments (client_id, date_time, service, notes, frequency, recurring_parent_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(clientId, childDate, service || '', notes || '', frequency || '', appointmentId).run();
        createdIds.push(child.meta.last_row_id);
      }
    }

    const client = await env.DB.prepare(
      `SELECT email, name FROM clients WHERE id = ?`
    ).bind(clientId).first();

    // Send confirmation email via Resend (one email for the whole series)
    if (env.RESEND_API_KEY && client?.email) {
      try {
        const formattedDate = new Date(dateTime).toLocaleString();
        const subjectSuffix = intervalDays > 0
          ? ` (${frequency}, ${RECURRING_COUNT} visits)`
          : '';
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Kasaglow Cleaning <noreply@kasaglowclean.com>",
            to: [client.email],
            subject: `Your Cleaning Appointment Has Been Scheduled${subjectSuffix}`,
            html: appointmentEmail(client.name, formattedDate, service || 'Cleaning Service'),
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email", emailErr);
      }
    }

    // Google Calendar sync: create a single recurring event using RRULE when applicable
    try {
      const accessToken = await getGoogleAccessToken(env);
      if (accessToken) {
        const startIso = new Date(dateTime).toISOString();
        const endIso = new Date(new Date(dateTime).getTime() + APPOINTMENT_DURATION_HOURS * 3600000).toISOString();

        const eventBody = buildCalendarEvent({
          service,
          clientName: client?.name,
          clientEmail: client?.email,
          notes,
          startIso,
          endIso,
          frequency,
          occurrences: RECURRING_COUNT
        });

        const eventResp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        });

        const eventJson = await eventResp.json() as any;
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

    return new Response(JSON.stringify({
      ok: true,
      id: appointmentId,
      occurrences: createdIds.length,
      ids: createdIds
    }), {
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
      SET date_time = ?, service = ?, status = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(dateTime, service || '', status || 'upcoming', notes || '', id).run();

    // Send update email via Resend
    if (env.RESEND_API_KEY) {
      try {
        const appointment = await env.DB.prepare(`
          SELECT c.email, c.name, a.service
          FROM appointments a
          LEFT JOIN clients c ON a.client_id = c.id
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
          `SELECT a.googleEventId, a.date_time, a.service, c.name, c.email
           FROM appointments a
           LEFT JOIN clients c ON a.client_id = c.id
           WHERE a.id = ?`
        ).bind(id).first();

        if (row && row.googleEventId) {
          const startIso = new Date(row.date_time || dateTime).toISOString();
          const endIso = new Date(new Date(row.date_time || dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

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
