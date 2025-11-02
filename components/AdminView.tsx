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
}

const AdminView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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
    }
  }, [isAuthenticated]);

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();

      if (data.ok && data.submissions) {
        setSubmissions(data.submissions);
      } else {
        console.error('Failed to load submissions:', data.error);
        // Fallback to localStorage for development/local testing
        const stored = localStorage.getItem('leadSubmissions');
        if (stored) {
          const localData = JSON.parse(stored);
          setSubmissions(localData.sort((a: Submission, b: Submission) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ));
        }
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      // Fallback to localStorage for development/local testing
      const stored = localStorage.getItem('leadSubmissions');
      if (stored) {
        const localData = JSON.parse(stored);
        setSubmissions(localData.sort((a: Submission, b: Submission) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
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

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !sub.read;
    if (filter === 'read') return sub.read;
    return true;
  });

  const unreadCount = submissions.filter(sub => !sub.read).length;

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

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Read ({submissions.length - unreadCount})
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
