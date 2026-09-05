import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Login from './Login';
import { MailIcon, PhoneIcon, UserIcon } from './IconComponents';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import ClientIntakeForm from './ClientIntakeForm';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message?: string;
  timestamp: string;
  read?: boolean;
  remoteSaved?: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier?: string;
  createdAt?: string;
  read?: boolean;
}

interface JobApplicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  timestamp?: string;
  read?: boolean;
}

interface Job {
  id: string | number;
  title: string;
  location: string;
  type: string;
  description?: string;
  createdAt?: string;
  posted_at?: string;
  active?: number;
}

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientId?: string;
  clientName?: string;
  googleEventId?: string;
  source?: 'local' | 'google';
  isGoogleOnly?: boolean;
}

const DnDCalendar = withDragAndDrop(Calendar);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}

type AdminPanelKey = 'clients' | 'applicants' | 'jobs' | 'calendar' | 'forms';

const PANEL_ORDER: AdminPanelKey[] = ['clients', 'applicants', 'jobs', 'calendar', 'forms'];

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function PanelShell({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        {/* Mobile-safe modal body */}
        <div className="max-h-[85vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminView() {
  const isMobile = useMediaQuery('(max-width: 640px)');

  // -----------------------------
  // AUTH
  // -----------------------------
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSuccess = useCallback(() => setLoggedIn(true), []);
  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    window.location.hash = '#/';
  }, []);

  // -----------------------------
  // DATA
  // -----------------------------
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [allApplicants, setAllApplicants] = useState<JobApplicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [googleEvents, setGoogleEvents] = useState<Appointment[]>([]);

  // -----------------------------
  // UI STATE
  // -----------------------------
  const [activePanel, setActivePanel] = useState<AdminPanelKey>('clients');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Record<AdminPanelKey, HTMLElement | null>>({
    clients: null,
    applicants: null,
    jobs: null,
    calendar: null,
    forms: null,
  });

  const scrollToPanel = useCallback((key: AdminPanelKey) => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Calculate position based on panel index for reliability
    const panelIndex = PANEL_ORDER.indexOf(key);
    const scrollPosition = panelIndex * slider.clientWidth;

    slider.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });

    setActivePanel(key);
  }, []);

  // Add Customer Modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Delete Client
  const [deletingClient, setDeletingClient] = useState(false);

  // Job Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    type: '',
    description: '',
  });

  // Calendar view tracking — sync with isMobile so rotating or resizing works
  const [calendarView, setCalendarView] = useState<string>(() => {
    if (typeof window === 'undefined') return 'week';
    return window.matchMedia('(max-width: 640px)').matches ? 'day' : 'week';
  });
  useEffect(() => {
    setCalendarView(isMobile ? 'day' : 'week');
  }, [isMobile]);

  // Appointment Modal
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    clientId: '',
    clientName: '',
    service: '',
    start: '',
    end: '',
    notes: '',
  });

  // -----------------------------
  // HELPERS
  // -----------------------------
  const isJobApplication = useCallback((sub: Submission) => {
    // Prefer explicit type tag from the submission
    if ((sub as any).type === 'job_application') return true;
    if ((sub as any).type === 'contact') return false;
    // Fallback for old submissions without type: check message + resume
    const msg = (sub.message || '').toLowerCase();
    return msg.includes('job') || msg.includes('application') || msg.includes('apply') || !!(sub as any).resume_name;
  }, []);

  const submissionClients = useMemo(() => submissions.filter((s) => !isJobApplication(s)), [submissions, isJobApplication]);
  const submissionApplicants = useMemo(() => submissions.filter((s) => isJobApplication(s)), [submissions, isJobApplication]);

  // NOTE: This prevents the calendar from "appearing" due to selectedSubmission logic.
  // We never render calendar based on selectedSubmission anymore.

  // -----------------------------
  // LOADERS (keep them aligned with your existing routes)
  // -----------------------------
  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      // API returns { ok, submissions: [...] }
      const list = Array.isArray(data) ? data : Array.isArray(data?.submissions) ? data.submissions : [];
      setSubmissions(list);
    } catch {
      // swallow for UI; you can add toast later
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      // swallow
    }
  }, []);

  // Applicants come from submissions filtered by type - no separate endpoint needed
  const loadApplicants = useCallback(() => {
    // no-op: applicants are derived from submissions via isJobApplication filter
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      // API returns { ok: true, jobs: [...] }
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch {
      // swallow
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      const normalized: Appointment[] = Array.isArray(data)
        ? data.map((a: any) => ({
            id: a.id,
            title: a.title || a.service || 'Appointment',
            start: new Date(a.start),
            end: new Date(a.end),
            clientId: a.clientId,
            clientName: a.clientName,
          }))
        : [];
      setAppointments(normalized);
    } catch {
      // swallow
    }
  }, []);

  const loadGoogleEvents = useCallback(async () => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();
      const res = await fetch(`/api/google-events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.events)) {
        const mapped: Appointment[] = data.events
          .filter((e: any) => e.isGoogleOnly)
          .map((e: any) => ({
            id: e.id,
            title: e.title || 'Google Calendar',
            start: new Date(e.start),
            end: new Date(e.end),
            source: 'google' as const,
            isGoogleOnly: true,
            googleEventId: e.googleEventId,
          }));
        setGoogleEvents(mapped);
        if (data.linked) setIsGoogleLinked(true);
      }
    } catch {
      // swallow
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    loadSubmissions();
    loadClients();
    loadApplicants();
    loadJobs();
    loadAppointments();
    loadGoogleEvents();
  }, [loggedIn, loadSubmissions, loadClients, loadApplicants, loadJobs, loadAppointments, loadGoogleEvents]);

  // Sync activePanel with scroll position (for swipe gestures)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = slider.clientWidth;
        const index = Math.round(slider.scrollLeft / width);
        const key = PANEL_ORDER[Math.min(PANEL_ORDER.length - 1, Math.max(0, index))];
        setActivePanel(key);
      });
    };

    slider.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      slider.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Check Google Calendar link status for "green light"
  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : { linked: false }))
      .then((data) => {
        if (typeof data?.linked === 'boolean') {
          setIsGoogleLinked(data.linked);
        }
      })
      .catch(() => {
        setIsGoogleLinked(false);
      });
  }, []);

  // -----------------------------
  // CALENDAR DnD
  // -----------------------------
  const calendarEvents = useMemo(() => {
    const local = appointments.map((appt) => ({
      ...appt,
      start: appt.start,
      end: appt.end,
      title: appt.clientName ? `${appt.title} - ${appt.clientName}` : appt.title,
      source: 'local' as const,
    }));
    // Google-only events (not already synced locally) shown with a different label
    const googleOnly = googleEvents.map((evt) => ({
      ...evt,
      title: `[G] ${evt.title}`,
      source: 'google' as const,
    }));
    return [...local, ...googleOnly];
  }, [appointments, googleEvents]);

  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
        }),
      });
      loadAppointments();
    } catch {
      // swallow
    }
  }, [loadAppointments]);

  // -----------------------------
  // ADD CUSTOMER
  // -----------------------------
  const submitAddCustomer = useCallback(async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) return;

    setAddingCustomer(true);
    try {
      const res = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          tier: 'Manual',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create client');
      }

      setShowAddCustomer(false);
      setNewCustomer({ name: '', email: '', phone: '' });

      // 🔑 CRITICAL: refresh both data buckets
      await Promise.all([
        loadClients(),      // real clients
        loadSubmissions(),  // historical intake / audit trail
      ]);
    } catch (e: any) {
      alert(e?.message || 'Failed to create customer');
    } finally {
      setAddingCustomer(false);
    }
  }, [newCustomer, loadClients, loadSubmissions]);

  // -----------------------------
  // DELETE CLIENT
  // -----------------------------
  const deleteClient = useCallback(async () => {
    if (!selectedClient) return;

    const ok = window.confirm(
      `Delete ${selectedClient.name}?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setDeletingClient(true);
    try {
      const res = await fetch(`/api/clients?id=${selectedClient.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete client');
      }

      setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
      setSelectedClient(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete client');
    } finally {
      setDeletingClient(false);
    }
  }, [selectedClient]);

  // -----------------------------
  // JOB CRUD
  // -----------------------------
  const openNewJob = useCallback(() => {
    setEditingJob(null);
    setJobForm({ title: '', location: '', type: '', description: '' });
    setShowJobModal(true);
  }, []);

  const openEditJob = useCallback((job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      location: job.location,
      type: job.type,
      description: job.description || '',
    });
    setShowJobModal(true);
  }, []);

  const saveJob = useCallback(async () => {
    if (!jobForm.title.trim()) {
      alert('Title is required');
      return;
    }

    const method = editingJob ? 'PUT' : 'POST';
    const url = '/api/jobs_admin';
    const adminSecret = sessionStorage.getItem('adminSecret') || 'password123';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify(
          editingJob
            ? { id: editingJob.id, ...jobForm }
            : jobForm
        ),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to save job');
      }

      setShowJobModal(false);
      setEditingJob(null);
      setJobForm({ title: '', location: '', type: '', description: '' });
      loadJobs();
    } catch (e: any) {
      alert(e?.message || 'Failed to save job');
    }
  }, [editingJob, jobForm, loadJobs]);

  const deleteJob = useCallback(async (id: string) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;

    const adminSecret = sessionStorage.getItem('adminSecret') || 'password123';

    try {
      const res = await fetch(`/api/jobs_admin?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-secret': adminSecret,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete job');
      }

      loadJobs();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete job');
    }
  }, [loadJobs]);

  // -----------------------------
  // APPOINTMENTS CRUD
  // -----------------------------
  const openCreateAppointment = useCallback((start: Date, end: Date) => {
    setEditingAppointment(null);
    setAppointmentForm({
      clientId: '',
      clientName: '',
      service: '',
      start: start.toISOString(),
      end: end.toISOString(),
      notes: '',
    });
    setShowAppointmentModal(true);
  }, []);

  const openEditAppointment = useCallback((appt: Appointment) => {
    setEditingAppointment(appt);
    setAppointmentForm({
      clientId: appt.clientId || '',
      clientName: appt.clientName || '',
      service: appt.title || '',
      start: appt.start.toISOString(),
      end: appt.end.toISOString(),
      notes: '',
    });
    setShowAppointmentModal(true);
  }, []);

  const saveAppointment = useCallback(async () => {
    const method = editingAppointment ? 'PUT' : 'POST';

    const payload = {
      ...(editingAppointment ? { id: editingAppointment.id } : {}),
      clientId: appointmentForm.clientId,
      clientName: appointmentForm.clientName,
      service: appointmentForm.service,
      start: appointmentForm.start,
      end: appointmentForm.end,
      notes: appointmentForm.notes,
    };

    await fetch('/api/appointments', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setShowAppointmentModal(false);
    setEditingAppointment(null);
    loadAppointments();
  }, [editingAppointment, appointmentForm, loadAppointments]);

  const deleteAppointment = useCallback(async () => {
    if (!editingAppointment) return;
    if (!confirm('Delete this appointment?')) return;

    await fetch(`/api/appointments?id=${editingAppointment.id}`, {
      method: 'DELETE',
    });

    setShowAppointmentModal(false);
    setEditingAppointment(null);
    loadAppointments();
  }, [editingAppointment, loadAppointments]);

  // Style Google-only events differently
  const eventPropGetter = useCallback((event: any) => {
    if (event.source === 'google') {
      return {
        style: {
          backgroundColor: '#4285F4',
          borderColor: '#3367D6',
          opacity: 0.85,
        },
      };
    }
    return {};
  }, []);

  // Calendar event handlers (must be after CRUD functions)
  const handleSelectEvent = useCallback((event: any) => {
    if (event.source === 'google') return; // Google-only events are read-only
    openEditAppointment(event);
  }, [openEditAppointment]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    openCreateAppointment(slotInfo.start, slotInfo.end);
  }, [openCreateAppointment]);

  // -----------------------------
  // GUARD: LOGIN
  // -----------------------------
  if (!loggedIn) {
    return (
      <section className="min-h-screen py-20 bg-base-200 flex items-center justify-center">
        <Login onLoginSuccess={handleLoginSuccess} onCancel={() => (window.location.hash = '#/')} />
      </section>
    );
  }

  // Clients panel content
  const clientsPanel = (
    <PanelShell
      title="Clients"
      right={
        <button
          onClick={() => setShowAddCustomer(true)}
          className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Add
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {clients.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No clients found.</div>
          ) : (
            clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`w-full text-left bg-gray-50 rounded-lg p-3 border hover:bg-gray-100 transition ${
                  selectedClient?.id === c.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-900 truncate">{c.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    {c.phone && (
                      <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400 shrink-0" />
                        {c.phone}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                    c.tier === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{c.tier || 'New'}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {selectedClient && (
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-900">Details</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="px-2 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={deleteClient}
                    disabled={deletingClient}
                    className="px-2 py-1 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingClient ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <div><span className="font-semibold">Name:</span> {selectedClient.name}</div>
                <div className="break-all"><span className="font-semibold">Email:</span> {selectedClient.email}</div>
                {selectedClient.phone && <div><span className="font-semibold">Phone:</span> {selectedClient.phone}</div>}
                <div><span className="font-semibold">Tier:</span> {selectedClient.tier || 'New'}</div>
                {selectedClient.createdAt && (
                  <div><span className="font-semibold">Added:</span> {new Date(selectedClient.createdAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelShell>
  );

  // Job applicants panel content
  const applicantsPanel = (
    <PanelShell title="Job Applicants">
      <div className="space-y-3">
        {submissionApplicants.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No job applications found.</div>
        ) : (
          submissionApplicants.map((s) => (
            <div key={s.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                  <div className="mt-1 text-sm text-gray-600 truncate">{s.email}</div>
                  {s.phone && <div className="mt-1 text-sm text-gray-600">{s.phone}</div>}
                  {s.service && <div className="mt-1 text-xs text-primary font-medium">{s.service}</div>}
                </div>
                <span className="text-xs text-gray-500 shrink-0">{new Date(s.timestamp).toLocaleDateString()}</span>
              </div>
              {s.message && (
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap break-words">{s.message}</div>
              )}
            </div>
          ))
        )}
      </div>
    </PanelShell>
  );

  // Jobs panel content
  const jobsPanel = (
    <PanelShell
      title="Jobs"
      right={
        <div className="flex gap-2">
          <button
            onClick={openNewJob}
            className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark"
          >
            + Add
          </button>
          <button
            onClick={loadJobs}
            className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Reload
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No jobs found.</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {job.location} · {job.type}
                  </p>
                </div>
              </div>
              {job.description && (
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap break-words">{job.description}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEditJob(job)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteJob(String(job.id))}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PanelShell>
  );

  // Calendar panel content
  const calendarPanel = (
    <PanelShell
      title="Calendar"
      right={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { loadAppointments(); loadGoogleEvents(); }}
            className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Reload
          </button>

          {isGoogleLinked ? (
            <div className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Synced</span>
              <button
                onClick={() =>
                  fetch('/api/auth/unlink', { method: 'POST' })
                    .then(() => setIsGoogleLinked(false))
                    .catch(() => setIsGoogleLinked(false))
                }
                className="text-[10px] text-gray-500 underline ml-1"
              >
                Unlink
              </button>
            </div>
          ) : (
            <button
              onClick={() => { window.location.href = '/api/auth/start'; }}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1"
            >
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                alt="Google"
                className="w-4 h-4"
              />
              <span>Link Google</span>
            </button>
          )}
        </div>
      }
    >
      <div className="rounded-lg border bg-white overflow-hidden">
        <div style={{ height: isMobile ? 'calc(100dvh - 280px)' : '500px', minHeight: '350px' }}>
          <div className="h-full w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className={`h-full ${calendarView === 'day' || calendarView === 'agenda' ? 'w-full' : 'min-w-[800px]'}`}>
              <DnDCalendar
                localizer={localizer}
                events={calendarEvents as any}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                eventPropGetter={eventPropGetter as any}
                selectable
                resizable
                draggableAccessor={(event: any) => event.source !== 'google'}
                defaultView={isMobile ? 'day' : 'week'}
                view={calendarView as any}
                onView={(view: string) => setCalendarView(view)}
                views={isMobile ? ['day', 'agenda'] : ['month', 'week', 'day', 'agenda']}
                step={30}
                showMultiDayTimes
                style={{ height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );

  // Forms panel content
  const formsPanel = (
    <PanelShell title="Forms">
      <div className="w-full max-w-xl mx-auto">
        <ClientIntakeForm />
      </div>
    </PanelShell>
  );

  const panels: Record<AdminPanelKey, React.ReactNode> = {
    clients: clientsPanel,
    applicants: applicantsPanel,
    jobs: jobsPanel,
    calendar: calendarPanel,
    forms: formsPanel,
  };

  const PANEL_LABELS: Record<AdminPanelKey, string> = {
    clients: 'Clients',
    applicants: 'Applicants',
    jobs: 'Jobs',
    calendar: 'Calendar',
    forms: 'Forms',
  };

  const panelCounts: Record<AdminPanelKey, number | string> = {
    clients: clients.length,
    applicants: submissionApplicants.length,
    jobs: jobs.length,
    calendar: appointments.length,
    forms: '',
  };

  return (
    <section className="min-h-screen bg-base-200 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin</h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tab bar */}
          <div className="mt-3 -mx-3 sm:-mx-4">
            <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200">
              {PANEL_ORDER.map((key) => {
                const active = activePanel === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePanel(key)}
                    className={`flex-1 min-w-0 px-2 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                      active ? 'text-primary border-primary' : 'text-gray-500 border-transparent'
                    }`}
                  >
                    {PANEL_LABELS[key]}
                    {panelCounts[key] !== '' && (
                      <span className="ml-1 text-gray-400">({panelCounts[key]})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active panel content - one at a time, no horizontal scroll */}
        <div className="w-full">{panels[activePanel]}</div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <ModalShell title="Add Customer" onClose={() => setShowAddCustomer(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="customer@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="(###) ###-####"
              />
            </div>

            <button
              disabled={addingCustomer}
              onClick={submitAddCustomer}
              className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-60"
            >
              {addingCustomer ? 'Adding...' : 'Create Customer'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <ModalShell
          title={editingJob ? 'Edit Job' : 'New Job'}
          onClose={() => setShowJobModal(false)}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input
                placeholder="e.g., Residential Cleaner"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input
                placeholder="e.g., North Jersey"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <input
                placeholder="e.g., Full Time, Part Time, Contract"
                value={jobForm.type}
                onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Job description and requirements..."
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={saveJob}
              className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark"
            >
              {editingJob ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <ModalShell
          title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          onClose={() => setShowAppointmentModal(false)}
        >
          <div className="space-y-3">
            <input
              placeholder="Client name"
              value={appointmentForm.clientName}
              onChange={(e) =>
                setAppointmentForm((p) => ({ ...p, clientName: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />

            <input
              placeholder="Service"
              value={appointmentForm.service}
              onChange={(e) =>
                setAppointmentForm((p) => ({ ...p, service: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />

            <label className="text-sm font-semibold">Start</label>
            <input
              type="datetime-local"
              value={appointmentForm.start.slice(0, 16)}
              onChange={(e) =>
                setAppointmentForm((p) => ({
                  ...p,
                  start: new Date(e.target.value).toISOString(),
                }))
              }
              className="w-full px-3 py-2 border rounded"
            />

            <label className="text-sm font-semibold">End</label>
            <input
              type="datetime-local"
              value={appointmentForm.end.slice(0, 16)}
              onChange={(e) =>
                setAppointmentForm((p) => ({
                  ...p,
                  end: new Date(e.target.value).toISOString(),
                }))
              }
              className="w-full px-3 py-2 border rounded"
            />

            <textarea
              placeholder="Notes (optional)"
              value={appointmentForm.notes}
              onChange={(e) =>
                setAppointmentForm((p) => ({ ...p, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />

            <button
              onClick={saveAppointment}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg"
            >
              Save Appointment
            </button>

            {editingAppointment && (
              <button
                onClick={deleteAppointment}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg"
              >
                Delete Appointment
              </button>
            )}
          </div>
        </ModalShell>
      )}
    </section>
  );
}
