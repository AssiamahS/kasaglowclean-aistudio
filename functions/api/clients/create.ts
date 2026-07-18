// API endpoint to create a new client from admin panel or intake form.
// When the caller also supplies appointmentDate + appointmentTime, we
// create the first appointment (and any recurring siblings) immediately.

import {
  getGoogleAccessToken,
  buildCalendarEvent,
  frequencyToIntervalDays
} from '../../lib/google';

const RECURRING_COUNT = 8;
const APPOINTMENT_DURATION_HOURS = 2;

async function sendIntakeEmail(env: any, client: any, service: string, dateTime: string, isRecurring: boolean, frequency: string) {
  if (!env.RESEND_API_KEY || !client?.email) return;
  try {
    const formattedDate = new Date(dateTime).toLocaleString();
    const suffix = isRecurring ? ` (${frequency}, ${RECURRING_COUNT} visits)` : '';
    const html = `<p>Hi ${client.name || ''},</p>
      <p>Thanks for booking with KasaGlow Cleaning Services. Your first ${service} is scheduled for <strong>${formattedDate}</strong>${suffix}.</p>
      <p>We'll be in touch if anything changes. Reply to this email with any special instructions.</p>`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kasaglow Cleaning <noreply@kasaglowclean.com>',
        to: [client.email],
        subject: `Your Cleaning Appointment Has Been Scheduled${suffix}`,
        html
      }),
    });
  } catch (err) {
    console.error('intake email failed', err);
  }
}

async function pushToGoogleCalendar(env: any, params: {
  appointmentId: number;
  client: any;
  service: string;
  dateTime: string;
  notes: string;
  frequency: string;
}) {
  try {
    const accessToken = await getGoogleAccessToken(env);
    if (!accessToken) return;
    const startIso = new Date(params.dateTime).toISOString();
    const endIso = new Date(new Date(params.dateTime).getTime() + APPOINTMENT_DURATION_HOURS * 3600000).toISOString();
    const eventBody = buildCalendarEvent({
      service: params.service,
      clientName: params.client?.name,
      clientEmail: params.client?.email,
      notes: params.notes,
      startIso,
      endIso,
      frequency: params.frequency,
      occurrences: RECURRING_COUNT,
    });
    const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });
    const data = await resp.json() as any;
    if (resp.ok && data.id) {
      await env.DB.prepare(`UPDATE appointments SET googleEventId = ? WHERE id = ?`).bind(data.id, params.appointmentId).run();
    } else {
      console.error('Google event create failed', data);
    }
  } catch (err) {
    console.error('push-to-google-calendar failed', err);
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city_state_zip,
      cityStateZip, // camelCase from intake form
      tier,
      services,
      frequency,
      notes,
      specialInstructions,
      appointmentDate,  // YYYY-MM-DD
      appointmentTime,  // HH:mm
    } = body;

    const servicesStr = Array.isArray(services) ? services.join(', ') : (services || '');
    const finalNotes = notes || specialInstructions || '';
    const finalCityStateZip = city_state_zip || cityStateZip || '';

    // 1. Create the client record
    const stmt = await env.DB.prepare(`
      INSERT INTO clients (name, email, phone, address, city_state_zip, tier, services, frequency, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      name || '',
      email || '',
      phone || '',
      address || '',
      finalCityStateZip,
      tier || 'New',
      servicesStr,
      frequency || '',
      finalNotes
    ).run();

    const clientId = stmt.meta.last_row_id;

    // 2. If the caller supplied a date + time, create the first appointment (and recurring siblings)
    let appointmentCreated = false;
    let appointmentId: number | null = null;
    let totalOccurrences = 0;

    if (appointmentDate && appointmentTime) {
      const dateTime = `${appointmentDate}T${appointmentTime}:00`;
      const apptService = servicesStr.split(',')[0].trim() || 'Cleaning Service';

      const parent = await env.DB.prepare(`
        INSERT INTO appointments (client_id, date_time, service, notes, frequency, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(clientId, dateTime, apptService, finalNotes, frequency || '').run();

      appointmentId = parent.meta.last_row_id as number;
      appointmentCreated = true;
      totalOccurrences = 1;

      const intervalDays = frequencyToIntervalDays(frequency);
      if (intervalDays > 0) {
        const startMs = new Date(dateTime).getTime();
        for (let i = 1; i < RECURRING_COUNT; i += 1) {
          const childDate = new Date(startMs + i * intervalDays * 86400000).toISOString();
          await env.DB.prepare(`
            INSERT INTO appointments (client_id, date_time, service, notes, frequency, recurring_parent_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          `).bind(clientId, childDate, apptService, finalNotes, frequency || '', appointmentId).run();
          totalOccurrences += 1;
        }
      }

      const client = { name, email, phone };
      await sendIntakeEmail(env, client, apptService, dateTime, intervalDays > 0, frequency || '');
      await pushToGoogleCalendar(env, {
        appointmentId: appointmentId!,
        client,
        service: apptService,
        dateTime,
        notes: finalNotes,
        frequency: frequency || '',
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      clientId,
      appointmentCreated,
      appointmentId,
      occurrences: totalOccurrences,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('create client error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message || 'Failed to create client' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
