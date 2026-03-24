import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Label } from './ui';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { AlertType } from '../types';

export const NewAlertForm = () => {
  const navigate = useNavigate();
  const { clients, addAlert, currentUser } = useAppStore();
  
  const [type, setType] = useState<AlertType>('competitor_action');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !clientId) return;

    addAlert({
      type,
      description,
      clientId,
      createdBy: currentUser!.id,
    });
    navigate('/alerts');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver</span>
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-amber-500" />
          Nueva Alerta
        </h1>
        <p className="mt-1 text-sm text-slate-600">Notifica al Headquarter sobre oportunidades inmediatas.</p>
      </div>

      <Card className="p-5 md:p-6 border-amber-200 bg-amber-50/30">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="type" className="mb-2 block text-sm md:text-base">Tipo de Alerta</Label>
            <select
              id="type"
              className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-xl border bg-white"
              value={type}
              onChange={(e) => setType(e.target.value as AlertType)}
            >
              <option value="competitor_action">Acción de la Competencia</option>
              <option value="stock_out">Quiebre de Stock</option>
              <option value="new_opportunity">Nueva Oportunidad</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <Label htmlFor="client" className="mb-2 block text-sm md:text-base">Cliente (PDV)</Label>
            <select
              id="client"
              className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-xl border bg-white"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {[...clients].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block text-sm md:text-base">Descripción de la Oportunidad</Label>
            <textarea
              id="description"
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[120px]"
              placeholder="Ej: Competencia sin stock en góndola principal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 mt-6 border-t border-amber-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="ghost" className="w-full sm:w-auto py-3" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" className="w-full sm:w-auto py-3 bg-amber-600 hover:bg-amber-700 text-base">Enviar Alerta</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
