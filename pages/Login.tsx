
import React, { useState, useMemo } from 'react';
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
  
  const school = useMemo(() => storageService.getSchoolProfile(), []);

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
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Watermark using School Logo */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center scale-[1.8] rotate-[-15deg]"
        style={{ 
          backgroundImage: `url(${school.logoUrl})`, 
          backgroundSize: 'contain', 
          backgroundRepeat: 'no-repeat', 
          backgroundPosition: 'center' 
        }}
      />
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-800 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900 rounded-full blur-[120px] opacity-40"></div>

      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 border border-white/10">
        <div className="bg-emerald-800 p-10 text-center relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center border-4 border-emerald-600 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
               <img src={school.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-white leading-tight tracking-tight">{SCHOOL_NAME}</h1>
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[3px] mt-2 opacity-80">{SCHOOL_LOCATION}</p>
            
            {/* Developer Credit in Header */}
            <div className="mt-6 pt-4 border-t border-emerald-700/50">
               <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest leading-relaxed">
                  Developed By: <br/>
                  <span className="text-white">N.M. Asarudeen (SLTS)</span><br/>
                  National Diploma in Teaching ICT, HNDIT
               </p>
            </div>
          </div>
        </div>

        <div className="p-10">
          <h2 className="text-xl font-black text-gray-800 mb-8 text-center uppercase tracking-widest text-sm">Portal Authentication</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">User Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                placeholder="teacher@nikawewa.edu"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Access Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-wider rounded-2xl border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 active:transform active:scale-95 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest text-sm"
            >
              Enter Portal
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
              Security Protocol: <br/>
              Only authorized personnel. <br/>
              A/Nikawewa IT Dept © 2024
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500">
         <div className="w-8 h-[1px] bg-emerald-500"></div>
         <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[5px]">
            Academic Management Console
         </p>
         <div className="w-8 h-[1px] bg-emerald-500"></div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;
