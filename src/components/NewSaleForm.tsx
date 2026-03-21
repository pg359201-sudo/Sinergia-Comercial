import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Label, Input } from './ui';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export const NewSaleForm = () => {
  const navigate = useNavigate();
  const { clients, addSale, currentUser } = useAppStore();
  
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);
  const [clientId, setClientId] = useState(clients[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !clientId || quantity <= 0 || amount <= 0) return;

    addSale({
      product,
      quantity,
      amount,
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
          <ShoppingCart className="w-7 h-7 md:w-8 md:h-8 text-emerald-500" />
          Venta Táctica
        </h1>
        <p className="mt-1 text-sm text-slate-600">Registra una reposición rápida.</p>
      </div>

      <Card className="p-5 md:p-6 border-emerald-200 bg-emerald-50/30">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="client" className="mb-2 block text-sm md:text-base">Cliente (PDV)</Label>
            <select
              id="client"
              className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-xl border bg-white"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.route}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="product" className="mb-2 block text-sm md:text-base">Producto</Label>
            <Input
              id="product"
              className="py-3 h-12 text-base rounded-xl"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ej: Whisky White Horse 750ml"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="mb-2 block text-sm md:text-base">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                className="py-3 h-12 text-base rounded-xl"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount" className="mb-2 block text-sm md:text-base">Monto Total ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                className="py-3 h-12 text-base rounded-xl"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-emerald-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="ghost" className="w-full sm:w-auto py-3" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" className="w-full sm:w-auto py-3 bg-emerald-600 hover:bg-emerald-700 text-base">Registrar Venta</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
