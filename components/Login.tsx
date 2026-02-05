
import React, { useState } from 'react';
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
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/UMak_Logo_Registered.png/600px-UMak_Logo_Registered.png"
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
};

export default Login;
