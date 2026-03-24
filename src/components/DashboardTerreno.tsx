import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card } from './ui';
import { Store, CheckCircle2, AlertTriangle, ShoppingCart, ChevronRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardTerreno = () => {
  const { currentUser, missions, clients } = useAppStore();

  const myMissions = missions.filter(m => m.assignedTo === currentUser?.id);
  const pendingMissions = myMissions.filter(m => m.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hola, {currentUser?.name}</h1>
          <p className="text-slate-500 text-sm">{pendingMissions} misiones pendientes hoy</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link to="/sales/new" className="bg-[#8A7F53] text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-transform text-center">
          <ShoppingCart className="w-7 h-7" />
          <span className="font-bold text-xs leading-tight">Venta<br/>Rápida</span>
        </Link>
        <Link to="/alerts/new" className="bg-[#5F6D4F] text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-transform text-center">
          <AlertTriangle className="w-7 h-7" />
          <span className="font-bold text-xs leading-tight">Alerta<br/>PDV</span>
        </Link>
        <Link to="/activations/new" className="bg-[#9C7C38] text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-transform text-center">
          <Camera className="w-7 h-7" />
          <span className="font-bold text-xs leading-tight">Nueva<br/>Activación</span>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-900 text-lg">Próximas Misiones</h2>
          <Link to="/missions" className="text-indigo-600 text-sm font-medium">Ver todas</Link>
        </div>
        <div className="space-y-3">
          {myMissions.filter(m => m.status !== 'completed').slice(0, 3).map(mission => {
            const client = clients.find(c => c.id === mission.clientId);
            return (
              <Link key={mission.id} to={`/missions/${mission.id}`} className="block">
                <Card className="p-4 flex items-center gap-4 active:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{mission.title}</h3>
                    <p className="text-sm text-slate-500 truncate">{client?.name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </Card>
              </Link>
            );
          })}
          {myMissions.filter(m => m.status !== 'completed').length === 0 && (
            <div className="text-center py-8 bg-slate-100 rounded-2xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">¡Todo al día!</p>
              <p className="text-xs text-slate-500">No tienes misiones pendientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
