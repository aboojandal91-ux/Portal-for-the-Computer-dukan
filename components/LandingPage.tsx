
import React from 'react';
import { Role } from '../types';
import { ShieldCheck, User } from 'lucide-react';

interface Props {
  onSelectRole: (role: Role) => void;
}

const LandingPage: React.FC<Props> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4 text-white">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">PakTech Computers</h1>
        <p className="text-blue-100 text-lg">Your Trusted Partner in Computing Solutions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button 
          onClick={() => onSelectRole(Role.ADMIN)}
          className="group relative flex flex-col items-center p-10 bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 transition-all transform hover:-translate-y-2"
        >
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Shop Admin</h2>
          <p className="text-blue-200 text-center">Manage stock, orders, repairs, and view reports</p>
        </button>

        <button 
          onClick={() => onSelectRole(Role.CUSTOMER)}
          className="group relative flex flex-col items-center p-10 bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 transition-all transform hover:-translate-y-2"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Customer</h2>
          <p className="text-blue-200 text-center">Browse products, place orders, and track repairs</p>
        </button>
      </div>

      <div className="mt-16 text-sm text-blue-300">
        &copy; 2024 PakTech Computer Solutions - Lahore, Pakistan
      </div>
    </div>
  );
};

export default LandingPage;

// Mock Lucide components since they aren't provided in context
const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
const User = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
