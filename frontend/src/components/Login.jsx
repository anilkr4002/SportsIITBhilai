import React, { useState } from 'react';
import { apiCall } from '../utils/api';

const Login = ({ onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (result.success) {
        onLogin(result.role);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        
        <div className="text-center mb-8">
          <i className="fas fa-lock text-4xl text-purple-500 mb-4"></i>
          <h2 className="text-3xl font-bold text-gray-800">Editor Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo credentials:</p>
          {/* <p>Username: <strong></strong></p> */}
          {/* <p>Password: <strong></strong></p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;