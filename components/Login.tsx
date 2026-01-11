
import React, { useState } from 'react';
import { Role, User } from '../types';
import { ShieldCheck, Smartphone, Key, ArrowLeft, Loader2, UserPlus, LogIn, User as UserIcon, Mail, Lock, Zap } from 'lucide-react';

interface Props {
  role: Role;
  onBack: () => void;
  onLogin: (userData: User) => void;
}

const Login: React.FC<Props> = ({ role, onBack, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'input' | 'otp'>(role === Role.CUSTOMER ? 'input' : 'input');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    password: '', 
    mobile: '', 
    otp: '',
    shopName: '',
    address: '' 
  });

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userData: User = {
        id: 'admin-' + Math.random().toString(36).substr(2, 5),
        name: mode === 'signup' ? form.shopName : 'Shop Owner',
        email: form.email,
        mobile: form.mobile || '0300-1234567',
        role: Role.ADMIN,
        address: form.address
      };
      onLogin(userData);
    }, 1200);
  };

  const handleCustomerStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mobile) return alert("Please enter mobile number");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleCustomerStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userData: User = {
        id: 'cust-' + Math.random().toString(36).substr(2, 5),
        name: mode === 'signup' ? form.name : 'Customer',
        mobile: form.mobile,
        role: Role.CUSTOMER,
        address: form.address || 'Lahore, Pakistan'
      };
      onLogin(userData);
    }, 1000);
  };

  const quickLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (role === Role.ADMIN) {
        onLogin({
          id: 'admin-quick',
          name: 'PakTech Admin',
          email: 'admin@paktech.com',
          mobile: '0300-1234567',
          role: Role.ADMIN,
          address: 'Main Market, Lahore'
        });
      } else {
        onLogin({
          id: 'cust-quick',
          name: 'Ahmad Khan',
          mobile: '0321-7654321',
          role: Role.CUSTOMER,
          address: 'Gulberg III, Lahore'
        });
      }
      setLoading(false);
    }, 500);
  };

  const isAdmin = role === Role.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <button 
        onClick={onBack} 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${isAdmin ? 'bg-blue-600 shadow-blue-100' : 'bg-green-600 shadow-green-100'} text-white`}>
            {isAdmin ? <ShieldCheck size={40} /> : <Smartphone size={40} />}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {isAdmin ? (mode === 'login' ? 'Admin Login' : 'Register Shop') : (mode === 'login' ? 'Customer Login' : 'Create Account')}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {isAdmin 
              ? 'Manage inventory, sales and repairs' 
              : 'The best computer shop in your pocket'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => { setMode('login'); setStep('input'); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LogIn size={16} /> Login
          </button>
          <button 
            onClick={() => { setMode('signup'); setStep('input'); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserPlus size={16} /> Sign Up
          </button>
        </div>

        {isAdmin ? (
          <form onSubmit={handleAdminAuth} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
                    placeholder="e.g. PakTech Solutions"
                    value={form.shopName}
                    onChange={e => setForm({...form, shopName: e.target.value})}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" required
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
                  placeholder="admin@paktech.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" required
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? <Key size={20} /> : <UserPlus size={20} />)}
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {step === 'input' ? (
              <form onSubmit={handleCustomerStep1} className="space-y-5">
                {mode === 'signup' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <div className="relative mt-1">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" required
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-green-600 transition-all font-medium"
                        placeholder="Ahmad Khan"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile</label>
                  <div className="relative mt-1">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" required
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-green-600 transition-all font-medium"
                      placeholder="0321-1234567"
                      value={form.mobile}
                      onChange={e => setForm({...form, mobile: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Get OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCustomerStep2} className="space-y-6">
                <div className="text-center">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Enter Code</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    required
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-green-600 transition-all font-black text-center text-2xl tracking-[1em]"
                    placeholder="0000"
                    value={form.otp}
                    onChange={e => setForm({...form, otp: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-green-700 transition-all flex items-center justify-center shadow-xl active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Login Section for Developers */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={quickLogin}
            disabled={loading}
            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
              isAdmin 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            <Zap size={14} fill="currentColor" />
            Quick Access {isAdmin ? 'Admin' : 'Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
