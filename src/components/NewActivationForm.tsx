import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Label, Input } from './ui';
import { ArrowLeft, Camera, Upload, CheckCircle2 } from 'lucide-react';

export const NewActivationForm = () => {
  const navigate = useNavigate();
  const { clients, addActivation, currentUser } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setEvidenceUrl(base64);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Error al procesar la imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId || !evidenceUrl) return;

    addActivation({
      title,
      description,
      clientId,
      createdBy: currentUser!.id,
      evidenceUrl,
    });
    navigate('/activations');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver</span>
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Camera className="w-7 h-7 md:w-8 md:h-8 text-indigo-500" />
          Nueva Activación
        </h1>
        <p className="mt-1 text-sm text-slate-600">Registra una exhibición, material POP o acción especial en el PDV.</p>
      </div>

      <Card className="p-5 md:p-6 border-indigo-200 bg-indigo-50/30">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="client" className="mb-2 block text-sm md:text-base">Cliente (PDV)</Label>
            <select
              id="client"
              className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-xl border bg-white"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="title" className="mb-2 block text-sm md:text-base">Título de la Activación</Label>
            <Input
              id="title"
              className="py-3 h-12 text-base rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Exhibición Powerade"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block text-sm md:text-base">Descripción (Opcional)</Label>
            <textarea
              id="description"
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
              placeholder="Detalles sobre la exhibición, cantidad de caras, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Label className="mb-2 block text-sm md:text-base">Registro Fotográfico (Requerido)</Label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {!evidenceUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isUploading ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center text-indigo-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                    <span className="font-medium">Subiendo imagen...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                    <span className="font-medium text-slate-700">Tomar foto o subir archivo</span>
                    <span className="text-sm mt-1">Soporta JPG, PNG</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={evidenceUrl} alt="Evidencia" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Cambiar Foto
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-indigo-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="ghost" className="w-full sm:w-auto py-3" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto py-3 bg-indigo-600 hover:bg-indigo-700 text-base"
              disabled={!evidenceUrl || isUploading}
            >
              Registrar Activación
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
