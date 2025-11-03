import React, { useState, useEffect } from 'react';
import Login from './Login';
import { MailIcon, PhoneIcon, UserIcon } from './IconComponents';

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

const AdminView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [jobForm, setJobForm] = useState({ title: '', location: '', description: '', type: '', active: true });
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [activeTab, setActiveTab] = useState<'clients' | 'applicants'>('clients');

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
          <div className="flex gap-2 mt-6 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('clients');
                setSelectedSubmission(null);
              }}
              className={`px-6 py-3 font-semibold transition-colors relative ${
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
              className={`px-6 py-3 font-semibold transition-colors relative ${
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
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <button onClick={loadSubmissions} className="px-3 py-2 border rounded">Reload Submissions</button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({activeTab === 'clients' ? allClients.length : allApplicants.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread ({activeTab === 'clients' ? unreadClients : unreadApplicants})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Read ({activeTab === 'clients' ? (allClients.length - unreadClients) : (allApplicants.length - unreadApplicants)})
            </button>
          </div>
        </div>

        {/* Content */}
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Job Listings</h2>
                <div>
                  <button onClick={openNewJobForm} className="px-3 py-2 bg-primary text-white rounded mr-2">Add Job</button>
                  <button onClick={loadJobs} className="px-3 py-2 border rounded">Reload</button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {jobs.length === 0 && <div className="text-gray-500">No jobs found.</div>}
                {jobs.map(job => (
                  <div key={job.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-sm text-gray-600">{job.location} · {job.type}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditJobForm(job)} className="px-3 py-1 border rounded">Edit</button>
                      <button onClick={() => deleteJob(job.id)} className="px-3 py-1 bg-error text-white rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {jobFormOpen && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold mb-3">{editingJob ? 'Edit Job' : 'New Job'}</h3>
                <form onSubmit={submitJobForm} className="space-y-3">
                  <input required placeholder="Title" value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})} className="w-full p-2 border rounded" />
                  <input placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})} className="w-full p-2 border rounded" />
                  <input placeholder="Type (Full Time / Part Time)" value={jobForm.type} onChange={(e) => setJobForm({...jobForm, type: e.target.value})} className="w-full p-2 border rounded" />
                  <textarea placeholder="Description" value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})} className="w-full p-2 border rounded" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
                    <button type="button" onClick={() => setJobFormOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                  </div>
                </form>
              </div>
            )}

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
      </div>
    </section>
  );
};

export default AdminView;
