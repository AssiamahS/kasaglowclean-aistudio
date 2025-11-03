// API endpoint to manage submissions for admin panel
interface Env {
  // Use any to avoid local type issues when D1/D1 types are not present in the environment
  DB: any;
  // Optional R2 bucket binding (set in wrangler.toml as an r2_bucket binding)
  RESUMES?: any;
}

// POST - Accept new submission (from public apply form)
export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const data = await context.request.json();
    const { name, email, phone, service, message, resumeName, resumeData, timestamp } = data;

    if (!name || !email || !service) {
      return new Response(JSON.stringify({ ok: false, error: 'name, email and service are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const ts = timestamp || new Date().toISOString();

    // If an R2 bucket is configured, upload resume there and store the key in resume_url
    let resume_url: string | null = null;
    if (resumeData && context.env.RESUMES) {
      try {
        const matches = String(resumeData).match(/^data:(.+);base64,(.*)$/);
        if (matches) {
          const contentType = matches[1];
          const b64 = matches[2];
          const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const safeName = (resumeName || 'resume').replace(/[^a-z0-9._-]/gi, '_');
          const filename = `${Date.now()}_${safeName}`;
          await context.env.RESUMES.put(filename, binary, { httpMetadata: { contentType } });
          resume_url = filename;
        }
      } catch (e) {
        console.error('Failed to upload resume to R2, will fallback to storing data in D1', e);
      }
    }

    await context.env.DB.prepare(`INSERT INTO submissions (name, email, phone, service, message, resume_name, resume_data, resume_url, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(name, email, phone || null, service, message || '', resumeName || null, resumeData || null, resume_url, ts)
      .run();

    return new Response(JSON.stringify({ ok: true, message: 'Submission saved' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error inserting submission:', error);
    return new Response(JSON.stringify({ ok: false, error: 'Failed to save submission' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// GET - Fetch all submissions
export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM submissions ORDER BY timestamp DESC`
    ).all();

    return new Response(
      JSON.stringify({ ok: true, submissions: results || [] }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to fetch submissions' }),
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

// PUT - Update submission (mark as read)
export async function onRequestPut(context: { request: Request; env: Env }) {
  try {
    const data = await context.request.json();
    const { id, read } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    await context.env.DB.prepare(
      `UPDATE submissions SET read = ? WHERE id = ?`
    ).bind(read ? 1 : 0, id).run();

    return new Response(
      JSON.stringify({ ok: true, message: 'Submission updated' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error updating submission:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to update submission' }),
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

// DELETE - Delete a submission
export async function onRequestDelete(context: { request: Request; env: Env }) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    await context.env.DB.prepare(
      `DELETE FROM submissions WHERE id = ?`
    ).bind(id).run();

    return new Response(
      JSON.stringify({ ok: true, message: 'Submission deleted' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error deleting submission:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to delete submission' }),
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
