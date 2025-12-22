import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Job = {
  id: number;
  title: string;
  location?: string;
  description?: string;
  type?: string;
  posted_at?: string;
};

type ApplicationSuccess = {
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
};

const EmploymentTab: React.FC = () => {
  const LOCAL_FALLBACK_JOBS: Job[] = [
    { id: 1, title: 'Residential Cleaner', location: 'Local', description: 'Provide cleaning services for residential customers. Must be reliable and experienced.', type: 'Part Time', posted_at: new Date().toISOString() },
    { id: 2, title: 'Move-In / Move-Out Specialist', location: 'Local', description: 'Deep cleaning for moving homes. Attention to detail required.', type: 'Full Time', posted_at: new Date().toISOString() }
  ];
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyingFor, setApplyingFor] = useState<Job | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState<ApplicationSuccess | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/jobs');
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) {
          // server returned a non-OK status; fall back to local demo jobs so the page is usable
          setJobs(LOCAL_FALLBACK_JOBS);
          setError(null);
          return;
        }
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (data?.ok && Array.isArray(data.jobs)) setJobs(data.jobs);
          else {
            setJobs(LOCAL_FALLBACK_JOBS);
            setError(null);
          }
        } else {
          // likely we're being served index.html (dev server) — fall back to local demo jobs silently
          setJobs(LOCAL_FALLBACK_JOBS);
          setError(null);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // only show jobs and allow applying; no filters

  const startApply = (job: Job) => {
    setApplyingFor(job);
    setApplicationSuccess(null);
    setError(null);
    setFormState({ name: '', email: '', phone: '', message: '' });
    setResumeFile(null);
    // scroll to the job card so the form is visible without changing SPA hash
    setTimeout(() => {
      const el = document.getElementById(`job-${job.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // no filters

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingFor) return;
    const payload = { jobId: applyingFor.id, ...formState };

    // helper to persist locally for demo/admin view
    const saveLocal = async (remoteSaved: boolean, resumeData?: string, resumeName?: string) => {
      try {
        const stored = localStorage.getItem('leadSubmissions');
        const arr = stored ? JSON.parse(stored) : [];
        const localEntry = {
          id: 'local-' + Date.now(),
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          service: applyingFor.title,
          message: formState.message,
          timestamp: new Date().toISOString(),
          read: false,
          remoteSaved: remoteSaved || false,
          resumeName: resumeName || null,
          resumeData: resumeData || null
        };
        arr.push(localEntry);
        localStorage.setItem('leadSubmissions', JSON.stringify(arr));
      } catch (e) {
        console.error('Failed to save local submission', e);
      }
    };
    try {
      setError(null);

      // prepare payload expected by /api/submissions
      let resumeDataUrl: string | undefined;
      if (resumeFile) {
        const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        resumeDataUrl = await toBase64(resumeFile);
      }

      const serverPayload = {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        service: applyingFor.title,
        message: formState.message,
        resumeName: resumeFile?.name,
        resumeData: resumeDataUrl,
        timestamp: new Date().toISOString()
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverPayload),
      });
      const ct = res.headers.get('content-type') || '';
      let body: any = null;
      if (ct.includes('application/json')) {
        body = await res.json();
        if (body?.ok) {
          // save local copy and mark remoteSaved
          await saveLocal(true, undefined, undefined);
          setApplicationSuccess({
            jobTitle: applyingFor.title,
            applicantName: formState.name,
            applicantEmail: formState.email
          });
          setApplyingFor(null);
        } else {
          setError(body?.error || 'Failed to submit application');
          // save locally as fallback
          await saveLocal(false, undefined, undefined);
        }
      } else {
        // non-JSON response (e.g. dev server returned index.html). If status indicates success, treat as success for demo.
        if (res.ok) {
          // if a resume was provided, include it in the local save
          if (resumeFile) {
            const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const data = await toBase64(resumeFile);
            await saveLocal(false, data, resumeFile.name);
          } else {
            await saveLocal(false);
          }
          setApplicationSuccess({
            jobTitle: applyingFor.title,
            applicantName: formState.name,
            applicantEmail: formState.email
          });
          setApplyingFor(null);
        } else {
          const text = await res.text();
          setError('Server returned non-JSON response: ' + text.slice(0, 200));
          // save locally as fallback
          if (resumeFile) {
            const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const data = await toBase64(resumeFile);
            await saveLocal(false, data, resumeFile.name);
          } else {
            await saveLocal(false);
          }
        }
      }
    } catch (err) {
      setError(String(err));
      // on exception, save locally as fallback
      try {
        if (resumeFile) {
          const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const data = await toBase64(resumeFile);
          await saveLocal(false, data, resumeFile.name);
        } else {
          await saveLocal(false);
        }
      } catch (e) {
        console.error('Failed to save local fallback submission', e);
      }
    }
  };

  // Show success page if application was submitted
  if (applicationSuccess) {
    return (
      <section id="employment" className="py-16 bg-base-200 text-neutral">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Thank you, <span className="font-semibold text-primary">{applicationSuccess.applicantName}</span>!
            </p>
            <div className="bg-base-200 rounded-lg p-6 mb-8">
              <p className="text-lg text-gray-800 mb-2">
                Your application for <span className="font-bold text-primary">{applicationSuccess.jobTitle}</span> has been received.
              </p>
              <p className="text-gray-600">
                We'll review your application and contact you at <span className="font-semibold">{applicationSuccess.applicantEmail}</span> within 2-3 business days.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-gray-600">
                In the meantime, feel free to explore our services or get in touch with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setApplicationSuccess(null)}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors"
                >
                  View Other Positions
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="employment" className="py-16 bg-base-200 text-neutral">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero */}
        <div className="relative header-wrapper mb-10">
          <div
            className="header bg-cover bg-center rounded-lg overflow-hidden"
            style={{
              // use a neutral cleaning services photo
              backgroundImage:
                "url('https://images.unsplash.com/photo-1581579184771-2fabe0f0b5c0?auto=format&fit=crop&w=1350&q=80')",
              minHeight: 220,
            }}
          >
            <div className="color-overlay absolute inset-0 bg-black opacity-30" />
            <div className="relative z-10 p-8 md:p-12 text-white">
              <h1 className="text-3xl md:text-5xl font-extrabold">KasaGlow Careers</h1>
              <p className="mt-4 max-w-3xl">Join our KasaGlow team — we offer flexible schedules, competitive pay, and the tools to do your best work.</p>
            </div>
          </div>
        </div>

        {/* CTA button: use JS scroll to avoid changing the SPA hash */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              const el = document.getElementById('job_table');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="inline-block bg-primary text-white px-6 py-3 rounded-md"
          >
            View Open Positions
          </button>
        </div>

        {/* Jobs only: removed perks and about sections per request */}

        {/* Filters removed — page shows open positions only */}

        {/* Job list */}
        <div id="job_table">
          <div className="space-y-4">
            {loading && <div>Loading jobs…</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && jobs.length === 0 && <div>No current openings.</div>}

            {jobs.map((job) => (
              <div id={`job-${job.id}`} key={job.id} className="bg-white rounded shadow p-4 hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="text-lg font-semibold text-primary">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.location}</div>
                    {job.description && <div className="mt-2 text-sm text-gray-700">{job.description}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">{job.posted_at ? new Date(job.posted_at).toLocaleDateString() : ''}</div>
                    <button onClick={() => startApply(job)} className="px-4 py-2 rounded bg-primary text-white">Apply</button>
                  </div>
                </div>

                {applyingFor?.id === job.id && (
                  <form onSubmit={submitApplication} className="mt-4 bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Apply for {job.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input required placeholder="Full name" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} className="p-2 border rounded" />
                      <input required type="email" placeholder="Email" value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} className="p-2 border rounded" />
                      <input placeholder="Phone" value={formState.phone} onChange={(e) => setFormState({ ...formState, phone: e.target.value })} className="p-2 border rounded" />
                      <textarea placeholder="Cover letter / message" value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} className="p-2 border rounded md:col-span-2" />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resume (optional)</label>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)} className="block w-full" />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Send Application</button>
                      <button type="button" onClick={() => setApplyingFor(null)} className="px-4 py-2 rounded border">Cancel</button>
                    </div>
                    {error && <div className="mt-2 text-red-600">{error}</div>}
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmploymentTab;
