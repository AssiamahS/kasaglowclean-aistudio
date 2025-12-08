// API endpoint to create a new client from intake form
// Handles both public form submissions and admin-created clients

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();

    const {
      name,
      address,
      cityStateZip,
      phone,
      email,
      propertyType,
      services,           // array of strings
      otherService,
      frequency,
      customFrequency,
      preferredDates,
      specialInstructions,
      rateQuoted,
      depositAmount,
      paymentMethod,
      balanceDue,
      tier,              // optional: "New" | "Returning" | "VIP" | "Paused"
    } = body;

    const servicesJson = JSON.stringify(services || []);

    const stmt = await env.DB.prepare(`
      INSERT INTO clients (
        name, address, cityStateZip, phone, email,
        propertyType, services, otherService, frequency,
        customFrequency, preferredDates, specialInstructions,
        rateQuoted, depositAmount, paymentMethod, balanceDue,
        tier, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      name || '',
      address || '',
      cityStateZip || '',
      phone || '',
      email || '',
      propertyType || '',
      servicesJson,
      otherService || '',
      frequency || '',
      customFrequency || '',
      preferredDates || '',
      specialInstructions || '',
      rateQuoted || '',
      depositAmount || '',
      paymentMethod || '',
      balanceDue || '',
      tier || 'New'
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
