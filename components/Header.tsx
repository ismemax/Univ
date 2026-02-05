
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
      <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
        <div className="w-10 h-10 bg-[#004A98] border-2 border-[#FACC15] rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-xl">U</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#004A98] font-bold text-lg tracking-tight leading-none">UNIVERSITY OF MAKATI</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase">Academic Portal</span>
        </div>
      </div>
      
      <nav className="hidden lg:flex items-center gap-8 text-slate-500 font-semibold text-sm">
        <button onClick={onHome} className="hover:text-[#004A98] transition-colors">Home</button>
        {currentUser?.role === 'FACULTY' && (
          <button onClick={onDashboard} className="hover:text-[#004A98] transition-colors">Faculty Dashboard</button>
        )}
        <a href="#" className="hover:text-[#004A98] transition-colors">University Docs</a>
        <a href="#" className="hover:text-[#004A98] transition-colors">Support</a>
      </nav>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-[#004A98]">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">{currentUser.role}</span>
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
            className="bg-[#004A98] text-white px-6 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-[#003875] hover:shadow-md transition-all active:scale-95"
          >
            Portal Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
