
import React, { useState, useEffect } from 'react';
import { getStore, saveStore } from './store';
import { Role, User } from './types';
import AdminDashboard from './components/AdminDashboard';
import CustomerPortal from './components/CustomerPortal';
import LandingPage from './components/LandingPage';
import Login from './components/Login';

const App: React.FC = () => {
  const [store, setStore] = useState(getStore());
  const [view, setView] = useState<'landing' | 'admin' | 'customer' | 'login'>('landing');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setView('login');
  };

  const handleLogin = (userData: User) => {
    setStore(prev => ({ ...prev, currentUser: userData }));
    setView(userData.role === Role.ADMIN ? 'admin' : 'customer');
  };

  const handleLogout = () => {
    setStore(prev => ({ ...prev, currentUser: null }));
    setView('landing');
    setSelectedRole(null);
  };

  const updateStore = (updater: (prev: ReturnType<typeof getStore>) => ReturnType<typeof getStore>) => {
    setStore(prev => {
      const newState = updater(prev);
      saveStore(newState);
      return newState;
    });
  };

  if (view === 'landing') {
    return <LandingPage onSelectRole={handleRoleSelect} />;
  }

  if (view === 'login' && selectedRole) {
    return <Login role={selectedRole} onBack={() => setView('landing')} onLogin={handleLogin} />;
  }

  if (view === 'admin' && store.currentUser?.role === Role.ADMIN) {
    return (
      <AdminDashboard 
        store={store} 
        onUpdateStore={updateStore} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <CustomerPortal 
      store={store} 
      onUpdateStore={updateStore} 
      onLogout={handleLogout} 
    />
  );
};

export default App;
