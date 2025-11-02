// API endpoint to manage submissions for admin panel
interface Env {
  DB: D1Database;
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
