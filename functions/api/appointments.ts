// API endpoints for appointment management (GET/POST/PUT/DELETE)
// Includes email notifications via Resend when appointments are created/updated

import { appointmentEmail, appointmentUpdateEmail } from '../../src/emails/appointment-confirmation.js';

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
    const binds = [];

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

    return new Response(JSON.stringify({ ok: true, id: stmt.meta.last_row_id }), {
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

    await env.DB.prepare("DELETE FROM appointments WHERE id = ?")
      .bind(Number(id))
      .run();

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
