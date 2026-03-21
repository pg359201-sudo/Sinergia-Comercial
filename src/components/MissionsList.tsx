import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MissionsList = () => {
  const { currentUser, missions, clients, users } = useAppStore();

  const isEscritorio = currentUser?.role === 'escritorio';
  const displayMissions = isEscritorio ? missions : missions.filter(m => m.assignedTo === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Misiones</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isEscritorio ? 'Gestiona y asigna misiones al equipo de terreno.' : 'Tus misiones asignadas para hoy.'}
          </p>
        </div>
        {isEscritorio && (
          <Link to="/missions/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Misión
            </Button>
          </Link>
        )}
      </div>

      <div className={`grid gap-4 ${isEscritorio ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {displayMissions.map((mission) => {
          const client = clients.find(c => c.id === mission.clientId);
          const assignedUser = users.find(u => u.id === mission.assignedTo);
          
          return (
            <Card key={mission.id} className="p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <Badge variant={mission.status === 'completed' ? 'success' : mission.status === 'in-progress' ? 'warning' : 'info'}>
                  {mission.status === 'completed' ? 'Completada' : mission.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                </Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(mission.createdAt), 'dd MMM', { locale: es })}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{mission.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{mission.description}</p>
              
              <div className="space-y-2 mt-auto pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{client?.name}</span>
                </div>
                
                {isEscritorio && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <img src={assignedUser?.avatar} alt={assignedUser?.name} className="w-5 h-5 rounded-full shrink-0" />
                    <span className="truncate">Asignado a: {assignedUser?.name}</span>
                  </div>
                )}
                
                <Link to={`/missions/${mission.id}`} className="block mt-3">
                  <Button variant={mission.status === 'completed' ? 'outline' : 'primary'} className="w-full">
                    {isEscritorio ? 'Ver Detalles' : mission.status === 'completed' ? 'Ver Ejecución' : 'Ejecutar Misión'}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
        {displayMissions.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No hay misiones disponibles.
          </div>
        )}
      </div>
    </div>
  );
};
