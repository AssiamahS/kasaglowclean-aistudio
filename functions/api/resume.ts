// Serve R2 resume files by key: GET /api/resume?key=<filename>
interface Env {
  RESUMES?: any;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get('key');
    if (!key) return new Response('Missing key', { status: 400 });

    if (!context.env.RESUMES) {
      return new Response('R2 storage not configured', { status: 500 });
    }

    const obj = await context.env.RESUMES.get(key);
    if (!obj) return new Response('Not found', { status: 404 });

    // obj.body is a ReadableStream or ArrayBuffer depending on environment
    const contentType = obj.httpMetadata?.contentType || 'application/octet-stream';
    const disposition = `attachment; filename="${key.replace(/^[0-9]+_/,'') || key}"`;

    return new Response(obj.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    console.error('Error serving resume', e);
    return new Response('Server error', { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
}
