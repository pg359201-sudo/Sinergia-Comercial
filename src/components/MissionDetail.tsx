import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button, Label, Input } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CheckCircle2, UploadCloud, ArrowLeft, Pencil, Save, X } from 'lucide-react';
import { compressAndUploadImage } from '../utils/imageUpload';

export const MissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, missions, clients, updateMissionStatus, updateMissionDetails } = useAppStore();
  
  const mission = missions.find(m => m.id === id);
  const client = clients.find(c => c?.id === mission?.clientId);
  
  const [evidenceUrl, setEvidenceUrl] = useState(mission?.evidenceUrl || '');
  const [notes, setNotes] = useState(mission?.notes || '');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [noSpecificClient, setNoSpecificClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(mission?.title || '');
  const [editDescription, setEditDescription] = useState(mission?.description || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!mission) {
    return <div>Misión no encontrada</div>;
  }

  const isEscritorio = currentUser?.role === 'escritorio';
  const isTerreno = currentUser?.role === 'terreno';

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const isPhotoRequired = mission.clientId || !noSpecificClient;

    if (isPhotoRequired && !evidenceUrl) {
      alert('Debes subir evidencia fotográfica.');
      return;
    }
    if (!mission.clientId && !selectedClientId && !noSpecificClient) {
      alert('Debes seleccionar un cliente o marcar "Sin cliente específico" para esta misión general.');
      return;
    }
    const finalClientId = noSpecificClient ? undefined : (selectedClientId || undefined);
    updateMissionStatus(mission.id, 'completed', evidenceUrl, notes, finalClientId);
    navigate('/missions');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await compressAndUploadImage(file);
      setEvidenceUrl(url);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Error al procesar y subir la imagen: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDetails = () => {
    if (mission) {
      updateMissionDetails(mission.id, editTitle, editDescription);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          {isEditing ? (
            <Input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              className="text-2xl font-bold mb-2 h-auto py-2"
            />
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mission.title}</h1>
          )}
          <p className="mt-2 text-slate-600">Detalle de la misión y ejecución.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={mission.status === 'completed' ? 'success' : mission.status === 'in-progress' ? 'warning' : 'info'} className="text-sm px-3 py-1">
            {mission.status === 'completed' ? 'Completa' : mission.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
          </Badge>
          {isEscritorio && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center justify-center w-8 h-8 p-0" title="Editar">
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          {isEscritorio && isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setIsEditing(false);
                setEditTitle(mission.title);
                setEditDescription(mission.description);
              }} className="flex items-center justify-center w-8 h-8 p-0" title="Cancelar">
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSaveDetails} className="flex items-center justify-center w-8 h-8 p-0" title="Guardar">
                <Save className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label className="text-slate-500 mb-1 block">Cliente</Label>
            <div className="flex items-center gap-2 text-slate-900 font-medium">
              {client ? client.name : 'Misión General'}
            </div>
          </div>
          <div>
            <Label className="text-slate-500 mb-1 block">Fecha de Creación</Label>
            <div className="flex items-center gap-2 text-slate-900 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              {format(new Date(mission.createdAt), 'dd MMMM yyyy', { locale: es })}
            </div>
          </div>
        </div>

        <div>
          <Label className="text-slate-500 mb-2 block">Descripción de la Misión</Label>
          {isEditing ? (
            <textarea
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 border border-slate-100">
              {mission.description}
            </div>
          )}
        </div>
      </Card>

      {mission.status === 'completed' && (
        <Card className="p-6 border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Ejecución Completada</h2>
            <span className="text-sm text-slate-500 ml-auto">
              {mission.completedAt && format(new Date(mission.completedAt), 'dd MMM yyyy HH:mm', { locale: es })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-500 mb-2 block">Evidencia Fotográfica</Label>
              {mission.evidenceUrl ? (
                <img src={mission.evidenceUrl} alt="Evidencia" className="rounded-xl w-full object-cover aspect-video border border-slate-200" referrerPolicy="no-referrer" />
              ) : (
                <div className="bg-slate-100 rounded-xl w-full aspect-video flex items-center justify-center text-slate-400">
                  Sin evidencia
                </div>
              )}
            </div>
            <div>
              <Label className="text-slate-500 mb-2 block">Notas del Ejecutor</Label>
              <div className="bg-white p-4 rounded-xl text-slate-700 border border-slate-200 min-h-[100px]">
                {mission.notes || 'Sin notas adicionales.'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {isTerreno && mission.status !== 'completed' && (
        <Card className="p-6 border-indigo-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Reportar Ejecución</h2>
          <form onSubmit={handleComplete} className="space-y-6">
            {!mission.clientId && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="client-select" className="mb-2 block">Asignar a Cliente *</Label>
                  <select
                    id="client-select"
                    className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    required={!noSpecificClient}
                    disabled={noSpecificClient}
                  >
                    <option value="">Selecciona un cliente...</option>
                    {[...clients].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="no-specific-client"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    checked={noSpecificClient}
                    onChange={(e) => {
                      setNoSpecificClient(e.target.checked);
                      if (e.target.checked) setSelectedClientId('');
                    }}
                  />
                  <Label htmlFor="no-specific-client" className="text-sm font-normal text-slate-600 cursor-pointer">
                    Sin cliente específico
                  </Label>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-2 block">
                Evidencia Fotográfica {(!mission.clientId && noSpecificClient) ? '(Opcional)' : '*'}
              </Label>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {evidenceUrl ? (
                <div className="relative">
                  <img src={evidenceUrl} alt="Evidencia" className="rounded-xl w-full object-cover aspect-video border border-slate-200" referrerPolicy="no-referrer" />
                  <Button type="button" variant="secondary" className="absolute top-2 right-2 text-xs" onClick={() => fileInputRef.current?.click()}>
                    Cambiar Foto
                  </Button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-4">Sube una foto de la exhibición o material POP colocado.</p>
                  <Button type="button" variant="outline" disabled={isUploading}>
                    {isUploading ? 'Procesando imagen...' : 'Tomar Foto / Subir'}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2 block">Notas Adicionales</Label>
              <textarea
                id="notes"
                className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                placeholder="Detalles sobre la ejecución, problemas encontrados, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={((mission.clientId || !noSpecificClient) && !evidenceUrl) || (!mission.clientId && !selectedClientId && !noSpecificClient)}>
              Completar Misión y Enviar Retroalimentación
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
