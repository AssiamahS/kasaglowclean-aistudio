// API endpoint to list jobs and receive applications.
// GET /api/jobs            -> list jobs
// POST /api/jobs/apply     -> submit application (body: { jobId, name, email, phone, message })

interface Env {
  // D1 bindings may not be available in local typechecker; use any to avoid TS type issues
  DB: any;
}

const FALLBACK_JOBS = [
  { id: 1, title: 'Residential Cleaner', location: 'Local', description: 'Provide cleaning services for residential customers. Must be reliable and experienced.', type: 'Part Time', posted_at: new Date().toISOString(), active: 1 },
  { id: 2, title: 'Move-In / Move-Out Specialist', location: 'Local', description: 'Deep cleaning for moving homes. Attention to detail required.', type: 'Full Time', posted_at: new Date().toISOString(), active: 1 },
  { id: 3, title: 'Commercial Cleaner', location: 'Local', description: 'Office & commercial space cleaning during business hours or evenings.', type: 'Full Time', posted_at: new Date().toISOString(), active: 1 }
];

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    // Try to fetch from D1 jobs table
    const res = await context.env.DB.prepare(`SELECT id, title, location, description, type, posted_at, active FROM jobs WHERE active = 1 ORDER BY posted_at DESC`).all();
    const jobs = res?.results && res.results.length ? res.results : FALLBACK_JOBS;

    return new Response(JSON.stringify({ ok: true, jobs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error fetching jobs from DB, returning fallback', error);
    return new Response(JSON.stringify({ ok: true, jobs: FALLBACK_JOBS }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Accept application submissions and write them into the existing submissions table
export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const data = await context.request.json();
    const { jobId, name, email, phone, message } = data;

    if (!name || !email || !jobId) {
      return new Response(JSON.stringify({ ok: false, error: 'jobId, name and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // lookup job title (best-effort). If jobs table missing, this will fail silently.
    let jobTitle = '';
    try {
      const j = await context.env.DB.prepare(`SELECT title FROM jobs WHERE id = ? LIMIT 1`).bind(jobId).all();
      if (j?.results?.length) jobTitle = j.results[0].title;
    } catch (e) {
      // ignore, we will still insert submission
    }

    const timestamp = new Date().toISOString();

    await context.env.DB.prepare(`INSERT INTO submissions (name, email, phone, service, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(name, email, phone || null, jobTitle || String(jobId), message || '', timestamp)
      .run();

    return new Response(JSON.stringify({ ok: true, message: 'Application submitted' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return new Response(JSON.stringify({ ok: false, error: 'Failed to submit application' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
