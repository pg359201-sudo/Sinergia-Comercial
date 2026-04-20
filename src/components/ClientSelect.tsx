import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Client } from '../types';

interface ClientSelectProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ClientSelect: React.FC<ClientSelectProps> = ({ 
  clients, 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Buscar por nombre o número...",
  className = "focus:ring-indigo-500 focus:border-indigo-500"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const selected = clients.find(c => c.id === value);
      if (selected) {
        setSearchTerm(`${selected.name} ${selected.clientNumber ? `(#${selected.clientNumber})` : ''}`);
      } else {
         setSearchTerm('');
      }
    } else {
      setSearchTerm('');
    }
  }, [value, clients]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Si hay un valor, revertimos visualmente a ese valor
        if (value) {
            const selected = clients.find(c => c.id === value);
            if (selected) setSearchTerm(`${selected.name} ${selected.clientNumber ? `(#${selected.clientNumber})` : ''}`);
        } else {
            setSearchTerm('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, clients]);

  const filteredClients = [...clients].sort((a, b) => a.name.localeCompare(b.name)).filter(client => {
    const term = searchTerm.toLowerCase();
    const currentSelectedDisplay = value ? (() => {
        const c = clients.find(cl => cl.id === value);
        return c ? `${c.name} ${c.clientNumber ? `(#${c.clientNumber})` : ''}` : '';
    })() : '';

    if (term === currentSelectedDisplay.toLowerCase()) return true;

    const nameMatch = client.name.toLowerCase().includes(term);
    const numberMatch = client.clientNumber?.toLowerCase().includes(term);
    return nameMatch || numberMatch;
  });

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          className={`block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-2 rounded-xl border bg-white disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (value) onChange(''); // Limpiamos la selección si el usuario empieza a escribir
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${disabled ? 'text-slate-300' : 'text-slate-400'} ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredClients.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 text-center">No se encontraron clientes</div>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className={`flex flex-col px-4 py-2 cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${value === client.id ? 'bg-indigo-50/50' : ''}`}
                onClick={() => {
                  onChange(client.id);
                  setIsOpen(false);
                }}
              >
                <span className="font-medium text-slate-900 leading-tight">{client.name}</span>
                {client.clientNumber && (
                  <span className="text-xs text-slate-500">#{client.clientNumber}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
