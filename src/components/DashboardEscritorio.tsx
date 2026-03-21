import React, { useRef } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, Badge, Button } from './ui';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClipboardList, BellRing, TrendingUp, CheckCircle2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Client } from '../types';

export const DashboardEscritorio = () => {
  const { missions, alerts, sales, addClients } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingMissions = missions.filter(m => m.status !== 'completed').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;
  const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Fila 2 (índice 1) y Columna C (índice 2)
        if (data.length > 1 && data[1][2] === 'RazonSocial') {
          const newClients: Client[] = [];
          for (let i = 2; i < data.length; i++) {
            const razonSocial = data[i][2];
            if (razonSocial && typeof razonSocial === 'string') {
              newClients.push({
                id: `c${Date.now()}-${i}`,
                name: razonSocial.trim(),
                address: 'Sin dirección',
                route: 'Sin ruta',
                visitDay: 'Lunes',
                channel: 'Sin canal',
                gec: 'Sin GEC'
              });
            }
          }
          if (newClients.length > 0) {
            addClients(newClients);
            alert(`Se cargaron ${newClients.length} clientes exitosamente.`);
          } else {
            alert('No se encontraron clientes en la columna RazonSocial.');
          }
        } else {
          alert('El formato del archivo no es correcto. Asegúrate de que "RazonSocial" esté en la columna C, fila 2.');
        }
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        alert('Hubo un error al procesar el archivo Excel.');
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visión Estratégica</h1>
          <p className="mt-2 text-slate-600">Monitorea la ejecución y capitaliza las oportunidades del terreno.</p>
        </div>
        <div>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Cargar Clientes (Excel)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Misiones Activas</p>
            <p className="text-2xl font-bold text-slate-900">{pendingMissions}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Misiones Completadas</p>
            <p className="text-2xl font-bold text-slate-900">{completedMissions}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Alertas Estratégicas</p>
            <p className="text-2xl font-bold text-slate-900">{newAlerts}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Venta Táctica (Terreno)</p>
            <p className="text-2xl font-bold text-slate-900">${totalSales.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Últimas Alertas del Terreno</h2>
            <Link to="/alerts">
              <Button variant="ghost" className="text-sm">Ver todas</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <Badge variant={alert.status === 'new' ? 'warning' : 'default'}>
                    {alert.type === 'competitor_action' ? 'Competencia' : alert.type === 'stock_out' ? 'Quiebre Stock' : 'Oportunidad'}
                  </Badge>
                  <span className="text-xs text-slate-500">{format(new Date(alert.createdAt), 'HH:mm - dd MMM', { locale: es })}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">{alert.description}</p>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay alertas recientes.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Ventas Tácticas Recientes</h2>
            <Link to="/sales">
              <Button variant="ghost" className="text-sm">Ver todas</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {sales.slice(0, 3).map(sale => (
              <div key={sale.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-slate-900">{sale.product}</span>
                  <span className="text-sm font-bold text-emerald-600">${sale.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Cant: {sale.quantity}</span>
                  <span>{format(new Date(sale.createdAt), 'HH:mm - dd MMM', { locale: es })}</span>
                </div>
              </div>
            ))}
            {sales.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay ventas recientes.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
