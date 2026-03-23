import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button, Label } from './ui';
import { ArrowLeft, Calendar, User, Store, Camera, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const RecordDetail = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { missions, alerts, sales, activations, clients, users, updateActivationFeedback, currentUser } = useAppStore();

  const [feedbackText, setFeedbackText] = useState('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);

  let recordData: any = null;
  let recordTypeLabel = '';
  
  if (type === 'missions') {
    recordData = missions.find(m => m.id === id);
    recordTypeLabel = 'Misión';
  } else if (type === 'alerts') {
    recordData = alerts.find(a => a.id === id);
    recordTypeLabel = 'Alerta';
  } else if (type === 'sales') {
    recordData = sales.find(s => s.id === id);
    recordTypeLabel = 'Venta Táctica';
  } else if (type === 'activations') {
    recordData = activations.find(a => a.id === id);
    recordTypeLabel = 'Activación';
  }

  if (!recordData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Registro no encontrado</h2>
        <Button onClick={() => navigate('/records')}>Volver a Registros</Button>
      </div>
    );
  }

  const client = clients.find(c => c.id === recordData.clientId);
  const user = users.find(u => u.id === (recordData.createdBy || recordData.assignedTo));

  const handleSaveFeedback = () => {
    if (id) {
      updateActivationFeedback(id, feedbackText.trim());
      setIsEditingFeedback(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Detalle de Registro</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">{recordTypeLabel}</Badge>
      </div>

      <Card className="p-6 md:p-8 bg-white border-slate-200 shadow-sm space-y-8">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 font-medium">Cliente</p>
                <p className="font-bold text-slate-900">{client?.name || 'Desconocido'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 font-medium">Fecha de Registro</p>
                <p className="font-bold text-slate-900">
                  {format(new Date(recordData.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
                <p className="text-sm text-slate-600">
                  {format(new Date(recordData.createdAt), "HH:mm 'hrs'", { locale: es })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 font-medium">Usuario Responsable</p>
                <p className="font-bold text-slate-900">{user?.name || 'Desconocido'}</p>
                <p className="text-sm text-slate-600">{user?.role === 'terreno' ? 'Equipo de Terreno' : 'Escritorio'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specific Details */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Información de la Actividad</h3>
          
          {type === 'missions' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm text-slate-500 font-medium">Título de la Misión</p>
                <p className="font-bold text-slate-900 text-lg">{recordData.title}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Descripción</p>
                <p className="text-slate-700">{recordData.description}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Estado</p>
                <Badge variant={recordData.status === 'completed' ? 'success' : recordData.status === 'in-progress' ? 'warning' : 'default'}>
                  {recordData.status === 'completed' ? 'Completada' : recordData.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                </Badge>
              </div>
            </div>
          )}

          {type === 'alerts' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Tipo de Alerta</p>
                <Badge variant="warning" className="text-sm">
                  {recordData.type === 'competitor_action' ? 'Acción de la Competencia' : recordData.type === 'stock_out' ? 'Quiebre de Stock' : 'Oportunidad'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Descripción / Observación</p>
                <p className="text-slate-700">{recordData.description}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Estado de Revisión</p>
                <Badge variant={recordData.status === 'new' ? 'warning' : recordData.status === 'read' ? 'info' : 'success'}>
                  {recordData.status === 'new' ? 'Nueva' : recordData.status === 'read' ? 'Leída' : 'Accionada'}
                </Badge>
              </div>
            </div>
          )}

          {type === 'sales' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Producto Vendido</p>
                  <p className="font-bold text-slate-900 text-lg">{recordData.product}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Cantidad</p>
                  <p className="font-bold text-slate-900 text-lg">{recordData.quantity} unidades</p>
                </div>
              </div>
            </div>
          )}

          {type === 'activations' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm text-slate-500 font-medium">Título de la Activación</p>
                <p className="font-bold text-slate-900 text-lg">{recordData.title}</p>
              </div>
              {recordData.description && (
                <div>
                  <p className="text-sm text-slate-500 font-medium">Descripción</p>
                  <p className="text-slate-700">{recordData.description}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-200 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Feedback / Comentarios
                  </p>
                  {!isEditingFeedback && (
                    <Button variant="ghost" className="h-8 text-xs" onClick={() => {
                      setFeedbackText(recordData.feedback || '');
                      setIsEditingFeedback(true);
                    }}>
                      {recordData.feedback ? 'Editar' : 'Añadir Feedback'}
                    </Button>
                  )}
                </div>
                
                {isEditingFeedback ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      rows={3}
                      placeholder="Escribe un comentario o feedback sobre esta activación..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingFeedback(false)}>Cancelar</Button>
                      <Button size="sm" onClick={handleSaveFeedback} className="bg-indigo-600 hover:bg-indigo-700">Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    {recordData.feedback ? (
                      <p className="text-slate-700 italic">"{recordData.feedback}"</p>
                    ) : (
                      <p className="text-slate-400 text-sm italic">Sin feedback registrado.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Photo Evidence Section */}
        {recordData.evidenceUrl && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Evidencia Fotográfica
            </h3>
            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100">
              <img 
                src={recordData.evidenceUrl} 
                alt="Evidencia del registro" 
                className="w-full h-auto max-h-[500px] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
