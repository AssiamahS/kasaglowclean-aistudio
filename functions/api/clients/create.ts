// API endpoint to create a new client from admin panel or intake form

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      address,
      city_state_zip,
      tier,
      services,
      frequency,
      notes,
    } = body;

    // Handle services as either string or array
    const servicesStr = Array.isArray(services) ? services.join(', ') : (services || '');

    const stmt = await env.DB.prepare(`
      INSERT INTO clients (name, email, phone, address, city_state_zip, tier, services, frequency, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      name || '',
      email || '',
      phone || '',
      address || '',
      city_state_zip || '',
      tier || 'New',
      servicesStr,
      frequency || '',
      notes || ''
    ).run();

    return new Response(JSON.stringify({ ok: true, clientId: stmt.meta.last_row_id }), {
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
