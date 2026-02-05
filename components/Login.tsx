
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
        <div className="bg-[#004A98] p-10 text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="w-16 h-16 bg-white border-4 border-[#FACC15] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#004A98] font-black text-2xl">U</span>
          </div>
          <h2 className="text-white text-xl font-black uppercase tracking-tight">UMak Academic Portal</h2>
          <p className="text-[#FACC15] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Single Sign-On Service</p>
        </div>

        <div className="p-8">
          <div className="flex border-b-2 border-slate-100 mb-8">
            <button
              onClick={() => setRole('FACULTY')}
              className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest transition-all ${role === 'FACULTY' ? 'text-[#004A98] border-b-2 border-[#004A98]' : 'text-slate-400'}`}
            >
              Faculty
            </button>
            <button
              onClick={() => setRole('STUDENT')}
              className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest transition-all ${role === 'STUDENT' ? 'text-[#004A98] border-b-2 border-[#004A98]' : 'text-slate-400'}`}
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
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-[#004A98] focus:ring-4 focus:ring-[#004A98]/5 transition-all placeholder:font-bold placeholder:text-slate-300"
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
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-[#004A98] focus:ring-4 focus:ring-[#004A98]/5 transition-all placeholder:font-bold placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:border-[#004A98] focus:ring-4 focus:ring-[#004A98]/5 transition-all placeholder:font-bold placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#004A98] text-white font-black py-4 rounded-xl shadow-xl shadow-[#004A98]/20 hover:bg-[#003875] transition-all active:scale-[0.98] mt-4 uppercase text-xs tracking-widest"
            >
              {isRegistering ? 'Create Academic Account' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-black text-slate-500 hover:text-[#004A98] transition-colors"
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
