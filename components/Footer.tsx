
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto">
      <div className="w-full h-1 bg-white relative">
        <div className="absolute inset-0 flex">
           <div className="w-1/3 h-full bg-[#004A98]"></div>
           <div className="w-2/3 h-full bg-[#FACC15]"></div>
        </div>
      </div>
      
      <div className="bg-white py-12 px-6 flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            University Standards
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Credentials
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data Privacy Compliant
          </div>
        </div>
        
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">
          © 2024 University of Makati • Office of Information Technology
        </p>
      </div>
    </footer>
  );
};

export default Footer;
