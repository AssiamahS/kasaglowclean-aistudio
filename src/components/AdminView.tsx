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
  id: string;
  title: string;
  location: string;
  type: string;
  description?: string;
  createdAt?: string;
}

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientId?: string;
  clientName?: string;
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

  const [clients, setClients] = useState<Client[]>([]);
  const [allApplicants, setAllApplicants] = useState<JobApplicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // -----------------------------
  // UI STATE
  // -----------------------------
  const [activePanel, setActivePanel] = useState<AdminPanelKey>('clients');

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
    const panel = panelRefs.current[key];
    if (!slider || !panel) return;

    slider.scrollTo({
      left: panel.offsetLeft,
      behavior: 'smooth',
    });

    setActivePanel(key);
  }, []);

  // Add Customer Modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [addingCustomer, setAddingCustomer] = useState(false);

  // -----------------------------
  // HELPERS
  // -----------------------------
  const isJobApplication = useCallback((sub: Submission) => {
    const msg = (sub.message || '').toLowerCase();
    return msg.includes('job') || msg.includes('application') || msg.includes('apply');
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
      setSubmissions(Array.isArray(data) ? data : []);
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

  const loadApplicants = useCallback(async () => {
    try {
      const res = await fetch('/api/applicants');
      const data = await res.json();
      setAllApplicants(Array.isArray(data) ? data : []);
    } catch {
      // swallow
    }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
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
            start: new Date(a.start || a.startTime || a.dateTime || a.date),
            end: new Date(a.end || a.endTime || a.dateTimeEnd || a.date),
            clientId: a.clientId,
            clientName: a.clientName,
          }))
        : [];
      setAppointments(normalized);
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
  }, [loggedIn, loadSubmissions, loadClients, loadApplicants, loadJobs, loadAppointments]);

  // -----------------------------
  // CALENDAR DnD
  // -----------------------------
  const calendarEvents = useMemo(() => {
    return appointments.map((appt) => ({
      ...appt,
      start: appt.start,
      end: appt.end,
      title: appt.clientName ? `${appt.title} - ${appt.clientName}` : appt.title,
    }));
  }, [appointments]);

  const handleSelectEvent = useCallback((event: any) => {
    // you can open a modal later; keep minimal now
    // alert(event.title);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // you can implement "create appt" here; keep minimal now
  }, []);

  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, start, end }),
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
        body: JSON.stringify({ ...newCustomer, tier: 'New' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create customer');
      }

      setShowAddCustomer(false);
      setNewCustomer({ name: '', email: '', phone: '' });
      loadClients();
    } catch (e: any) {
      alert(e?.message || 'Failed to create customer');
    } finally {
      setAddingCustomer(false);
    }
  }, [newCustomer, loadClients]);

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

  return (
    <section className="min-h-screen py-12 bg-base-200">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 text-sm">Swipe between sections on mobile. Everything stays on one page.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Sticky tab bar (horizontal scroll, mobile-safe) */}
          <div className="mt-4 -mx-4 sm:mx-0">
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 sm:px-0 border-b border-gray-200">
              {PANEL_ORDER.map((key) => {
                const label =
                  key === 'clients'
                    ? 'Clients'
                    : key === 'applicants'
                    ? 'Job Applicants'
                    : key === 'jobs'
                    ? 'Jobs'
                    : key === 'calendar'
                    ? 'Calendar'
                    : 'Forms';

                const count =
                  key === 'clients'
                    ? submissionClients.length
                    : key === 'applicants'
                    ? submissionApplicants.length
                    : key === 'jobs'
                    ? jobs.length
                    : key === 'calendar'
                    ? appointments.length
                    : '';

                const active = activePanel === key;

                return (
                  <button
                    key={key}
                    onClick={() => scrollToPanel(key)}
                    className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                      active ? 'text-primary border-primary' : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    {label}
                    {count !== '' && <span className="ml-2 text-sm text-gray-500">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* HORIZONTAL SLIDER (one-page, swipeable) */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth rounded-lg"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* CLIENTS */}
          <div
            ref={(el) => {
              panelRefs.current.clients = el;
            }}
            className="min-w-full snap-start px-1"
          >
            <PanelShell
              title="Clients"
              right={
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  + Add Customer
                </button>
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {submissionClients.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No client submissions found.</div>
                  ) : (
                    submissionClients.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSubmission(s)}
                        className={`w-full text-left bg-gray-50 rounded-lg p-4 border hover:bg-gray-100 transition ${
                          selectedSubmission?.id === s.id ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">{s.name}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-gray-400" />
                              {s.email}
                            </div>
                            <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              {s.phone}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(s.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-primary">Service: {s.service}</div>
                      </button>
                    ))
                  )}
                </div>

                <div className="lg:sticky lg:top-24 h-fit">
                  {selectedSubmission ? (
                    <div className="bg-white rounded-lg border p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Submission Details</h3>
                        <button
                          onClick={() => setSelectedSubmission(null)}
                          className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <div><span className="font-semibold">Name:</span> {selectedSubmission.name}</div>
                        <div><span className="font-semibold">Email:</span> {selectedSubmission.email}</div>
                        <div><span className="font-semibold">Phone:</span> {selectedSubmission.phone}</div>
                        <div><span className="font-semibold">Service:</span> {selectedSubmission.service}</div>
                        {selectedSubmission.message && (
                          <div className="pt-2">
                            <div className="font-semibold">Message:</div>
                            <div className="text-gray-600 whitespace-pre-wrap">{selectedSubmission.message}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
                      Select a client submission to view details.
                    </div>
                  )}
                </div>
              </div>
            </PanelShell>
          </div>

          {/* JOB APPLICANTS */}
          <div
            ref={(el) => {
              panelRefs.current.applicants = el;
            }}
            className="min-w-full snap-start px-1"
          >
            <PanelShell title="Job Applicants">
              <div className="space-y-3">
                {submissionApplicants.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No job applications found.</div>
                ) : (
                  submissionApplicants.map((s) => (
                    <div key={s.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="mt-1 text-sm text-gray-600">{s.email}</div>
                          {s.phone && <div className="mt-1 text-sm text-gray-600">{s.phone}</div>}
                        </div>
                        <span className="text-xs text-gray-500">{new Date(s.timestamp).toLocaleDateString()}</span>
                      </div>
                      {s.message && (
                        <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{s.message}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </PanelShell>
          </div>

          {/* JOBS */}
          <div
            ref={(el) => {
              panelRefs.current.jobs = el;
            }}
            className="min-w-full snap-start px-1"
          >
            <PanelShell
              title="Jobs"
              right={
                <div className="flex gap-2">
                  <button
                    onClick={loadJobs}
                    className="px-4 py-2 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
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
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {job.location} · {job.type}
                          </p>
                        </div>
                      </div>
                      {job.description && (
                        <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </PanelShell>
          </div>

          {/* CALENDAR */}
          <div
            ref={(el) => {
              panelRefs.current.calendar = el;
            }}
            className="min-w-full snap-start px-1"
          >
            <PanelShell
              title="Appointment Calendar"
              right={
                <button
                  onClick={loadAppointments}
                  className="px-4 py-2 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Reload
                </button>
              }
            >
              {/* Calendar containment: keeps DnD usable on mobile */}
              <div className="rounded-lg border bg-white">
                <div className="h-[70vh] min-h-[520px]">
                  <div className="h-full w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Inner min-width keeps week view usable */}
                    <div className="min-w-[900px] h-full">
                      <DnDCalendar
                        localizer={localizer}
                        events={calendarEvents as any}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventDrop}
                        selectable
                        resizable
                        draggableAccessor={() => true}
                        defaultView={isMobile ? 'day' : 'week'}
                        views={['month', 'week', 'day', 'agenda']}
                        step={30}
                        showMultiDayTimes
                        style={{ height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Mobile tip: scroll horizontally to see the full grid, then drag-and-drop appointments normally.
              </p>
            </PanelShell>
          </div>

          {/* FORMS */}
          <div
            ref={(el) => {
              panelRefs.current.forms = el;
            }}
            className="min-w-full snap-start px-1"
          >
            <PanelShell title="Forms">
              {/* Standardized width so it matches other panels */}
              <div className="w-full max-w-xl mx-auto">
                <ClientIntakeForm clients={clients as any} loadClients={loadClients} />
              </div>
            </PanelShell>
          </div>
        </div>
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
    </section>
  );
}
