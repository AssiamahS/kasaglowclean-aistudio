// functions/api/auth/unlink.ts
// Removes Google Calendar integration

export async function onRequestPost({ env }: any) {
  console.log('[OAUTH] /api/auth/unlink hit - removing Google Calendar link');

  try {
    await env.DB.prepare(
      "DELETE FROM admin_settings WHERE key = 'google_refresh_token'"
    ).run();

    console.log('[OAUTH] Refresh token removed from database');

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('[OAUTH] Unlink error:', err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// Handle GET for safety (in case someone navigates directly)
export async function onRequestGet() {
  return Response.json({ error: 'Use POST to unlink' }, { status: 405 });
}
