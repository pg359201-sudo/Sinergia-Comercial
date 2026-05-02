import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClipboardList, BellRing, TrendingUp, CheckCircle2, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardEscritorio = () => {
  const { missions, alerts, sales, clients, activations } = useAppStore();

  const pendingMissions = missions.filter(m => m.status !== 'completed').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;
  
  const now = new Date();
  const recentActivationsCount = activations.filter(a => differenceInDays(now, new Date(a.createdAt)) <= 5).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Headquarter</h1>
          <p className="mt-1 text-xs text-slate-500 font-normal">Monitorea la ejecución y capitaliza las oportunidades de los agentes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        <Card className="px-4 py-5 flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
            <ClipboardList className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Misiones Activas</p>
            <p className="text-2xl font-bold text-slate-900">{pendingMissions}</p>
          </div>
        </Card>
        <Card className="px-4 py-5 flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Misiones Cmpl.</p>
            <p className="text-2xl font-bold text-slate-900">{completedMissions}</p>
          </div>
        </Card>
        <Card className="px-4 py-5 flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0">
            <BellRing className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Alertas Estrateg.</p>
            <p className="text-2xl font-bold text-slate-900">{newAlerts}</p>
          </div>
        </Card>
        <Card className="px-4 py-5 flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-[#8A7F53]/10 text-[#8A7F53] rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Ventas Tácticas</p>
            <p className="text-2xl font-bold text-slate-900">{sales.length}</p>
          </div>
        </Card>
        <Card className="px-4 py-5 flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
            <Camera className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">Activaciones Rec.</p>
            <p className={`text-2xl font-bold ${recentActivationsCount === 0 ? 'text-red-500' : 'text-emerald-500'}`}>{recentActivationsCount}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Últimas Alertas de Agentes</h2>
            <Link to="/alerts">
              <Button variant="ghost" className="text-sm">Ver todas</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {alerts.slice(0, 6).map(alert => (
              <div key={alert.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <Badge variant={alert.status === 'new' ? 'warning' : 'default'}>
                    {alert.type === 'competitor_action' ? 'Competencia' : alert.type === 'stock_out' ? 'Quiebre Stock' : 'Oportunidad'}
                  </Badge>
                  <span className="text-xs text-slate-500">{format(new Date(alert.createdAt), 'HH:mm - dd MMM', { locale: es })}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">{alert.description}</p>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay alertas recientes.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Ventas Tácticas Recientes</h2>
            <Link to="/sales">
              <Button variant="ghost" className="text-sm">Ver todas</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {sales.slice(0, 6).map(sale => {
              const client = clients.find(c => c.id === sale.clientId);
              return (
                <div key={sale.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2 relative">
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sale.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sale.status === 'completed' ? 'COMPLETADA' : 'PENDIENTE'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pr-20">
                    <span className="text-sm font-bold text-slate-900">{sale.product}</span>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-200/50 p-2 rounded-lg truncate">
                    {client?.name} {client?.clientNumber ? `(#${client.clientNumber})` : ''}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">Cant: {sale.quantity}</span>
                    <span>{format(new Date(sale.createdAt), 'HH:mm - dd MMM', { locale: es })}</span>
                  </div>
                </div>
              );
            })}
            {sales.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay ventas recientes.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
