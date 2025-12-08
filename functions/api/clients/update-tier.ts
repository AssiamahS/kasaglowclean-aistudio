// API endpoint to update a client's tier (New / Returning / VIP / Paused)

export async function onRequestPut({ request, env }: any) {
  try {
    const body = await request.json();
    const { clientId, tier } = body;

    if (!clientId || !tier) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(`
      UPDATE clients
      SET tier = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).bind(tier, clientId).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Tier update error", err);
    return new Response(JSON.stringify({ ok: false, error: "Failed to update tier" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
