// Cloudflare Pages Function for handling lead form submissions
interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const data = await context.request.json().catch(() => null);

    // Validate required fields
    if (!data?.name || !data?.email) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Name and email are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Save to D1 database
    try {
      await context.env.DB.prepare(
        `INSERT INTO submissions (name, email, phone, service, message, timestamp, read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        data.name,
        data.email,
        data.phone || '',
        data.service || '',
        data.message || '',
        new Date().toISOString(),
        0 // unread by default
      ).run();
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to save submission' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Optionally send email notification via Resend
    if (context.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KasaGlow Cleaning <noreply@kasaglowclean.com>',
            to: ['info@kasaglowclean.com'], // Update with your email
            subject: 'New Lead - Free Estimate Request',
            html: `
              <h2>New Lead Submission</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
              <p><strong>Service:</strong> ${data.service || 'Not specified'}</p>
              <p><strong>Message:</strong> ${data.message || 'No message'}</p>
            `,
          })
        });
      } catch (emailError) {
        console.error('Email error (non-fatal):', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Lead submitted successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Error processing lead:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
