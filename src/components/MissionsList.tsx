import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Store, Calendar, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MissionsList = () => {
  const { currentUser, missions, clients, users, deleteMissions } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const isEscritorio = currentUser?.role === 'escritorio';
  const displayMissions = isEscritorio ? missions : missions.filter(m => m.assignedTo === currentUser?.id);

  const sortedMissions = [...displayMissions].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
    deleteMissions(Array.from(selectedIds));
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
              ¿Estás seguro de que deseas eliminar las {selectedIds.size} misiones seleccionadas? Esta acción no se puede deshacer.
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Misiones</h1>
          <p className="mt-1 text-xs text-slate-500">
            {isEscritorio ? 'Gestiona y asigna misiones a los agentes.' : 'Tus misiones asignadas para hoy.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {isEscritorio && selectedIds.size > 0 && (
            <Button 
              onClick={() => setShowConfirm(true)} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedIds.size})
            </Button>
          )}
          {isEscritorio && (
            <Link to="/missions/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Misión
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${isEscritorio ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {sortedMissions.map((mission) => {
          const client = clients.find(c => c.id === mission.clientId);
          const assignedUser = users.find(u => u.id === mission.assignedTo);
          
          return (
            <Card key={mission.id} className={`p-3 md:p-5 flex flex-col relative ${selectedIds.has(mission.id) ? 'ring-2 ring-indigo-500' : ''}`}>
              {isEscritorio && (
                <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 md:w-5 md:h-5 cursor-pointer shadow-sm"
                    checked={selectedIds.has(mission.id)}
                    onChange={() => handleSelectOne(mission.id)}
                  />
                </div>
              )}
              <div className={`flex justify-between items-start mb-2 md:mb-3 ${isEscritorio ? 'pr-6 md:pr-8' : ''}`}>
                <Badge variant={mission.status === 'completed' ? 'success' : mission.status === 'in-progress' ? 'warning' : 'info'} className="text-[10px] md:text-xs px-1.5 py-0.5 md:px-2.5 md:py-0.5">
                  {mission.status === 'completed' ? 'Completada' : mission.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                </Badge>
                <span className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(mission.createdAt), 'dd MMM', { locale: es })}
                </span>
              </div>
              
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">{mission.title}</h3>
              <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-2 md:mb-4 flex-1">{mission.description}</p>
              
              <div className="space-y-1.5 md:space-y-2 mt-auto pt-2 md:pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <Store className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{client ? client.name : 'Misión General'}</span>
                </div>
                
                {isEscritorio && (
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                    <span className="truncate">Asignado a: {assignedUser?.name}</span>
                  </div>
                )}
                
                <Link to={`/missions/${mission.id}`} className="block mt-2 md:mt-3">
                  <Button variant={mission.status === 'completed' ? 'outline' : 'primary'} className="w-full text-xs md:text-sm h-8 md:h-10">
                    {isEscritorio ? 'Ver Detalles' : mission.status === 'completed' ? 'Ver Ejecución' : 'Ejecutar Misión'}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
        {sortedMissions.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No hay misiones disponibles.
          </div>
        )}
      </div>
    </div>
  );
};
