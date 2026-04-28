import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Store, Calendar, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SalesList = () => {
  const { currentUser, sales, clients, users, deleteSales, updateSaleStatus } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [saleToComplete, setSaleToComplete] = useState<string | null>(null);

  const isEscritorio = currentUser?.role === 'escritorio';
  const displaySales = isEscritorio ? sales : sales.filter(s => s.createdBy === currentUser?.id);

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
    deleteSales(Array.from(selectedIds));
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
              ¿Estás seguro de que deseas eliminar las {selectedIds.size} ventas seleccionadas? Esta acción no se puede deshacer.
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

      {saleToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Completar venta</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas marcar esta venta como completada?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSaleToComplete(null)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                updateSaleStatus(saleToComplete, 'completed');
                setSaleToComplete(null);
              }}>
                Completar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Ventas</h1>
          <p className="mt-1 text-xs text-slate-500">
            {isEscritorio ? 'Reposiciones y ventas rápidas ejecutadas por agentes.' : 'Tus ventas tácticas registradas.'}
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
            <Link to="/sales/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8A7F53] hover:bg-[#786E48] text-white">
                <Plus className="w-4 h-4" />
                Registrar Venta
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${isEscritorio ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {displaySales.map((sale) => {
          const client = clients.find(c => c.id === sale.clientId);
          
          return (
            <Card key={sale.id} className={`p-3 md:p-5 flex flex-col border-t-4 border-t-[#8A7F53] relative ${selectedIds.has(sale.id) ? 'ring-2 ring-indigo-500' : ''}`}>
              <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 md:w-5 md:h-5 cursor-pointer shadow-sm"
                  checked={selectedIds.has(sale.id)}
                  onChange={() => handleSelectOne(sale.id)}
                />
              </div>
              <div className="flex justify-between items-start mb-2 md:mb-3 pr-6 md:pr-8">
                <div className="p-1.5 md:p-2 bg-[#8A7F53]/10 text-[#8A7F53] rounded-lg">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(sale.createdAt), 'dd MMM HH:mm', { locale: es })}
                </span>
              </div>
              
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">{sale.product}</h3>
              <div className="flex justify-between items-end mb-2 md:mb-4">
                <span className="text-xs md:text-sm text-slate-600">Cant: {sale.quantity}</span>
              </div>
              
              <div className="space-y-1.5 md:space-y-2 mt-auto pt-2 md:pt-3 border-t border-slate-100">
                <div className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <Store className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium">{client?.name}</span>
                    {client?.clientNumber && (
                      <span className="text-xs text-slate-400">#{client.clientNumber}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    sale.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {sale.status === 'completed' ? 'COMPLETADA' : 'PENDIENTE'}
                  </span>
                </div>

                {isEscritorio && sale.status === 'pending' && (
                  <div className="flex gap-2 mt-2 md:mt-4">
                    <Button variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs md:text-sm h-8 md:h-10" onClick={() => {
                      setSaleToComplete(sale.id);
                    }}>
                      Marcar Completada
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {displaySales.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No hay ventas registradas.
          </div>
        )}
      </div>
    </div>
  );
};
