// One-time endpoint to update job locations to just say "Local"

export async function onRequestGet({ env }: any) {
  try {
    // Update all job locations to just say "Local"
    await env.DB.prepare(`
      UPDATE jobs SET location = 'Local' WHERE 1=1
    `).run();

    return new Response(JSON.stringify({
      ok: true,
      message: 'Job locations updated to "Local"'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Update error:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
