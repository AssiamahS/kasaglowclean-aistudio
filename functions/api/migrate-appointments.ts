// One-time migration endpoint to fix appointments table schema

export async function onRequestGet({ env }: any) {
  try {
    // Drop existing table
    await env.DB.prepare('DROP TABLE IF EXISTS appointments').run();

    // Recreate with correct schema
    await env.DB.prepare(`
      CREATE TABLE appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientId TEXT NOT NULL,
        dateTime TEXT NOT NULL,
        service TEXT,
        status TEXT DEFAULT 'upcoming',
        notes TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `).run();

    // Create indexes
    await env.DB.prepare('CREATE INDEX idx_appointments_dateTime ON appointments(dateTime)').run();
    await env.DB.prepare('CREATE INDEX idx_appointments_clientId ON appointments(clientId)').run();
    await env.DB.prepare('CREATE INDEX idx_appointments_status ON appointments(status)').run();

    return new Response(JSON.stringify({
      ok: true,
      message: 'Appointments table recreated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
