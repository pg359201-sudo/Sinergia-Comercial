import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { LayoutDashboard, ClipboardList, BellRing, LogOut, Briefcase, ShoppingCart, Camera, Store, FileText } from 'lucide-react';
import { cn } from './ui';

export const Layout = () => {
  const { currentUser, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) {
    return <Outlet />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (currentUser.role === 'terreno') {
    const mobileNav = [
      { name: 'Inicio', path: '/', icon: LayoutDashboard },
      { name: 'Misiones', path: '/missions', icon: ClipboardList },
      { name: 'Ventas', path: '/sales', icon: ShoppingCart },
      { name: 'Alertas', path: '/alerts', icon: BellRing },
      { name: 'Activaciones', path: '/activations', icon: Camera },
    ];

    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-lg">Sinergia Terreno</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 pb-24">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          {mobileNav.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors',
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-indigo-100")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  // Escritorio Layout
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clients', icon: Store },
    { name: 'Registros', path: '/records', icon: FileText },
    { name: 'Misiones', path: '/missions', icon: ClipboardList },
    { name: 'Alertas', path: '/alerts', icon: BellRing },
    { name: 'Ventas Tácticas', path: '/sales', icon: ShoppingCart },
    { name: 'Activaciones', path: '/activations', icon: Camera },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-white">
          <Briefcase className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">Sinergia</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{currentUser.name}</span>
              <span className="text-xs text-slate-400 capitalize">{currentUser.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
