import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Badge } from './ui';
import { ArrowLeft, Store, Calendar, ClipboardList, BellRing, ShoppingCart, Camera } from 'lucide-react';
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

  const getClientNumber = (name: string) => {
    if (!name) return '';
    // Look for exactly 10 digits
    const match10 = name.match(/(\d{10})/);
    if (match10) return match10[1];
    
    // Fallback: look for the first sequence of numbers that is at least 6 digits long
    const matchNum = name.match(/(\d{6,})/);
    return matchNum ? matchNum[1] : '';
  };

  const formatTextWithoutPrefix = (text: string | undefined) => {
    if (!text) return '';
    return text.replace(/^\s*\d+\s*-\s*/, '').trim();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver a Clientes</span>
        </button>
        <Link to={`/missions/new?clientId=${client.id}`} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
          <ClipboardList className="w-4 h-4" />
          Crear Misión
        </Link>
      </div>

      <Card className="p-3 md:p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">{client.name}</h1>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0">{formatTextWithoutPrefix(client.gec)}</Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Visita: {client.visitDay}</span>
              <span className="flex items-center gap-1.5 text-indigo-600 font-medium">{client.route}</span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">Nº Cliente: {getClientNumber(client.name) || 'N/A'}</span>
              {client.uc12mm && <span className="flex items-center gap-1.5 text-slate-500 font-medium">UC 12mm: {formatUC12mm(client.uc12mm)}</span>}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Historial de Actividad</h2>
        
        {history.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">No hay registros de actividad para este cliente.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => {
              const dateFormatted = format(new Date(item.date), "d 'de' MMMM, yyyy - HH:mm", { locale: es });
              
              if (item.type === 'mission') {
                const m = item.data as Mission;
                return (
                  <Card key={`m-${m.id}`} className="p-3 md:p-4 border-l-4 border-l-blue-500 flex flex-col sm:flex-row gap-3 shadow-sm">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit shrink-0">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-1.5 gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-tight truncate">Misión: {m.title}</h3>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{dateFormatted}</span>
                      </div>
                      <p className="text-slate-600 mb-3 text-xs md:text-sm line-clamp-2">{m.description}</p>
                      <div className="flex flex-wrap gap-2 items-center text-xs pt-2 border-t border-slate-100">
                        <Badge variant={m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'warning' : 'default'} className="text-[10px] px-1.5 py-0">
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
                  <Card key={`a-${a.id}`} className="p-3 md:p-4 border-l-4 border-l-amber-500 flex flex-col sm:flex-row gap-3 shadow-sm">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg h-fit shrink-0">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-1.5 gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-tight truncate">Alerta: {a.type === 'competitor_action' ? 'Competencia' : a.type === 'stock_out' ? 'Quiebre Stock' : 'Oportunidad'}</h3>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{dateFormatted}</span>
                      </div>
                      <p className="text-slate-600 mb-3 text-xs md:text-sm line-clamp-2">{a.description}</p>
                      <div className="flex flex-wrap gap-2 items-center text-xs pt-2 border-t border-slate-100">
                        <Badge variant={a.status === 'new' ? 'warning' : a.status === 'read' ? 'info' : 'success'} className="text-[10px] px-1.5 py-0">
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
                  <Card key={`s-${s.id}`} className="p-3 md:p-4 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row gap-3 shadow-sm">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg h-fit shrink-0">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-1.5 gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-tight truncate">Venta Táctica</h3>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{dateFormatted}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-1 mb-3">
                        <div>
                          <p className="text-slate-800 font-medium text-sm">{s.product}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Cantidad: {s.quantity}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                        Vendido por: <span className="font-medium text-slate-700">{getUserName(s.createdBy)}</span>
                      </div>
                    </div>
                  </Card>
                );
              }

              if (item.type === 'activation') {
                const act = item.data as Activation;
                return (
                  <Link key={`act-${act.id}`} to={`/records/activations/${act.id}`} className="block">
                    <Card className="p-3 md:p-4 border-l-4 border-l-indigo-500 flex flex-col sm:flex-row gap-3 shadow-sm hover:border-indigo-400 transition-colors">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg h-fit shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-1.5 gap-2">
                          <h3 className="font-bold text-slate-900 text-base leading-tight truncate">Activación: {act.title}</h3>
                          <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{dateFormatted}</span>
                        </div>
                        {act.description && <p className="text-slate-600 mb-3 text-xs md:text-sm line-clamp-2">{act.description}</p>}
                        
                        {act.evidenceUrl && (
                          <div className="mt-2 mb-3 rounded-lg overflow-hidden border border-slate-200 max-w-[200px]">
                            <img src={act.evidenceUrl} alt="Evidencia" className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        
                        {act.feedback && (
                          <div className="mb-3 bg-indigo-50 p-2 rounded border border-indigo-100">
                            <p className="text-[10px] text-indigo-800 font-medium mb-0.5">Feedback:</p>
                            <p className="text-xs text-indigo-900 italic line-clamp-2">"{act.feedback}"</p>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                          Registrada por: <span className="font-medium text-slate-700">{getUserName(act.createdBy)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
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
