import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { Camera, Plus, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActivationsList = () => {
  const { activations, clients, users, currentUser } = useAppStore();

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente desconocido';
  const getClientRoute = (id: string) => clients.find(c => c.id === id)?.route || '';
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Usuario desconocido';

  // Terreno only sees their own activations, Escritorio sees all
  const filteredActivations = currentUser?.role === 'terreno'
    ? activations.filter(a => a.createdBy === currentUser.id)
    : activations;

  const isMobile = currentUser?.role === 'terreno';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Camera className="w-7 h-7 md:w-8 md:h-8 text-indigo-500" />
            Activaciones en PDV
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {currentUser?.role === 'terreno' 
              ? 'Tus registros fotográficos de exhibiciones y material POP.'
              : 'Monitoreo de activaciones y exhibiciones en terreno.'}
          </p>
        </div>
        {currentUser?.role === 'terreno' && (
          <Link to="/activations/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" />
              Nueva Activación
            </Button>
          </Link>
        )}
      </div>

      {filteredActivations.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No hay activaciones registradas</h3>
          <p className="text-slate-500 mt-2">
            {currentUser?.role === 'terreno' 
              ? 'Registra tu primera exhibición o material POP.'
              : 'Aún no hay registros fotográficos del equipo de terreno.'}
          </p>
        </Card>
      ) : (
        <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredActivations.map(activation => (
            <Card key={activation.id} className="overflow-hidden flex flex-col border-indigo-100 hover:border-indigo-300 transition-colors shadow-sm">
              <div className="h-48 w-full relative bg-slate-100">
                <img 
                  src={activation.evidenceUrl} 
                  alt={activation.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black/60 text-white border-none backdrop-blur-sm">
                    {format(new Date(activation.createdAt), "d MMM, HH:mm", { locale: es })}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{activation.title}</h3>
                
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-900 block">{getClientName(activation.clientId)}</span>
                      <span className="text-xs">{getClientRoute(activation.clientId)}</span>
                    </div>
                  </div>
                  
                  {currentUser?.role === 'escritorio' && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{getUserName(activation.createdBy)}</span>
                    </div>
                  )}
                </div>

                {activation.description && (
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600 line-clamp-2 italic">
                      "{activation.description}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
