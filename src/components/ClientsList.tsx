import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Input } from './ui';
import { MapPin, Store, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientsList = () => {
  const { clients } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Directorio de Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">Gestiona los Puntos de Venta (PDV) y revisa su historial de actividad.</p>
        </div>
        
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar cliente por nombre..."
            className="pl-10 py-2.5 w-full rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No se encontraron clientes</h3>
          <p className="text-slate-500 mt-2">
            No hay ningún cliente que coincida con "{searchTerm}".
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map(client => (
            <Link key={client.id} to={`/clients/${client.id}`} className="block">
              <Card className="p-5 hover:border-indigo-300 transition-colors cursor-pointer h-full flex flex-col shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{client.name}</h3>
                    <p className="text-sm text-slate-500">{client.channel}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">{client.route}</Badge>
                    <span className="text-indigo-600 font-medium flex items-center gap-1">
                      Ver historial <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
