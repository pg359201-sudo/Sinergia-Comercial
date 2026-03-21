import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertsList = () => {
  const { currentUser, alerts, clients, users, updateAlertStatus } = useAppStore();

  const isEscritorio = currentUser?.role === 'escritorio';
  const displayAlerts = isEscritorio ? alerts : alerts.filter(a => a.createdBy === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Alertas</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isEscritorio ? 'Oportunidades reportadas por el terreno.' : 'Tus alertas enviadas.'}
          </p>
        </div>
        {!isEscritorio && (
          <Link to="/alerts/new">
            <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Alerta</span>
            </Button>
          </Link>
        )}
      </div>

      <div className={`grid gap-4 ${isEscritorio ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {displayAlerts.map((alert) => {
          const client = clients.find(c => c.id === alert.clientId);
          const creator = users.find(u => u.id === alert.createdBy);
          
          return (
            <Card key={alert.id} className="p-5 flex flex-col border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={alert.status === 'new' ? 'warning' : alert.status === 'read' ? 'info' : 'success'}>
                    {alert.status === 'new' ? 'Nueva' : alert.status === 'read' ? 'Leída' : 'Accionada'}
                  </Badge>
                  <Badge variant="default" className="bg-slate-200">
                    {alert.type === 'competitor_action' ? 'Competencia' : alert.type === 'stock_out' ? 'Quiebre Stock' : alert.type === 'new_opportunity' ? 'Oportunidad' : 'Otro'}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 ml-2">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(alert.createdAt), 'dd MMM HH:mm', { locale: es })}
                </span>
              </div>
              
              <p className="text-slate-800 text-sm md:text-base font-medium mb-4 flex-1">{alert.description}</p>
              
              <div className="space-y-2 mt-auto pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{client?.name}</span>
                </div>
                
                {isEscritorio && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <img src={creator?.avatar} alt={creator?.name} className="w-5 h-5 rounded-full shrink-0" />
                    <span className="truncate">Reportado por: {creator?.name}</span>
                  </div>
                )}
                
                {isEscritorio && alert.status !== 'actioned' && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {alert.status === 'new' && (
                      <Button variant="outline" className="flex-1" onClick={() => updateAlertStatus(alert.id, 'read')}>
                        Marcar Leída
                      </Button>
                    )}
                    <Button variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateAlertStatus(alert.id, 'actioned')}>
                      Marcar Accionada
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {displayAlerts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No hay alertas registradas.
          </div>
        )}
      </div>
    </div>
  );
};
