import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Login from './Login';
import { MailIcon, PhoneIcon, UserIcon } from './IconComponents';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  timestamp: string;
  read?: boolean;
  resumeName?: string | null;
  resume_name?: string | null;
  resumeData?: string | null;
  resume_data?: string | null;
  resume_url?: string | null;
  remoteSaved?: boolean;
}

interface Client {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  services: string;
  frequency: string;
}

interface Appointment {
  id: number;
  clientId: number | string;
  clientName: string;
  dateTime: string;
  service: string;
  status: string;
  notes: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

// Setup calendar localizer
const locales = {
  'en-US': enUS
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Enable drag and drop on calendar
const DnDCalendar = withDragAndDrop(Calendar);

const AdminView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [jobForm, setJobForm] = useState({ title: '', location: '', description: '', type: '', active: true });
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [activeTab, setActiveTab] = useState<'clients' | 'applicants' | 'jobs' | 'calendar' | 'forms'>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newAppt, setNewAppt] = useState({ clientId: '', date: '', time: '', service: '', notes: '' });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ date: '', time: '', service: '', notes: '' });

  // Convert appointments to calendar events
  const calendarEvents = useMemo(() => {
    return appointments.map(appt => {
      const start = new Date(appt.dateTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default duration
      const clientName = appt.clientName || `Client #${appt.clientId}`;
      return {
        id: appt.id,
        title: `${clientName} - ${appt.service || 'Cleaning'}`,
        start,
        end,
        resource: appt
      };
    });
  }, [appointments]);

  // Generate consistent color for each client
  const getClientColor = useCallback((clientId: number | string) => {
    const colors = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#84cc16', // Lime
      '#6366f1', // Indigo
    ];
    const hash = String(clientId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  // Handle event drag and drop (reschedule)
  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    try {
      await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          dateTime: start.toISOString(),
          service: event.resource.service,
          status: event.resource.status,
          notes: event.resource.notes
        })
      });
      loadAppointments();
    } catch (err) {
      console.error('Failed to reschedule appointment', err);
      alert('Failed to reschedule appointment');
    }
  }, []);

  // Handle selecting a time slot to create new appointment
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const date = format(slotInfo.start, 'yyyy-MM-dd');
    const time = format(slotInfo.start, 'HH:mm');
    setNewAppt({ ...newAppt, date, time });
  }, [newAppt]);

  // Handle clicking an existing event
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  useEffect(() => {
    // Check if user is already authenticated in this session
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
      loadJobs();
      loadClients();
      loadAppointments();
    }
  }, [isAuthenticated]);

  // Listen for localStorage changes so admin view updates when submissions are saved in another tab/window
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'leadSubmissions') {
        // reload submissions to merge remote + local
        loadSubmissions();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isAuthenticated]);

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const body = await res.json();
      if (body?.ok && Array.isArray(body.jobs)) setJobs(body.jobs);
    } catch (e) {
      console.error('Failed to load jobs', e);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      const remoteClients = Array.isArray(data) ? data : [];

      // Also include localStorage submissions that are clients
      const stored = localStorage.getItem('leadSubmissions');
      const localData: Submission[] = stored ? JSON.parse(stored) : [];
      const localClients = localData
        .filter(sub => !isJobApplication(sub))
        .map((sub, idx) => ({
          id: `local-${sub.id}` as any, // Use string ID for local clients
          name: sub.name,
          email: sub.email,
          phone: sub.phone,
          tier: 'New',
          services: sub.service,
          frequency: 'One-Time'
        }));

      // Merge remote and local clients
      setClients([...remoteClients, ...localClients]);
    } catch (e) {
      console.error('Failed to load clients', e);
    }
  };

  const loadAppointments = async () => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const res = await fetch(`/api/appointments?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load appointments', e);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();

      // always merge with localStorage entries so demo submissions show up in admin
      const stored = localStorage.getItem('leadSubmissions');
      const localData: Submission[] = stored ? JSON.parse(stored) : [];

      if (data.ok && data.submissions) {
        // remote submissions might have numeric ids; normalize to string
        const remote: Submission[] = data.submissions.map((s: any) => ({ ...s, id: String(s.id) }));
        const merged = [...localData, ...remote].sort((a: Submission, b: Submission) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSubmissions(merged);
      } else {
        console.error('Failed to load submissions from remote:', data?.error);
        const merged = localData.sort((a: Submission, b: Submission) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSubmissions(merged);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      // If remote fetch failed, use localStorage
      const stored = localStorage.getItem('leadSubmissions');
      const localData: Submission[] = stored ? JSON.parse(stored) : [];
      setSubmissions(localData.sort((a: Submission, b: Submission) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('adminAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setSelectedSubmission(null);
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      });

      if (response.ok) {
        const updated = submissions.map(sub =>
          sub.id === id ? { ...sub, read: true } : sub
        );
        setSubmissions(updated);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      // Fallback to localStorage
      const updated = submissions.map(sub =>
        sub.id === id ? { ...sub, read: true } : sub
      );
      setSubmissions(updated);
      localStorage.setItem('leadSubmissions', JSON.stringify(updated));
    }
  };

  const deleteSubmission = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        const response = await fetch(`/api/submissions?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const updated = submissions.filter(sub => sub.id !== id);
          setSubmissions(updated);
          setSelectedSubmission(null);
        }
      } catch (error) {
        console.error('Error deleting submission:', error);
        // Fallback to localStorage
        const updated = submissions.filter(sub => sub.id !== id);
        setSubmissions(updated);
        localStorage.setItem('leadSubmissions', JSON.stringify(updated));
        setSelectedSubmission(null);
      }
    }
  };

  // Jobs admin actions
  const openNewJobForm = () => {
    setEditingJob(null);
    setJobForm({ title: '', location: '', description: '', type: '', active: true });
    setJobFormOpen(true);
  };

  const openEditJobForm = (job: any) => {
    setEditingJob(job);
    setJobForm({ title: job.title || '', location: job.location || '', description: job.description || '', type: job.type || '', active: job.active ? true : false });
    setJobFormOpen(true);
  };

  const submitJobForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adminToken = sessionStorage.getItem('adminToken') || '';
      if (editingJob) {
        await fetch('/api/jobs_admin', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminToken }, body: JSON.stringify({ id: editingJob.id, ...jobForm }) });
      } else {
        await fetch('/api/jobs_admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminToken }, body: JSON.stringify(jobForm) });
      }
      setJobFormOpen(false);
      await loadJobs();
    } catch (err) {
      console.error('job form submit error', err);
    }
  };

  const deleteJob = async (id: number) => {
    if (!confirm('Delete this job?')) return;
    try {
      const adminToken = sessionStorage.getItem('adminToken') || '';
      await fetch(`/api/jobs_admin?id=${id}`, { method: 'DELETE', headers: { 'x-admin-secret': adminToken } });
      await loadJobs();
    } catch (err) {
      console.error('delete job', err);
    }
  };

  // Helper function to determine if a submission is a job application
  const isJobApplication = (sub: Submission): boolean => {
    const jobTitles = ['Residential Cleaner', 'Move-In / Move-Out Specialist', 'Commercial Cleaner'];
    return jobTitles.includes(sub.service) ||
           !!(sub.resume_url || sub.resume_data || sub.resumeData);
  };

  // Filter submissions by tab (clients vs applicants) and read status
  const filteredSubmissions = submissions.filter(sub => {
    // First filter by tab
    const isApplicant = isJobApplication(sub);
    if (activeTab === 'applicants' && !isApplicant) return false;
    if (activeTab === 'clients' && isApplicant) return false;

    // Then filter by read status
    if (filter === 'all') return true;
    if (filter === 'unread') return !sub.read;
    if (filter === 'read') return sub.read;
    return true;
  });

  const allClients = submissions.filter(sub => !isJobApplication(sub));
  const allApplicants = submissions.filter(sub => isJobApplication(sub));
  const unreadCount = submissions.filter(sub => !sub.read).length;
  const unreadClients = allClients.filter(sub => !sub.read).length;
  const unreadApplicants = allApplicants.filter(sub => !sub.read).length;

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen py-20 bg-base-200 flex items-center justify-center">
        <Login
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => window.location.hash = '#/'}
        />
      </section>
    );
  }

  // Forms tab - completely isolated view
  if (activeTab === 'forms') {
    return (
      <section className="min-h-screen py-12 bg-base-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Simple Header with Logout and Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">Client Intake Forms</h1>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('clients')}
                className="px-6 py-3 font-semibold transition-colors text-gray-600 hover:text-gray-900"
              >
                Clients
              </button>
              <button
                onClick={() => setActiveTab('applicants')}
                className="px-6 py-3 font-semibold transition-colors text-gray-600 hover:text-gray-900"
              >
                Job Applicants
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className="px-6 py-3 font-semibold transition-colors text-gray-600 hover:text-gray-900"
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-6 py-3 font-semibold transition-colors text-gray-600 hover:text-gray-900"
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className="px-6 py-3 font-semibold transition-colors text-primary border-b-2 border-primary"
              >
                Forms
              </button>
            </div>
          </div>

          {/* Clean Forms Content */}
          <ClientIntakeForm clients={clients} loadClients={loadClients} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-12 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
              <p className="text-neutral mt-1">
                Total Submissions: {submissions.length}
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-error text-white text-xs font-bold rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('clients');
                setSelectedSubmission(null);
              }}
              className={`px-3 md:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'clients'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Clients
              {unreadClients > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-error text-white text-xs font-bold rounded-full">
                  {unreadClients}
                </span>
              )}
              <span className="ml-1 text-sm text-gray-500">({allClients.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('applicants');
                setSelectedSubmission(null);
              }}
              className={`px-3 md:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'applicants'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Job Applicants
              {unreadApplicants > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-error text-white text-xs font-bold rounded-full">
                  {unreadApplicants}
                </span>
              )}
              <span className="ml-1 text-sm text-gray-500">({allApplicants.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('jobs');
                setSelectedSubmission(null);
              }}
              className={`px-3 md:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'jobs'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jobs
              <span className="ml-1 text-sm text-gray-500">({jobs.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('calendar');
                setSelectedSubmission(null);
              }}
              className={`px-3 md:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'calendar'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
              <span className="ml-1 text-sm text-gray-500">({appointments.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('forms');
                setSelectedSubmission(null);
              }}
              className={`px-3 md:px-6 py-3 font-semibold transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'forms'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Forms
            </button>
          </div>

          {/* Filters (only for clients/applicants tabs) */}
          {activeTab !== 'calendar' && activeTab !== 'jobs' && activeTab !== 'forms' && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={loadSubmissions} className="px-3 py-2 border rounded text-sm md:text-base">Reload Submissions</button>
            {activeTab === 'clients' && (
              <button
                onClick={() => setActiveTab('forms')}
                className="px-3 md:px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm md:text-base"
              >
                + Add Customer
              </button>
            )}
            <button
              onClick={() => setFilter('all')}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({activeTab === 'clients' ? allClients.length : allApplicants.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread ({activeTab === 'clients' ? unreadClients : unreadApplicants})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                filter === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Read ({activeTab === 'clients' ? (allClients.length - unreadClients) : (allApplicants.length - unreadApplicants)})
            </button>
          </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'jobs' ? (
        <>
        {/* Jobs Tab */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
              <div className="flex gap-2">
                <button onClick={openNewJobForm} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark">Add Job</button>
                <button onClick={loadJobs} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Reload</button>
              </div>
            </div>
            <div className="space-y-4">
              {jobs.length === 0 && <div className="text-gray-500 text-center py-8">No jobs found.</div>}
              {jobs.map(job => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{job.location} · {job.type}</p>
                      {job.description && <p className="text-sm text-gray-700 mt-2">{job.description}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => openEditJobForm(job)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                      <button onClick={() => deleteJob(job.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {jobFormOpen && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{editingJob ? 'Edit Job' : 'New Job'}</h3>
              <form onSubmit={submitJobForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                  <input required placeholder="e.g., Residential Cleaner" value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input placeholder="e.g., Local" value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <input placeholder="e.g., Full Time / Part Time" value={jobForm.type} onChange={(e) => setJobForm({...jobForm, type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea placeholder="Job description..." value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark">Save Job</button>
                  <button type="button" onClick={() => setJobFormOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
        </>
        ) : activeTab !== 'calendar' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">No submissions found.</p>
              </div>
            ) : (
              filteredSubmissions.map(submission => (
                <div
                  key={submission.id}
                  onClick={() => {
                    setSelectedSubmission(submission);
                    if (!submission.read) {
                      markAsRead(submission.id);
                    }
                  }}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''
                  } ${!submission.read ? 'border-l-4 border-primary' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-primary" />
                        {submission.name}
                        {!submission.read && (
                          <span className="ml-2 px-2 py-0.5 bg-error text-white text-xs font-bold rounded">
                            NEW
                          </span>
                        )}
                        {submission.remoteSaved !== true && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded">LOCAL</span>
                        )}
                      </h3>
                    </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {new Date(submission.timestamp).toLocaleString()}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-400" />
                      {submission.email}
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      {submission.phone}
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-primary">
                    Service: {submission.service}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Submission Detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedSubmission ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
                  <button
                    onClick={() => deleteSubmission(selectedSubmission.id)}
                    className="px-4 py-2 bg-error text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                    <p className="text-lg text-gray-900">{selectedSubmission.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-lg text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                    <a
                      href={`tel:${selectedSubmission.phone}`}
                      className="text-lg text-primary hover:underline"
                    >
                      {selectedSubmission.phone}
                    </a>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Service Requested</label>
                    <p className="text-lg text-gray-900">{selectedSubmission.service}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Message</label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedSubmission.message || 'No message provided'}
                    </p>
                  </div>

                  {(selectedSubmission.resume_url || selectedSubmission.resumeData || selectedSubmission.resume_data) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Resume</label>
                      {selectedSubmission.resume_url ? (
                        <a href={`/api/resume?key=${encodeURIComponent(String(selectedSubmission.resume_url))}`} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                          Download Resume ({selectedSubmission.resume_name || 'file'})
                        </a>
                      ) : (
                        <a href={selectedSubmission.resumeData || selectedSubmission.resume_data || '#'} download={selectedSubmission.resumeName || selectedSubmission.resume_name || 'resume'} className="text-primary hover:underline">
                          Download Resume ({selectedSubmission.resumeName || selectedSubmission.resume_name || 'file'})
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Submitted On</label>
                    <p className="text-gray-700">
                      {new Date(selectedSubmission.timestamp).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedSubmission.read
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedSubmission.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Select a submission to view details</p>
              </div>
            )}
          </div>
        </div>
        ) : (
        <>
        {/* Calendar Tab Content */}
        <div className="space-y-6">
          {/* Visual Calendar */}
          <div className="bg-white rounded-lg shadow-md p-3 md:p-6" style={{ height: '500px' }}>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Appointment Calendar</h3>
            <div style={{ height: 'calc(100% - 2.5rem)' }}>
              <DnDCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                selectable
                resizable
                draggableAccessor={() => true}
                defaultView="day"
                views={['month', 'week', 'day', 'agenda']}
                step={30}
                showMultiDayTimes
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: getClientColor(event.resource.clientId),
                    borderRadius: '5px',
                    opacity: 0.8,
                    color: 'white',
                    border: '0px',
                    display: 'block'
                  }
                })}
              />
            </div>
          </div>

          {/* Quick Create Appointment Form */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Quick Schedule Appointment</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client</label>
                <select
                  value={newAppt.clientId}
                  onChange={e => setNewAppt({ ...newAppt, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
                <input
                  type="text"
                  value={newAppt.service}
                  onChange={e => setNewAppt({ ...newAppt, service: e.target.value })}
                  placeholder="e.g., Deep Cleaning"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newAppt.date}
                  onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={newAppt.time}
                  onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newAppt.notes}
                  onChange={e => setNewAppt({ ...newAppt, notes: e.target.value })}
                  placeholder="Special instructions..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                if (!newAppt.clientId || !newAppt.date || !newAppt.time) {
                  alert('Please fill in client, date, and time');
                  return;
                }
                const selectedClient = clients.find(c => String(c.id) === String(newAppt.clientId));
                const dateTime = `${newAppt.date}T${newAppt.time}:00`;
                await fetch('/api/appointments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    clientId: newAppt.clientId,
                    clientName: selectedClient?.name || 'Unknown',
                    dateTime,
                    service: newAppt.service,
                    notes: newAppt.notes
                  })
                });
                setNewAppt({ clientId: '', date: '', time: '', service: '', notes: '' });
                loadAppointments();
              }}
              className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create Appointment
            </button>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments scheduled</p>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{appt.clientName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(appt.dateTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{appt.service}</p>
                        {appt.notes && <p className="text-xs text-gray-400 mt-2">{appt.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (confirm('Delete this appointment?')) {
                              await fetch(`/api/appointments?id=${appt.id}`, { method: 'DELETE' });
                              loadAppointments();
                            }
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event Details/Edit Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setSelectedEvent(null); setIsEditing(false); }}>
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Appointment' : 'Appointment Details'}</h3>
                  <button onClick={() => { setSelectedEvent(null); setIsEditing(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {!isEditing ? (
                  // View Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600">Client</label>
                      <p className="text-gray-900">{selectedEvent.resource.clientName || `Client #${selectedEvent.resource.clientId}`}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600">Service</label>
                      <p className="text-gray-900">{selectedEvent.resource.service || 'Cleaning'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600">Date & Time</label>
                      <p className="text-gray-900">{selectedEvent.start.toLocaleString()}</p>
                    </div>
                    {selectedEvent.resource.notes && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-600">Notes</label>
                        <p className="text-gray-900">{selectedEvent.resource.notes}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t flex gap-2">
                      <button
                        onClick={() => {
                          const dt = new Date(selectedEvent.resource.dateTime);
                          setEditForm({
                            date: dt.toISOString().split('T')[0],
                            time: dt.toTimeString().slice(0, 5),
                            service: selectedEvent.resource.service || '',
                            notes: selectedEvent.resource.notes || ''
                          });
                          setIsEditing(true);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this appointment?')) {
                            await fetch(`/api/appointments?id=${selectedEvent.id}`, { method: 'DELETE' });
                            loadAppointments();
                            setSelectedEvent(null);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Service</label>
                      <input
                        type="text"
                        value={editForm.service}
                        onChange={e => setEditForm({ ...editForm, service: e.target.value })}
                        placeholder="e.g., Deep Cleaning"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={editForm.notes}
                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="pt-4 border-t flex gap-2">
                      <button
                        onClick={async () => {
                          const dateTime = `${editForm.date}T${editForm.time}:00`;
                          await fetch('/api/appointments', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: selectedEvent.id,
                              dateTime,
                              service: editForm.service,
                              status: selectedEvent.resource.status,
                              notes: editForm.notes
                            })
                          });
                          loadAppointments();
                          setSelectedEvent(null);
                          setIsEditing(false);
                        }}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </section>
  );
};

// Client Intake Form Component
const ClientIntakeForm: React.FC<{ clients: Client[], loadClients: () => void }> = ({ clients, loadClients }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    propertyType: 'Residential',
    services: [] as string[],
    frequency: 'One-Time',
    notes: '',
    quotedRate: '',
    deposit: '',
    paymentMethod: 'Cash',
    dateTime: ''
  });

  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => String(c.id) === clientId);
    if (client) {
      setSelectedClient(client);
      setIsEditing(false);

      // Parse message field to extract form data
      const message = client.message || '';
      const propertyMatch = message.match(/Property:\s*([^\n]+)/);
      const frequencyMatch = message.match(/Frequency:\s*([^\n]+)/);
      const addressMatch = message.match(/Address:\s*([^\n]+)/);
      const cityMatch = message.match(/City:\s*([^\n]+)/);
      const quotedMatch = message.match(/Quoted:\s*\$?([^\n]+)/);
      const depositMatch = message.match(/Deposit:\s*\$?([^\n]+)/);
      const paymentMatch = message.match(/Payment:\s*([^\n]+)/);
      const dateTimeMatch = message.match(/Preferred Date\/Time:\s*([^\n]+)/);
      const notesMatch = message.match(/Notes:\s*([^\n]+)/);

      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: addressMatch ? addressMatch[1].trim() : '',
        city: cityMatch ? cityMatch[1].trim() : '',
        propertyType: propertyMatch ? propertyMatch[1].trim() : 'Residential',
        services: client.services ? [client.services] : [],
        frequency: frequencyMatch ? frequencyMatch[1].trim() : 'One-Time',
        notes: notesMatch ? notesMatch[1].trim() : '',
        quotedRate: quotedMatch ? quotedMatch[1].trim() : '',
        deposit: depositMatch ? depositMatch[1].trim() : '',
        paymentMethod: paymentMatch ? paymentMatch[1].trim() : 'Cash',
        dateTime: dateTimeMatch ? dateTimeMatch[1].trim() : ''
      });
    } else {
      setSelectedClient(null);
      setIsEditing(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        propertyType: 'Residential',
        services: [] as string[],
        frequency: 'One-Time',
        notes: '',
        quotedRate: '',
        deposit: '',
        paymentMethod: 'Cash',
        dateTime: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (service: string) => {
    const services = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData({ ...formData, services });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Client Selector */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Client (or leave blank for new)</label>
        <select
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          onChange={(e) => handleSelectClient(e.target.value)}
          value={selectedClient?.id || ''}
        >
          <option value="">-- New Client or Select Existing --</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Divider Line */}
      <div className="border-t-2 border-gray-300 my-6"></div>

      {/* Main Form - Paper Style */}
      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
        {/* Header */}
        <div className="text-center mb-6 pb-6 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KASAGLOW CLEANING SERVICES</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Client Information Form</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold">Business Contact: Kasaglow Cleaning Services</p>
            <p>📍 Annandale, NJ 08801</p>
            <p>📞 (908) 417-5388</p>
            <p>✉️ info@kasaglowcleaning.com</p>
          </div>
        </div>

        {/* Client Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">CLIENT INFORMATION</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">• Full Name:</label>
              <input className="w-full px-4 py-2 border-2 border-gray-300 rounded" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">• Address:</label>
              <input className="w-full px-4 py-2 border-2 border-gray-300 rounded" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">• City, State, ZIP:</label>
              <input className="w-full px-4 py-2 border-2 border-gray-300 rounded" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">• Phone Number:</label>
              <input className="w-full px-4 py-2 border-2 border-gray-300 rounded" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">• Email Address:</label>
              <input className="w-full px-4 py-2 border-2 border-gray-300 rounded" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Service Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">SERVICE DETAILS</h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Property (check one):</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="propertyType" value="Residential" checked={formData.propertyType === 'Residential'} onChange={handleChange} />
                <span>Residential</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="propertyType" value="Commercial" checked={formData.propertyType === 'Commercial'} onChange={handleChange} />
                <span>Commercial</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Service (check all that apply):</label>
            <div className="grid grid-cols-2 gap-2">
              {['Standard Cleaning', 'Deep Cleaning', 'Move-In / Move-Out Cleaning', 'Post-Construction Cleaning', 'Office Cleaning', 'Carpet / Floor Care', 'Window Cleaning'].map(service => (
                <label key={service} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.services.includes(service)} onChange={() => handleServiceToggle(service)} />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency of Service:</label>
            <div className="grid grid-cols-2 gap-2">
              {['One-Time Cleaning', 'Weekly', 'Bi-Weekly', 'Monthly'].map(freq => (
                <label key={freq} className="flex items-center gap-2">
                  <input type="radio" name="frequency" value={freq} checked={formData.frequency === freq} onChange={handleChange} />
                  <span className="text-sm">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Cleaning Date(s) / Time(s):</label>
            <input className="w-full px-4 py-2 border-2 border-gray-300 rounded" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} />
          </div>
        </div>

        {/* Special Instructions */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">SPECIAL INSTRUCTIONS</h3>
          <p className="text-sm text-gray-600 mb-2">(Please list any special requests, cleaning preferences, or areas to focus on.)</p>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded"
          />
        </div>

        {/* Payment & Deposit */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">PAYMENT & DEPOSIT</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quoted Cleaning Rate:</label>
              <div className="flex items-center gap-2">
                <span className="text-lg">$</span>
                <input className="flex-1 px-4 py-2 border-2 border-gray-300 rounded" name="quotedRate" value={formData.quotedRate} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deposit Amount (required to secure service):</label>
              <div className="flex items-center gap-2">
                <span className="text-lg">$</span>
                <input className="flex-1 px-4 py-2 border-2 border-gray-300 rounded" name="deposit" value={formData.deposit} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method:</label>
              <div className="flex gap-4 flex-wrap">
                {['Cash', 'Check', 'Zelle', 'Credit Card'].map(method => (
                  <label key={method} className="flex items-center gap-2">
                    <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={handleChange} />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
            onClick={async () => {
              if (!formData.name || !formData.email || !formData.phone) {
                alert('Please fill in required fields: Name, Email, Phone');
                return;
              }
              try {
                const messageData = `Property: ${formData.propertyType}\nFrequency: ${formData.frequency}\nAddress: ${formData.address}\nCity: ${formData.city}\nQuoted: $${formData.quotedRate}\nDeposit: $${formData.deposit}\nPayment: ${formData.paymentMethod}\nPreferred Date/Time: ${formData.dateTime}\n\nNotes: ${formData.notes}`;

                if (selectedClient) {
                  // Update existing client
                  const response = await fetch('/api/clients', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: selectedClient.id,
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      service: formData.services.join(', ') || 'General Cleaning',
                      message: messageData
                    })
                  });
                  if (response.ok) {
                    alert('Client updated successfully!');
                    loadClients();
                  } else {
                    alert('Error updating client');
                  }
                } else {
                  // Create new client
                  const response = await fetch('/submit-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      service: formData.services.join(', ') || 'General Cleaning',
                      message: messageData
                    })
                  });
                  if (response.ok) {
                    alert('Client information saved successfully!');
                    loadClients();
                    setFormData({
                      name: '', email: '', phone: '', address: '', city: '',
                      propertyType: 'Residential', services: [], frequency: 'One-Time',
                      notes: '', quotedRate: '', deposit: '', paymentMethod: 'Cash', dateTime: ''
                    });
                    setSelectedClient(null);
                  } else {
                    alert('Error saving client');
                  }
                }
              } catch (err) {
                console.error('Error saving client:', err);
                alert('Error saving client');
              }
            }}
            className="w-full px-6 py-4 bg-primary text-white font-bold text-lg rounded-lg hover:bg-primary-dark transition-colors"
          >
            {selectedClient ? 'Update Client Information' : 'Save Client Information'}
          </button>
      </div>
    </div>
  );
};

export default AdminView;
