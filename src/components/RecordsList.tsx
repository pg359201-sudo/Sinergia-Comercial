import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Button, Badge, Input } from './ui';
import { Download, Eye, Image as ImageIcon, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const RecordsList = () => {
  const { missions, alerts, sales, activations, clients, deleteMissions, deleteAlerts, deleteSales, deleteActivations } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  // Combine all records into a single array
  const allRecords = [
    ...missions.map(m => ({
      id: m.id,
      date: m.createdAt,
      clientId: m.clientId,
      type: 'Misión',
      typePath: 'missions',
      description: m.title,
      hasPhoto: false
    })),
    ...alerts.map(a => ({
      id: a.id,
      date: a.createdAt,
      clientId: a.clientId,
      type: 'Alerta',
      typePath: 'alerts',
      description: a.type === 'competitor_action' ? 'Competencia' : a.type === 'stock_out' ? 'Quiebre Stock' : 'Oportunidad',
      hasPhoto: false
    })),
    ...sales.map(s => ({
      id: s.id,
      date: s.createdAt,
      clientId: s.clientId,
      type: 'Venta Táctica',
      typePath: 'sales',
      description: `${s.product} (${s.quantity} uds)`,
      hasPhoto: false
    })),
    ...activations.map(a => ({
      id: a.id,
      date: a.createdAt,
      clientId: a.clientId,
      type: 'Activación',
      typePath: 'activations',
      description: a.title,
      hasPhoto: !!a.evidenceUrl
    }))
  ].map(record => {
    const client = clients.find(c => c.id === record.clientId);
    return {
      ...record,
      clientName: client ? client.name : 'Cliente Desconocido',
      formattedDate: format(new Date(record.date), 'dd/MM/yy HH:mm'),
      uniqueId: `${record.typePath}-${record.id}`
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredRecords = allRecords.filter(record => {
    const term = searchTerm.toLowerCase();
    return (
      record.formattedDate.toLowerCase().includes(term) ||
      record.clientName.toLowerCase().includes(term) ||
      record.type.toLowerCase().includes(term) ||
      record.description.toLowerCase().includes(term)
    );
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredRecords.map(r => r.uniqueId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (uniqueId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(uniqueId)) {
      newSelected.delete(uniqueId);
    } else {
      newSelected.add(uniqueId);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    const missionIds: string[] = [];
    const alertIds: string[] = [];
    const saleIds: string[] = [];
    const activationIds: string[] = [];

    Array.from(selectedIds).forEach((uniqueId: string) => {
      const [typePath, id] = uniqueId.split('-');
      if (typePath === 'missions') missionIds.push(id);
      if (typePath === 'alerts') alertIds.push(id);
      if (typePath === 'sales') saleIds.push(id);
      if (typePath === 'activations') activationIds.push(id);
    });

    if (missionIds.length > 0) deleteMissions(missionIds);
    if (alertIds.length > 0) deleteAlerts(alertIds);
    if (saleIds.length > 0) deleteSales(saleIds);
    if (activationIds.length > 0) deleteActivations(activationIds);

    setSelectedIds(new Set());
    setShowConfirm(false);
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Cliente', 'Tipo de Actividad', 'Descripción', 'Tiene Foto'];
    const rows = filteredRecords.map(record => [
      record.formattedDate,
      `"${record.clientName}"`,
      record.type,
      `"${record.description}"`,
      record.hasPhoto ? 'Sí' : 'No'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_actividad_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8 relative">
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar eliminación</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar los {selectedIds.size} registros seleccionados? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteSelected}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Registros Generales</h1>
          <p className="mt-1 text-sm text-slate-600">Vista consolidada de todas las actividades en terreno.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <Button 
              onClick={() => setShowConfirm(true)} 
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedIds.size})
            </Button>
          )}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar registros..."
              className="pl-9 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white whitespace-nowrap">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    checked={filteredRecords.length > 0 && selectedIds.size === filteredRecords.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Tipo de Actividad</th>
                <th className="p-4 font-semibold">Detalle</th>
                <th className="p-4 font-semibold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.uniqueId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        checked={selectedIds.has(record.uniqueId)}
                        onChange={() => handleSelectOne(record.uniqueId)}
                      />
                    </td>
                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {record.formattedDate}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-900">
                      {record.clientName}
                    </td>
                    <td className="p-4 text-sm">
                      <Badge variant={
                        record.typePath === 'missions' ? 'default' :
                        record.typePath === 'alerts' ? 'warning' :
                        record.typePath === 'sales' ? 'success' : 'info'
                      }>
                        {record.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                      {record.description}
                    </td>
                    <td className="p-4 text-center">
                      <Link to={`/records/${record.typePath}/${record.id}`}>
                        <Button variant="ghost" className="h-8 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          {record.hasPhoto ? (
                            <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> Ver Foto</span>
                          ) : (
                            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> Ver Detalle</span>
                          )}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
