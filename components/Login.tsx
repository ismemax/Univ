
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock authentication logic matching UMak institutional standards
    if (email === 'admin@umak.edu.ph' && password === 'admin123') {
      const facultyUser: User = {
        id: 'faculty_admin',
        email: 'admin@umak.edu.ph',
        name: 'Faculty Administrator',
        role: 'FACULTY'
      };
      onLogin(facultyUser);
    } else {
      setError('Invalid institutional credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Branding Header */}
        <div className="bg-umak-navy p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 p-2 shadow-inner">
            <img src="/umak-logo.png" alt="UMak Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white tracking-widest uppercase">Portal Login</h2>
          <p className="text-umak-yellow/80 text-[10px] font-black tracking-[0.2em] mt-2 uppercase">Official Academic Access</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University Email</label>
            <input
              type="email"
              placeholder="username@umak.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 py-3.5 px-4 rounded-xl text-slate-900 font-bold focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 py-3.5 px-4 rounded-xl text-slate-900 font-bold focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all outline-none"
              required
            />
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              className="w-full bg-umak-blue text-white font-black py-4 rounded-xl hover:bg-umak-navy transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-umak-blue/20 active:scale-95"
            >
              Authorize Access
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-slate-400 font-bold py-2 rounded-xl hover:text-slate-600 transition-all uppercase text-[10px] tracking-widest hover:bg-slate-50"
            >
              Return Home
            </button>
          </div>
        </form>

        <div className="bg-slate-50 py-4 px-8 border-t border-slate-100">
          <p className="text-center text-[9px] text-slate-400 font-medium leading-relaxed">
            Unauthorized access is strictly prohibited. This system is for authorized UMak Faculty and Personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
