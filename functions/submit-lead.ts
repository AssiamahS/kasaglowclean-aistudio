// Cloudflare Pages Function for handling lead form submissions
import { estimateRequestEmail } from '../emails/estimate-email';

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
            to: ['info@kasaglowclean.com'],
            subject: 'New Lead - Free Estimate Request',
            html: estimateRequestEmail(
              data.name,
              data.email,
              data.phone || '',
              data.service || '',
              data.message || ''
            ),
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
