// Admin API for managing job listings (create / update / delete)
// Note: This endpoint does not add auth — the Admin UI controls access via sessionStorage.

interface Env { DB: any; ADMIN_SECRET?: string }

export async function onRequestPost(context: { request: Request; env: Env }) {
  // Create a new job
  try {
    // simple server-side protection: require x-admin-secret header matching ADMIN_SECRET
    const provided = context.request.headers.get('x-admin-secret');
    if (!provided || !context.env.ADMIN_SECRET || provided !== context.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const data = await context.request.json();
    const { title, location, description, type, active } = data;
    if (!title) {
      return new Response(JSON.stringify({ ok: false, error: 'title required' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const stmt = await context.env.DB.prepare(`INSERT INTO jobs (title, location, description, type, active, posted_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(
      title,
      location || null,
      description || null,
      type || null,
      active ? 1 : 1,
      new Date().toISOString()
    ).run();

    return new Response(JSON.stringify({ ok: true, id: stmt.lastInsertRowid }), { status: 201, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (err) {
    console.error('jobs_admin create error', err);
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function onRequestPut(context: { request: Request; env: Env }) {
  // Update job
  try {
    const provided = context.request.headers.get('x-admin-secret');
    if (!provided || !context.env.ADMIN_SECRET || provided !== context.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const data = await context.request.json();
    const { id, title, location, description, type, active } = data;
    if (!id) return new Response(JSON.stringify({ ok: false, error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

    const updates: string[] = [];
    const binds: any[] = [];
    if (title !== undefined) { updates.push('title = ?'); binds.push(title); }
    if (location !== undefined) { updates.push('location = ?'); binds.push(location); }
    if (description !== undefined) { updates.push('description = ?'); binds.push(description); }
    if (type !== undefined) { updates.push('type = ?'); binds.push(type); }
    if (active !== undefined) { updates.push('active = ?'); binds.push(active ? 1 : 0); }

    if (updates.length === 0) return new Response(JSON.stringify({ ok: false, error: 'no fields to update' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

    binds.push(id);
    const sql = `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`;
    await context.env.DB.prepare(sql).bind(...binds).run();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (err) {
    console.error('jobs_admin update error', err);
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  try {
    const provided = context.request.headers.get('x-admin-secret');
    if (!provided || !context.env.ADMIN_SECRET || provided !== context.env.ADMIN_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ ok: false, error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

    await context.env.DB.prepare(`DELETE FROM jobs WHERE id = ?`).bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (err) {
    console.error('jobs_admin delete error', err);
    return new Response(JSON.stringify({ ok: false, error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
