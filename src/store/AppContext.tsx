import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Client, Mission, Alert, TacticalSale, Activation } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  missions: Mission[];
  alerts: Alert[];
  sales: TacticalSale[];
  activations: Activation[];
  login: (userId: string) => void;
  logout: () => void;
  addMission: (mission: Omit<Mission, 'id' | 'createdAt' | 'status'>) => void;
  updateMissionStatus: (id: string, status: Mission['status'], evidenceUrl?: string, notes?: string, clientId?: string) => void;
  updateMissionDetails: (id: string, title: string, description: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'status'>) => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  addSale: (sale: Omit<TacticalSale, 'id' | 'createdAt'>) => void;
  addActivation: (activation: Omit<Activation, 'id' | 'createdAt'>) => void;
  updateActivationFeedback: (id: string, feedback: string) => void;
  addClients: (newClients: Client[]) => void;
  deleteMissions: (ids: string[]) => void;
  deleteAlerts: (ids: string[]) => void;
  deleteSales: (ids: string[]) => void;
  deleteActivations: (ids: string[]) => void;
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Headquarter', role: 'escritorio' },
  { id: 'u2', name: 'Agente', role: 'terreno' },
];

const mockClients: Client[] = [];

const mockMissions: Mission[] = [
  {
    id: 'm1',
    title: 'Ganar cabecera central',
    description: 'Cerramos el ingreso de la línea de ginebras (Tanqueray, Gordon\'s); necesitamos ganar la cabecera central y armar la exhibición.',
    clientId: 'c1',
    assignedTo: 'u2',
    createdBy: 'u1',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'competitor_action',
    description: 'Oportunidad urgente: competencia sin stock en góndola principal, llamalo ahora para ofrecer volumen y tomar el espacio.',
    clientId: 'c2',
    createdBy: 'u2',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

const mockSales: TacticalSale[] = [
  {
    id: 's1',
    clientId: 'c1',
    createdBy: 'u2',
    product: 'Whisky White Horse 750ml',
    quantity: 12,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  }
];

const mockActivations: Activation[] = [
  {
    id: 'act1',
    title: 'Exhibición Powerade',
    description: 'Armado de isla central con material POP de la nueva campaña.',
    clientId: 'c1',
    createdBy: 'u2',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    evidenceUrl: 'https://picsum.photos/seed/powerade/800/600',
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(mockUsers);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [sales, setSales] = useState<TacticalSale[]>(mockSales);
  const [activations, setActivations] = useState<Activation[]>(() => {
    const saved = localStorage.getItem('app_activations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockActivations;
      }
    }
    return mockActivations;
  });
  const [dbConfigured, setDbConfigured] = useState(true);

  // Save activations to localStorage whenever they change
  useEffect(() => {
    if (!dbConfigured) {
      localStorage.setItem('app_activations', JSON.stringify(activations));
    }
  }, [activations, dbConfigured]);

  // Inicializar DB y cargar datos
  useEffect(() => {
    const initDb = async () => {
      try {
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        
        if (healthData.postgresConfigured) {
          // Crear tablas si no existen
          await fetch('/api/init-db', { method: 'POST' });
          
          // Cargar clientes
          const clientsRes = await fetch('/api/clients');
          const clientsData = await clientsRes.json();
          if (Array.isArray(clientsData) && clientsData.length > 0) {
            const mappedClients = clientsData.map((c: any) => ({
              id: c.id, name: c.name, address: c.address, route: c.route,
              visitDay: c.visit_day, channel: c.channel, gec: c.gec, uc12mm: c.uc12mm
            }));
            setClients(mappedClients);
          }

          // Cargar misiones
          const missionsRes = await fetch('/api/missions');
          const missionsData = await missionsRes.json();
          if (Array.isArray(missionsData)) {
            setMissions(missionsData);
          }

          // Cargar alertas
          const alertsRes = await fetch('/api/alerts');
          const alertsData = await alertsRes.json();
          if (Array.isArray(alertsData)) {
            setAlerts(alertsData);
          }

          // Cargar ventas
          const salesRes = await fetch('/api/sales');
          const salesData = await salesRes.json();
          if (Array.isArray(salesData)) {
            setSales(salesData);
          }

          // Cargar activaciones
          const activationsRes = await fetch('/api/activations');
          const activationsData = await activationsRes.json();
          if (Array.isArray(activationsData)) {
            setActivations(activationsData);
          }
        } else {
          setDbConfigured(false);
        }
      } catch (error) {
        console.error("Error conectando con el servidor:", error);
      }
    };
    initDb();
  }, []);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const addMission = async (mission: Omit<Mission, 'id' | 'createdAt' | 'status'>) => {
    const newMission: Mission = {
      ...mission,
      id: `m${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setMissions(prev => [newMission, ...prev]);
    try {
      await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission)
      });
    } catch (error) { console.error("Error saving mission:", error); }
  };

  const updateMissionStatus = async (id: string, status: Mission['status'], evidenceUrl?: string, notes?: string, clientId?: string) => {
    const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
    
    let updatedMission: Mission | null = null;
    
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        updatedMission = {
          ...m,
          status,
          completedAt: completedAt || m.completedAt,
          evidenceUrl: evidenceUrl || m.evidenceUrl,
          notes: notes || m.notes,
          ...(clientId ? { clientId } : {})
        };
        return updatedMission;
      }
      return m;
    }));

    if (updatedMission) {
      try {
        await fetch(`/api/missions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: (updatedMission as Mission).status, 
            evidenceUrl: (updatedMission as Mission).evidenceUrl, 
            notes: (updatedMission as Mission).notes, 
            completedAt: (updatedMission as Mission).completedAt,
            clientId: (updatedMission as Mission).clientId
          })
        });
      } catch (error) { console.error("Error updating mission:", error); }
    }
  };

  const updateMissionDetails = async (id: string, title: string, description: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, title, description } : m));
    try {
      await fetch(`/api/missions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
    } catch (error) { console.error("Error updating mission details:", error); }
  };

  const addAlert = async (alert: Omit<Alert, 'id' | 'createdAt' | 'status'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `a${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev]);
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
    } catch (error) { console.error("Error saving alert:", error); }
  };

  const updateAlertStatus = async (id: string, status: Alert['status']) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) { console.error("Error updating alert:", error); }
  };

  const addSale = async (sale: Omit<TacticalSale, 'id' | 'createdAt'>) => {
    const newSale: TacticalSale = {
      ...sale,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);
    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale)
      });
    } catch (error) { console.error("Error saving sale:", error); }
  };

  const addActivation = async (activation: Omit<Activation, 'id' | 'createdAt'>) => {
    const newActivation: Activation = {
      ...activation,
      id: `act${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivations(prev => [newActivation, ...prev]);
    try {
      await fetch('/api/activations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivation)
      });
    } catch (error) { console.error("Error saving activation:", error); }
  };

  const updateActivationFeedback = async (id: string, feedback: string) => {
    setActivations(prev => prev.map(a => a.id === id ? { ...a, feedback } : a));
    try {
      await fetch(`/api/activations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
    } catch (error) { console.error("Error updating activation feedback:", error); }
  };

  const addClients = async (newClients: Client[]) => {
    // Optimistic UI update: merge by name
    setClients(prev => {
      const merged = [...prev];
      newClients.forEach(nc => {
        const existingIndex = merged.findIndex(c => c.name === nc.name);
        if (existingIndex >= 0) {
          merged[existingIndex] = { ...merged[existingIndex], ...nc, id: merged[existingIndex].id };
        } else {
          merged.push(nc);
        }
      });
      return merged;
    });

    // Guardar en Postgres
    try {
      const res = await fetch('/api/clients/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: newClients })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error guardando clientes en DB:", errorData);
        alert(`Error al guardar en Postgres: ${errorData.error}`);
      } else {
        // Refetch to ensure we have the correct IDs from the DB
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        if (Array.isArray(clientsData) && clientsData.length > 0) {
          const mappedClients = clientsData.map((c: any) => ({
            id: c.id, name: c.name, address: c.address, route: c.route,
            visitDay: c.visit_day, channel: c.channel, gec: c.gec, uc12mm: c.uc12mm
          }));
          setClients(mappedClients);
        }
      }
    } catch (error) {
      console.error("Error de red al guardar clientes:", error);
    }
  };

  const deleteMissions = async (ids: string[]) => {
    setMissions(prev => prev.filter(m => !ids.includes(m.id)));
    try {
      await fetch('/api/missions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (error) { console.error("Error deleting missions:", error); }
  };

  const deleteAlerts = async (ids: string[]) => {
    setAlerts(prev => prev.filter(a => !ids.includes(a.id)));
    try {
      await fetch('/api/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (error) { console.error("Error deleting alerts:", error); }
  };

  const deleteSales = async (ids: string[]) => {
    setSales(prev => prev.filter(s => !ids.includes(s.id)));
    try {
      await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (error) { console.error("Error deleting sales:", error); }
  };

  const deleteActivations = async (ids: string[]) => {
    setActivations(prev => prev.filter(a => !ids.includes(a.id)));
    try {
      await fetch('/api/activations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (error) { console.error("Error deleting activations:", error); }
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, clients, missions, alerts, sales, activations,
      login, logout, addMission, updateMissionStatus, updateMissionDetails, addAlert, updateAlertStatus, addSale, addActivation, updateActivationFeedback, addClients,
      deleteMissions, deleteAlerts, deleteSales, deleteActivations
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within an AppProvider');
  return context;
};
