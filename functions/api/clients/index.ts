// API endpoint to fetch all clients for admin dashboard
// Returns submissions that are NOT job applications (excludes job applicants)

export async function onRequestGet({ env }: any) {
  try {
    // Get all submissions that are NOT job applications
    const jobTitles = ['Residential Cleaner', 'Move-In / Move-Out Specialist', 'Commercial Cleaner'];
    const placeholders = jobTitles.map(() => '?').join(',');

    const result = await env.DB.prepare(
      `SELECT id, name, email, phone, service, message, timestamp as createdAt
       FROM submissions
       WHERE service NOT IN (${placeholders})
       AND (resume_url IS NULL AND resume_data IS NULL)
       ORDER BY timestamp DESC`
    ).bind(...jobTitles).all();

    // Transform submissions to client format
    const clients = (result.results || []).map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      phone: sub.phone,
      tier: 'New',
      services: sub.service,
      frequency: 'One-Time',
      createdAt: sub.createdAt,
      message: sub.message
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
    const { id, name, email, phone, service, message } = body;

    await env.DB.prepare(
      `UPDATE submissions
       SET name = ?, email = ?, phone = ?, service = ?, message = ?
       WHERE id = ?`
    ).bind(name, email, phone, service, message, id).run();

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
