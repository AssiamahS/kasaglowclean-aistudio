import React, { useState } from 'react';
// FIX: Import missing LockClosedIcon
import { UserIcon, LockClosedIcon } from './IconComponents';

interface LoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Hardcoded credentials for demonstration
    if (username === 'admin' && password === 'password123') {
      onLoginSuccess();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-base-100 rounded-2xl shadow-2xl p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-6">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Enter username"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <LockClosedIcon className="h-5 w-5" />
            </div>
            <input
              id="password-login"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Enter password"
            />
          </div>
        </div>

        {error && <p className="text-sm text-center text-error">{error}</p>}

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
