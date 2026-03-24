import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Input } from './ui';
import { Store, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientsList = () => {
  const { clients } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const parseUC12mm = (value: string | undefined): number => {
    if (!value || value === '0') return 0;
    let cleanValue = value.toString();
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else if (cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(',', '.');
    }
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  };

  const filteredClients = clients
    .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => parseUC12mm(b.uc12mm) - parseUC12mm(a.uc12mm));

  const formatUC12mm = (value: string | undefined) => {
    if (!value || value === '0') return '0';
    let cleanValue = value.toString();
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else if (cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(',', '.');
    }
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return value;
    return Math.round(num).toLocaleString('es-AR');
  };

  const formatTextWithoutPrefix = (text: string | undefined) => {
    if (!text) return '';
    return text.replace(/^\s*\d+\s*-\s*/, '').trim();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Directorio de Clientes</h1>
          <p className="mt-1 text-xs text-slate-500">Gestiona los Puntos de Venta (PDV) y revisa su historial de actividad.</p>
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
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{client.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <span className="uppercase tracking-wider opacity-70">UC 12mm:</span>
                      <span className="font-medium text-slate-500 truncate max-w-[100px]">{formatUC12mm(client.uc12mm)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400 mb-3">
                    <div className="flex flex-col">
                      <span className="uppercase tracking-wider opacity-70">Ruta</span>
                      <span className="font-medium text-slate-500 truncate max-w-[120px]">{client.route}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="uppercase tracking-wider opacity-70">Canal</span>
                      <span className="font-medium text-slate-500 truncate max-w-[100px]">{formatTextWithoutPrefix(client.channel)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="uppercase tracking-wider opacity-70">GEC</span>
                      <span className="font-medium text-slate-500 truncate max-w-[100px]">{formatTextWithoutPrefix(client.gec)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-indigo-600 font-medium flex items-center gap-1 text-xs hover:text-indigo-700 transition-colors">
                      Ver historial <ChevronRight className="w-3 h-3" />
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
