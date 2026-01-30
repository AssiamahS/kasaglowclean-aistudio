// API endpoint to fetch all clients for admin dashboard
// Now reads from the clients table for proper CRUD support

export async function onRequestGet({ env }: any) {
  try {
    const result = await env.DB.prepare(
      `SELECT id, name, email, phone, tier, services, frequency, notes, created_at as createdAt
       FROM clients
       ORDER BY created_at DESC`
    ).all();

    const clients = (result.results || []).map((client: any) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      tier: client.tier || 'New',
      services: client.services,
      frequency: client.frequency || 'One-Time',
      createdAt: client.createdAt,
      message: client.notes
    }));

    return new Response(JSON.stringify(clients), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('list clients error', err);
    return new Response(JSON.stringify({ ok: false, error: err.message || 'Failed to list clients' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPut({ request, env }: any) {
  try {
    const body = await request.json();
    const { id, name, email, phone, services, tier, frequency, notes } = body;

    await env.DB.prepare(
      `UPDATE clients
       SET name = ?, email = ?, phone = ?, services = ?, tier = ?, frequency = ?, notes = ?
       WHERE id = ?`
    ).bind(name, email, phone, services || '', tier || 'New', frequency || '', notes || '', id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Update client error:', err);
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

    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: 'Client ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(`DELETE FROM clients WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Delete client error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
