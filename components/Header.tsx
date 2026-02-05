
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onHome: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onHome, onLogin, onDashboard, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 cursor-pointer" onClick={onHome}>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <img
            src="/umak-logo.png"
            alt="UMak Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-umak-navy font-serif font-bold text-xl tracking-tight leading-none">UNIVERSITY OF MAKATI</span>
          <span className="text-[10px] text-slate-400 font-sans font-extrabold tracking-[0.2em] uppercase">Academic Portal</span>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-8 text-slate-500 font-semibold text-sm">
        <button onClick={onHome} className="hover:text-umak-blue transition-colors">Home</button>
        {currentUser?.role === 'FACULTY' && (
          <button onClick={onDashboard} className="hover:text-umak-blue transition-colors">Faculty Dashboard</button>
        )}
        <a href="#" className="hover:text-umak-blue transition-colors">University Docs</a>
        <a href="#" className="hover:text-umak-blue transition-colors">Support</a>
      </nav>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-umak-navy">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-extrabold">{currentUser.role}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="bg-umak-blue text-white px-6 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-umak-navy hover:shadow-md transition-all active:scale-95"
          >
            Portal Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
