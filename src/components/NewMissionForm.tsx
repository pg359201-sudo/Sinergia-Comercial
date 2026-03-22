import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Label, Input } from './ui';
import { ArrowLeft } from 'lucide-react';

export const NewMissionForm = () => {
  const navigate = useNavigate();
  const { clients, users, addMission, currentUser } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState(users.find(u => u.role === 'terreno')?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !clientId || !assignedTo) return;

    addMission({
      title,
      description,
      clientId,
      assignedTo,
      createdBy: currentUser!.id,
    });
    navigate('/missions');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nueva Misión</h1>
        <p className="mt-2 text-slate-600">Asigna una directiva comercial al equipo de terreno.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="mb-2 block">Título de la Misión</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Ganar cabecera central"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Descripción Detallada</Label>
            <textarea
              id="description"
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px]"
              placeholder="Detalla qué se debe ejecutar en el PDV..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="client" className="mb-2 block">Cliente (PDV)</Label>
              <select
                id="client"
                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border"
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
              <Label htmlFor="assignee" className="mb-2 block">Asignar a (Terreno)</Label>
              <select
                id="assignee"
                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                {users.filter(u => u.role === 'terreno').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">Crear Misión</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
