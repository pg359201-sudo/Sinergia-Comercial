import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Badge } from './ui';
import { ArrowLeft, Store, MapPin, Calendar, ClipboardList, BellRing, ShoppingCart, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mission, Alert, TacticalSale, Activation } from '../types';

export const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, missions, alerts, sales, activations, users } = useAppStore();

  const client = clients.find(c => c.id === id);

  if (!client) {
    return <div className="p-8 text-center text-slate-500">Cliente no encontrado</div>;
  }

  // Combine all history
  const history = [
    ...missions.filter(m => m.clientId === id).map(m => ({ type: 'mission' as const, date: m.createdAt, data: m })),
    ...alerts.filter(a => a.clientId === id).map(a => ({ type: 'alert' as const, date: a.createdAt, data: a })),
    ...sales.filter(s => s.clientId === id).map(s => ({ type: 'sale' as const, date: s.createdAt, data: s })),
    ...activations.filter(a => a.clientId === id).map(a => ({ type: 'activation' as const, date: a.createdAt, data: a })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Desconocido';

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

  return (
    <div className="space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver a Clientes</span>
      </button>

      <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{client.name}</h1>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">{client.gec}</Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-slate-600 mt-3">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {client.address}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Visita: {client.visitDay}</span>
              <span className="flex items-center gap-2 text-indigo-600 font-medium">{client.route}</span>
              {client.uc12mm && <span className="flex items-center gap-2 text-slate-500 font-medium">UC 12mm: {formatUC12mm(client.uc12mm)}</span>}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Historial de Actividad</h2>
        
        {history.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-500">No hay registros de actividad para este cliente.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const dateFormatted = format(new Date(item.date), "d 'de' MMMM, yyyy - HH:mm", { locale: es });
              
              if (item.type === 'mission') {
                const m = item.data as Mission;
                return (
                  <Card key={`m-${m.id}`} className="p-5 border-l-4 border-l-blue-500 flex flex-col sm:flex-row gap-4 shadow-sm">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit shrink-0">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">Misión: {m.title}</h3>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md shrink-0">{dateFormatted}</span>
                      </div>
                      <p className="text-slate-600 mb-4 text-sm md:text-base">{m.description}</p>
                      <div className="flex flex-wrap gap-3 items-center text-sm pt-3 border-t border-slate-100">
                        <Badge variant={m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'warning' : 'default'}>
                          {m.status === 'completed' ? 'Completada' : m.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                        </Badge>
                        <span className="text-slate-500">Asignada a: <span className="font-medium text-slate-700">{getUserName(m.assignedTo)}</span></span>
                      </div>
                    </div>
                  </Card>
                );
              }

              if (item.type === 'alert') {
                const a = item.data as Alert;
                return (
                  <Card key={`a-${a.id}`} className="p-5 border-l-4 border-l-amber-500 flex flex-col sm:flex-row gap-4 shadow-sm">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl h-fit shrink-0">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">Alerta: {a.type === 'competitor_action' ? 'Competencia' : a.type === 'stock_out' ? 'Quiebre Stock' : 'Oportunidad'}</h3>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md shrink-0">{dateFormatted}</span>
                      </div>
                      <p className="text-slate-600 mb-4 text-sm md:text-base">{a.description}</p>
                      <div className="flex flex-wrap gap-3 items-center text-sm pt-3 border-t border-slate-100">
                        <Badge variant={a.status === 'new' ? 'warning' : a.status === 'read' ? 'info' : 'success'}>
                          {a.status === 'new' ? 'Nueva' : a.status === 'read' ? 'Leída' : 'Accionada'}
                        </Badge>
                        <span className="text-slate-500">Reportada por: <span className="font-medium text-slate-700">{getUserName(a.createdBy)}</span></span>
                      </div>
                    </div>
                  </Card>
                );
              }

              if (item.type === 'sale') {
                const s = item.data as TacticalSale;
                return (
                  <Card key={`s-${s.id}`} className="p-5 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl h-fit shrink-0">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">Venta Táctica</h3>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md shrink-0">{dateFormatted}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-2 mb-4">
                        <div>
                          <p className="text-slate-800 font-medium text-base">{s.product}</p>
                          <p className="text-slate-500 text-sm mt-1">Cantidad: {s.quantity}</p>
                        </div>
                        {s.amount > 0 && <span className="text-xl font-bold text-emerald-600 mt-2 sm:mt-0">${s.amount.toLocaleString()}</span>}
                      </div>
                      <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
                        Vendido por: <span className="font-medium text-slate-700">{getUserName(s.createdBy)}</span>
                      </div>
                    </div>
                  </Card>
                );
              }

              if (item.type === 'activation') {
                const act = item.data as Activation;
                return (
                  <Card key={`act-${act.id}`} className="p-5 border-l-4 border-l-indigo-500 flex flex-col sm:flex-row gap-4 shadow-sm">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">Activación: {act.title}</h3>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md shrink-0">{dateFormatted}</span>
                      </div>
                      {act.description && <p className="text-slate-600 mb-4 text-sm md:text-base">{act.description}</p>}
                      
                      {act.evidenceUrl && (
                        <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-slate-200 max-w-sm">
                          <img src={act.evidenceUrl} alt="Evidencia" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
                        Registrada por: <span className="font-medium text-slate-700">{getUserName(act.createdBy)}</span>
                      </div>
                    </div>
                  </Card>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
