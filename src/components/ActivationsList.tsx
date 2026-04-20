import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button, Input } from './ui';
import { Camera, Plus, Store, Calendar, Hash, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseImageUrls } from '../utils/imageUpload';

export const ActivationsList = () => {
  const { activations, clients, users, currentUser, deleteActivations } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente desconocido';
  const getClientRoute = (id: string) => clients.find(c => c.id === id)?.route || '';
  const getClientNumber = (id: string) => clients.find(c => c.id === id)?.clientNumber || '';
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Usuario desconocido';

  // Terreno only sees their own activations, Escritorio sees all
  const baseActivations = currentUser?.role === 'terreno'
    ? activations.filter(a => a.createdBy === currentUser.id)
    : activations;

  const filteredActivations = baseActivations.filter(a => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = a.title.toLowerCase().includes(term);
    const clientMatch = getClientName(a.clientId).toLowerCase().includes(term);
    const clientNumberMatch = getClientNumber(a.clientId).toLowerCase().includes(term);
    const categoryMatch = (a.category || '').toLowerCase().includes(term);
    return titleMatch || clientMatch || clientNumberMatch || categoryMatch;
  });

  const isMobile = currentUser?.role === 'terreno';

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
    deleteActivations(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 relative">
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar eliminación</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar las {selectedIds.size} activaciones seleccionadas? Esta acción no se puede deshacer.
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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Camera className="w-6 h-6 md:w-7 md:h-7 text-indigo-500" />
            Activaciones en PDV
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {currentUser?.role === 'terreno' 
              ? 'Tus registros fotográficos de exhibiciones y material POP.'
              : 'Monitoreo de activaciones y exhibiciones de los agentes.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <Button 
              onClick={() => setShowConfirm(true)} 
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedIds.size})
            </Button>
          )}
          {currentUser?.role === 'escritorio' && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por cliente, nº o título..."
                className="pl-9 py-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {currentUser?.role === 'terreno' && (
            <Link to="/activations/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#9C7C38] hover:bg-[#8A6D31] text-white gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Nueva Activación
              </Button>
            </Link>
          )}
        </div>
      </div>

      {filteredActivations.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No hay activaciones registradas</h3>
          <p className="text-slate-500 mt-2">
            {currentUser?.role === 'terreno' 
              ? 'Registra tu primera exhibición o material POP.'
              : 'Aún no hay registros fotográficos de los agentes.'}
          </p>
        </Card>
      ) : (
        <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredActivations.map(activation => {
            const images = parseImageUrls(activation.evidenceUrl);
            const firstImage = images.length > 0 ? images[0] : '';
            return (
            <Card key={activation.id} className={`overflow-hidden flex flex-row md:flex-col border-[#9C7C38]/20 hover:border-[#9C7C38]/50 transition-colors shadow-sm relative group ${selectedIds.has(activation.id) ? 'ring-2 ring-indigo-500' : ''}`}>
              <div className="absolute top-2 left-2 z-20 md:top-3 md:left-3">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 md:w-5 md:h-5 cursor-pointer shadow-sm"
                  checked={selectedIds.has(activation.id)}
                  onChange={() => handleSelectOne(activation.id)}
                />
              </div>
              <Link to={`/records/activations/${activation.id}`} className="flex flex-row md:flex-col w-full">
                <div className="w-20 md:w-full md:h-48 relative bg-slate-100 shrink-0">
                  {firstImage && (
                    <img 
                      src={firstImage} 
                      alt={activation.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {images.length > 1 && (
                    <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/60 rounded px-1.5 py-0.5 text-white text-[10px] md:text-xs">
                      1/{images.length}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 md:top-3 md:right-3 md:bottom-auto">
                    <Badge variant="secondary" className="bg-black/60 text-white border-none backdrop-blur-sm text-[9px] md:text-xs px-1.5 py-0.5 md:px-2.5 md:py-0.5">
                      {format(new Date(activation.createdAt), "d MMM", { locale: es })}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-2.5 md:p-5 flex-1 flex flex-col min-w-0">
                  <h3 className="font-bold text-sm md:text-lg text-slate-900 mb-1 line-clamp-1 pl-5 md:pl-6 group-hover:text-[#9C7C38] transition-colors">{activation.title}</h3>
                  
                  <div className="space-y-1 md:space-y-2 mb-1 md:mb-4 flex-1">
                    <div className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                      <Store className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium text-slate-900 block truncate leading-tight">{getClientName(activation.clientId)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                      <Hash className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{getClientNumber(activation.clientId) || 'Sin número'}</span>
                    </div>
                  </div>

                  {activation.description && (
                    <div className="mt-auto pt-1.5 md:pt-3 border-t border-slate-100">
                      <p className="text-[11px] md:text-sm text-slate-500 line-clamp-1 md:line-clamp-2 italic leading-tight">
                        "{activation.description}"
                      </p>
                    </div>
                  )}
                  
                  {activation.feedback && (
                    <div className="mt-2 bg-[#9C7C38]/10 p-2 md:p-3 rounded-lg border border-[#9C7C38]/20">
                      <p className="text-[10px] md:text-xs text-[#9C7C38] font-medium mb-0.5 md:mb-1">Feedback:</p>
                      <p className="text-[11px] md:text-sm text-slate-700 italic line-clamp-2 leading-tight">"{activation.feedback}"</p>
                    </div>
                  )}
                </div>
              </Link>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
};
