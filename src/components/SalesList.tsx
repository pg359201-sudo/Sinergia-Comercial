import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, ShoppingCart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SalesList = () => {
  const { currentUser, sales, clients, users } = useAppStore();

  const isEscritorio = currentUser?.role === 'escritorio';
  const displaySales = isEscritorio ? sales : sales.filter(s => s.createdBy === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Ventas</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isEscritorio ? 'Reposiciones y ventas rápidas ejecutadas en terreno.' : 'Tus ventas tácticas registradas.'}
          </p>
        </div>
        {!isEscritorio && (
          <Link to="/sales/new">
            <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Registrar Venta</span>
            </Button>
          </Link>
        )}
      </div>

      <div className={`grid gap-4 ${isEscritorio ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {displaySales.map((sale) => {
          const client = clients.find(c => c.id === sale.clientId);
          const creator = users.find(u => u.id === sale.createdBy);
          
          return (
            <Card key={sale.id} className="p-5 flex flex-col border-t-4 border-t-emerald-500">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(sale.createdAt), 'dd MMM HH:mm', { locale: es })}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{sale.product}</h3>
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm text-slate-600">Cant: {sale.quantity}</span>
                <span className="text-xl font-bold text-emerald-600">${sale.amount.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2 mt-auto pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{client?.name}</span>
                </div>
                
                {isEscritorio && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <img src={creator?.avatar} alt={creator?.name} className="w-5 h-5 rounded-full shrink-0" />
                    <span className="truncate">Vendido por: {creator?.name}</span>
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
