export type Role = 'escritorio' | 'terreno';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  route: string;
  visitDay: string;
  channel: string;
  gec: string;
  uc12mm?: string;
}

export type MissionStatus = 'pending' | 'in-progress' | 'completed';

export interface Mission {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  assignedTo: string; // User ID (terreno)
  createdBy: string; // User ID (escritorio)
  status: MissionStatus;
  createdAt: string;
  completedAt?: string;
  evidenceUrl?: string;
  notes?: string;
}

export type AlertType = 'stock_out' | 'competitor_action' | 'new_opportunity' | 'other';
export type AlertStatus = 'new' | 'read' | 'actioned';

export interface Alert {
  id: string;
  type: AlertType;
  description: string;
  clientId: string;
  createdBy: string; // User ID (terreno)
  status: AlertStatus;
  createdAt: string;
}

export interface TacticalSale {
  id: string;
  clientId: string;
  createdBy: string; // User ID (terreno)
  product: string;
  quantity: number;
  createdAt: string;
}

export interface Activation {
  id: string;
  title: string;
  description: string;
  clientId: string;
  createdBy: string; // User ID (terreno)
  createdAt: string;
  evidenceUrl: string;
  feedback?: string;
}
