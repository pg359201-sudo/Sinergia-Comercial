import React, { useState, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { LayoutDashboard, ClipboardList, BellRing, LogOut, Briefcase, ShoppingCart, Camera, Store, FileText, Menu, X, Upload } from 'lucide-react';
import { cn } from './ui';
import * as XLSX from 'xlsx';
import { Client } from '../types';

export const Layout = () => {
  const { currentUser, logout, alerts, addClients } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return <Outlet />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        if (data.length > 1) {
          const row2 = data[1]; // Fila 2 (índice 1)
          let razonSocialColIndex = -1;
          let grupoCanalColIndex = -1;
          let gecColIndex = -1;
          let rutaVentaColIndex = -1;
          let uc12mmColIndex = -1;
          
          // Buscar dinámicamente en qué columna están los datos
          for (let c = 0; c < row2.length; c++) {
            const cellValue = row2[c] ? String(row2[c]) : '';
            const normalized = cellValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
            if (normalized === 'razonsocial') {
              razonSocialColIndex = c;
            } else if (normalized === 'grupocanal') {
              grupoCanalColIndex = c;
            } else if (normalized === 'gec') {
              gecColIndex = c;
            } else if (normalized === 'rutaventa') {
              rutaVentaColIndex = c;
            } else if (normalized === 'uc12mm') {
              uc12mmColIndex = c;
            }
          }

          if (razonSocialColIndex !== -1) {
            const newClients: Client[] = [];
            // Empezar desde la fila 3 (índice 2)
            for (let i = 2; i < data.length; i++) {
              const razonSocial = data[i][razonSocialColIndex];
              const grupoCanal = grupoCanalColIndex !== -1 ? data[i][grupoCanalColIndex] : null;
              const gec = gecColIndex !== -1 ? data[i][gecColIndex] : null;
              const rutaVenta = rutaVentaColIndex !== -1 ? data[i][rutaVentaColIndex] : null;
              const uc12mm = uc12mmColIndex !== -1 ? data[i][uc12mmColIndex] : null;

              if (razonSocial && typeof razonSocial === 'string' && razonSocial.trim() !== '') {
                newClients.push({
                  id: `c${Date.now()}-${i}`,
                  name: razonSocial.trim(),
                  address: 'Sin dirección',
                  route: rutaVenta ? String(rutaVenta).trim() : 'Sin ruta',
                  visitDay: 'Lunes',
                  channel: grupoCanal ? String(grupoCanal).trim() : 'Sin canal',
                  gec: gec ? String(gec).trim() : 'Sin GEC',
                  uc12mm: uc12mm ? String(uc12mm).trim() : '0'
                });
              }
            }
            if (newClients.length > 0) {
              addClients(newClients);
              alert(`Se cargaron ${newClients.length} clientes exitosamente.`);
            } else {
              alert('No se encontraron clientes debajo del título "RazonSocial".');
            }
          } else {
            // Mostrar los encabezados encontrados para ayudar a depurar
            const foundHeaders = row2.map(h => String(h || '').trim()).filter(h => h).join(', ');
            alert(`No se encontró la columna "RazonSocial" en la Fila 2. Encabezados encontrados: ${foundHeaders || 'Ninguno'}`);
          }
        } else {
          alert('El archivo parece estar vacío o no tiene suficientes filas.');
        }
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        alert('Hubo un error al procesar el archivo Excel.');
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const unreadAlertsCount = alerts.filter(a => a.status === 'new').length;

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
        <header className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B59A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E" alt="SyncOps Logo" className="h-5 w-auto object-contain" />
            <span className="font-orbitron font-black uppercase tracking-tighter text-sm">Sync<span className="text-slate-400 font-medium mx-[1px]">·</span><span className="text-[#5F6D4F]">Ops</span></span>
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
                  'flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors relative',
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-indigo-100")} />
                  {item.name === 'Alertas' && unreadAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadAlertsCount}
                    </span>
                  )}
                </div>
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
    { name: 'Misiones', path: '/missions', icon: ClipboardList },
    { name: 'Activaciones', path: '/activations', icon: Camera },
    { name: 'Alertas', path: '/alerts', icon: BellRing },
    { name: 'Ventas Tácticas', path: '/sales', icon: ShoppingCart },
    { name: 'Clientes', path: '/clients', icon: Store },
    { name: 'Registros', path: '/records', icon: FileText },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-800 text-white px-4 py-3 z-30">
        <div className="flex items-center gap-2">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B59A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E" alt="SyncOps Logo" className="h-5 w-auto object-contain" />
          <span className="font-orbitron font-black uppercase tracking-tighter text-sm">Sync<span className="text-slate-400 font-medium mx-[1px]">·</span><span className="text-[#5F6D4F]">Ops</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B59A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E" alt="SyncOps Logo" className="h-6 w-auto object-contain" />
            <span className="text-base font-orbitron font-black uppercase tracking-tighter">Sync<span className="text-slate-400 font-medium mx-[1px]">·</span><span className="text-[#5F6D4F]">Ops</span></span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.name === 'Alertas' && unreadAlertsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                      {unreadAlertsCount}
                    </span>
                  )}
                </div>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-2">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-500 hover:bg-slate-800 hover:text-white w-full"
              title="Cargar Cts"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Cargar Cts</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
