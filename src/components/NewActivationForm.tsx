import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Label, Input } from './ui';
import { ArrowLeft, Camera, Upload, CheckCircle2 } from 'lucide-react';
import { compressAndUploadImage } from '../utils/imageUpload';

export const NewActivationForm = () => {
  const navigate = useNavigate();
  const { clients, addActivation, currentUser } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (evidenceUrls.length + files.length > 3) {
      alert('Puedes subir un máximo de 3 imágenes en total.');
      return;
    }

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await compressAndUploadImage(file);
        urls.push(url);
      }
      setEvidenceUrls(prev => [...prev, ...urls].slice(0, 3));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Error al procesar y subir la imagen: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setEvidenceUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !clientId || evidenceUrls.length === 0) return;

    addActivation({
      title,
      category,
      description,
      clientId,
      createdBy: currentUser!.id,
      evidenceUrl: JSON.stringify(evidenceUrls),
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
          <Camera className="w-7 h-7 md:w-8 md:h-8 text-[#9C7C38]" />
          Nueva Activación
        </h1>
        <p className="mt-1 text-sm text-slate-600">Registra una exhibición, material POP o acción especial en el PDV.</p>
      </div>

      <Card className="p-5 md:p-6 border-[#9C7C38]/30 bg-[#9C7C38]/10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="client" className="mb-2 block text-sm md:text-base">Cliente (PDV)</Label>
            <select
              id="client"
              className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-[#9C7C38] focus:border-[#9C7C38] rounded-xl border bg-white"
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
            <Label htmlFor="category" className="mb-2 block text-sm md:text-base">Categoría</Label>
            <select
              id="category"
              className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-[#9C7C38] focus:border-[#9C7C38] rounded-xl border bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecciona una categoría...</option>
              <option value="Refrescos">Refrescos</option>
              <option value="Jugos">Jugos</option>
              <option value="Isotónicos">Isotónicos</option>
              <option value="Energizantes">Energizantes</option>
              <option value="Diageo">Diageo</option>
              <option value="Vinos">Vinos</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block text-sm md:text-base">Descripción (Opcional)</Label>
            <textarea
              id="description"
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9C7C38] focus:border-transparent min-h-[80px] md:min-h-[100px]"
              placeholder="Detalles sobre la exhibición, cantidad de caras, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Label className="mb-2 block text-sm md:text-base">Registro Fotográfico (De 1 a 3 imágenes)</Label>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {evidenceUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {evidenceUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={url} alt={`Evidencia ${idx + 1}`} className="w-full h-32 md:h-40 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button type="button" variant="secondary" className="text-xs h-8" onClick={() => removeImage(idx)}>
                        Eliminar Foto
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {evidenceUrls.length < 3 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-colors ${
                  isUploading ? 'border-[#9C7C38]/50 bg-[#9C7C38]/10' : 'border-slate-300 hover:border-[#9C7C38] hover:bg-slate-50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center text-[#9C7C38]">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-[#9C7C38] mb-2"></div>
                    <span className="font-medium text-sm md:text-base">Subiendo imagen...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 text-slate-400" />
                    <span className="font-medium text-sm md:text-base text-slate-700">Tomar foto o subir archivo ({evidenceUrls.length}/3)</span>
                    <span className="text-xs md:text-sm mt-1">Soporta JPG, PNG</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-[#9C7C38]/30 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="ghost" className="w-full sm:w-auto py-3" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto py-3 bg-[#9C7C38] hover:bg-[#8A6D31] text-white text-base"
              disabled={evidenceUrls.length === 0 || isUploading}
            >
              Registrar Activación
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
