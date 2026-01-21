
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User, UserRole } from '../types';
import { SCHOOL_NAME, SCHOOL_LOCATION } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storageService.getUsers();
    // Validate credentials against the mock storage
    const user = users.find(u => 
      u.email === email && 
      u.password === password && 
      u.active
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid email or password, or account deactivated.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-emerald-800 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-emerald-600 shadow-inner">
             <span className="text-2xl font-bold text-emerald-800">NM</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">{SCHOOL_NAME}</h1>
          <p className="text-emerald-200 text-sm mt-1">{SCHOOL_LOCATION}</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Login to Portal</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                placeholder="teacher@nikawewa.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 active:transform active:scale-95 transition-all shadow-lg shadow-emerald-200"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Only authorized personnel can access this system.<br/>
              Contact Administrator for account creation.
            </p>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-emerald-300 text-xs opacity-50">
        Powered by A/Nikawewa IT Dept © 2024
      </p>
    </div>
  );
};

export default Login;
