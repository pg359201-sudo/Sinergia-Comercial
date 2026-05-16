import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Label, Input, Textarea } from './ui';
import { ClientSelect } from './ClientSelect';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export const NewSaleForm = () => {
  const navigate = useNavigate();
  const { clients, addSale, currentUser } = useAppStore();
  
  const [product, setProduct] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !clientId) return;

    addSale({
      product,
      quantity: 1,
      clientId,
      createdBy: currentUser!.id,
    });
    navigate('/sales');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver</span>
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 md:w-8 md:h-8 text-[#8A7F53]" />
          Venta Táctica
        </h1>
        <p className="mt-1 text-sm text-slate-600">Registra una reposición rápida.</p>
      </div>

      <Card className="p-5 md:p-6 border-[#8A7F53]/30 bg-[#8A7F53]/10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="client" className="mb-2 block text-sm md:text-base">Cliente (PDV)</Label>
            <ClientSelect
              clients={clients}
              value={clientId}
              onChange={setClientId}
              className="focus:ring-[#8A7F53] focus:border-[#8A7F53]"
            />
          </div>

          <div>
            <Label htmlFor="product" className="mb-2 block text-sm md:text-base">Producto(s)</Label>
            <Textarea
              id="product"
              className="py-3 text-base rounded-xl min-h-[160px] md:min-h-[200px] resize-y"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ej:&#10;Whisky White Horse 750ml&#10;Vodka Smirnoff 1L"
              required
            />
          </div>

          <div className="pt-4 mt-6 border-t border-[#8A7F53]/30 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="ghost" className="w-full sm:w-auto py-3" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" className="w-full sm:w-auto py-3 bg-[#8A7F53] hover:bg-[#786E48] text-white text-base">Registrar Venta</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
