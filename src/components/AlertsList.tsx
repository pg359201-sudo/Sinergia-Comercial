import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertsList = () => {
  const { currentUser, alerts, clients, users, updateAlertStatus, deleteAlerts } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const isEscritorio = currentUser?.role === 'escritorio';
  const displayAlerts = isEscritorio ? alerts : alerts.filter(a => a.createdBy === currentUser?.id);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(displayAlerts.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    deleteAlerts(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 relative">
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar eliminación</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar las {selectedIds.size} alertas seleccionadas? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteSelected}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Alertas</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isEscritorio ? 'Oportunidades reportadas por el terreno.' : 'Tus alertas enviadas.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <Button 
              onClick={() => setShowConfirm(true)} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedIds.size})
            </Button>
          )}
          {!isEscritorio && (
            <Link to="/alerts/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700">
                <AlertTriangle className="w-4 h-4" />
                Nueva Alerta
              </Button>
            </Link>
          )}
        </div>
      </div>

      {displayAlerts.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <input 
            type="checkbox" 
            id="selectAll"
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            checked={selectedIds.size === displayAlerts.length}
            onChange={handleSelectAll}
          />
          <label htmlFor="selectAll" className="text-sm text-slate-600 cursor-pointer select-none">
            Seleccionar todas
          </label>
        </div>
      )}

      <div className={`grid gap-4 ${isEscritorio ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {displayAlerts.map((alert) => {
          const client = clients.find(c => c.id === alert.clientId);
          const creator = users.find(u => u.id === alert.createdBy);
          
          return (
            <Card key={alert.id} className={`p-5 flex flex-col border-l-4 border-l-amber-500 relative ${selectedIds.has(alert.id) ? 'ring-2 ring-indigo-500' : ''}`}>
              <div className="absolute top-3 right-3 z-10">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer shadow-sm"
                  checked={selectedIds.has(alert.id)}
                  onChange={() => handleSelectOne(alert.id)}
                />
              </div>
              <div className="flex justify-between items-start mb-3 pr-8">
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
