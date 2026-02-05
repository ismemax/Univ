
import React, { useState } from 'react';
<<<<<<< HEAD
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
=======
import { User, UserRole } from '../types';
import { sanitizeInput } from '../utils/securityUtils';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [role, setRole] = useState<UserRole>('FACULTY');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
      alert('Please fill in all fields');
      return;
    }

    // Mock auth logic
    const user: User = {
      id: Math.random().toString(36).substring(7),
      email: sanitizeInput(email),
      name: sanitizeInput(name) || (role === 'FACULTY' ? 'Professor Juan' : 'Student Heron'),
      role
    };
    onLogin(user);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-slate-50/50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-umak-blue p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 relative z-10">
            <img
              src="/umak-logo.png"
              alt="UMak Logo"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <h2 className="text-white text-xl font-serif font-bold uppercase tracking-tight relative z-10">UMak Academic Portal</h2>
          <p className="text-umak-yellow text-[10px] font-black uppercase tracking-[0.2em] mt-1 relative z-10">Single Sign-On Service</p>
        </div>

        <div className="p-8">
          <div className="flex border-b-2 border-slate-100 mb-8">
            <button
              onClick={() => setRole('FACULTY')}
              className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest transition-all ${role === 'FACULTY' ? 'text-umak-blue border-b-2 border-umak-blue' : 'text-slate-400'}`}
            >
              Faculty
            </button>
            <button
              onClick={() => setRole('STUDENT')}
              className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest transition-all ${role === 'STUDENT' ? 'text-umak-blue border-b-2 border-umak-blue' : 'text-slate-400'}`}
            >
              Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all placeholder:font-bold placeholder:text-slate-300"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@umak.edu.ph"
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all placeholder:font-bold placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all placeholder:font-bold placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-umak-blue text-white font-black py-4 rounded-xl shadow-xl shadow-umak-blue/20 hover:bg-umak-navy transition-all active:scale-[0.98] mt-4 uppercase text-xs tracking-widest"
            >
              {isRegistering ? 'Create Academic Account' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-black text-slate-500 hover:text-umak-blue transition-colors"
            >
              {isRegistering ? 'ALREADY HAVE AN ACCOUNT? LOGIN' : 'NEED A PORTAL ACCOUNT? REGISTER HERE'}
            </button>
            <button
              onClick={onCancel}
              className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
>>>>>>> parent of 7ec1945 (hjj)
};

export default Login;
