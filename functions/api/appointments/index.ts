// Appointments API endpoint
export async function onRequestGet({ request, env }: any) {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    let query = `
      SELECT
        appointments.*,
        submissions.name as clientName
      FROM appointments
      LEFT JOIN submissions ON CAST(appointments.clientId AS TEXT) = CAST(submissions.id AS TEXT)
    `;
    const params: string[] = [];

    if (start && end) {
      query += ' WHERE appointments.dateTime >= ? AND appointments.dateTime <= ?';
      params.push(start, end);
    }

    query += ' ORDER BY appointments.dateTime ASC';

    const result = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify(result.results || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Get appointments error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();
    const { clientId, dateTime, service, notes } = body;

    let clientEmail = null;

    // Only query DB if clientId is numeric (not a local-xxx ID)
    if (typeof clientId === 'number' || (typeof clientId === 'string' && !clientId.startsWith('local-'))) {
      const clientResult = await env.DB.prepare(
        'SELECT email FROM submissions WHERE id = ?'
      ).bind(clientId).first();

      clientEmail = clientResult?.email;
    }

    // Insert appointment
    const result = await env.DB.prepare(
      `INSERT INTO appointments (clientId, dateTime, service, status, notes)
       VALUES (?, ?, ?, 'scheduled', ?)`
    ).bind(clientId, dateTime, service || 'Cleaning', notes || '').run();

    // Send email notification via Resend
    if (clientEmail && env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'KasaGlow <noreply@kasaglow.com>',
            to: [clientEmail],
            subject: 'Appointment Confirmation - KasaGlow Cleaning',
            html: `
              <h2>Appointment Confirmed</h2>
              <p>Hello ${clientName},</p>
              <p>Your cleaning appointment has been scheduled for <strong>${new Date(dateTime).toLocaleString()}</strong>.</p>
              <p><strong>Service:</strong> ${service || 'Cleaning'}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              <p>We look forward to serving you!</p>
              <p>Best regards,<br>KasaGlow Cleaning Team</p>
            `
          })
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }
    }

    return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Create appointment error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut({ request, env }: any) {
  try {
    const body = await request.json();
    const { id, dateTime, service, status, notes } = body;

    await env.DB.prepare(
      `UPDATE appointments
       SET dateTime = ?, service = ?, status = ?, notes = ?
       WHERE id = ?`
    ).bind(dateTime, service, status || 'scheduled', notes || '', id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Update appointment error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete({ request, env }: any) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    await env.DB.prepare('DELETE FROM appointments WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Delete appointment error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
