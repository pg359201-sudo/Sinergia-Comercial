/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppStore } from './store/AppContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { DashboardEscritorio } from './components/DashboardEscritorio';
import { DashboardTerreno } from './components/DashboardTerreno';
import { MissionsList } from './components/MissionsList';
import { MissionDetail } from './components/MissionDetail';
import { NewMissionForm } from './components/NewMissionForm';
import { AlertsList } from './components/AlertsList';
import { NewAlertForm } from './components/NewAlertForm';
import { SalesList } from './components/SalesList';
import { NewSaleForm } from './components/NewSaleForm';
import { ActivationsList } from './components/ActivationsList';
import { NewActivationForm } from './components/NewActivationForm';
import { ClientsList } from './components/ClientsList';
import { ClientDetail } from './components/ClientDetail';
import { RecordsList } from './components/RecordsList';
import { RecordDetail } from './components/RecordDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { currentUser } = useAppStore();
  if (currentUser?.role === 'escritorio') return <DashboardEscritorio />;
  if (currentUser?.role === 'terreno') return <DashboardTerreno />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardRouter />} />
            
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:id" element={<ClientDetail />} />

            <Route path="records" element={<RecordsList />} />
            <Route path="records/:type/:id" element={<RecordDetail />} />

            <Route path="missions" element={<MissionsList />} />
            <Route path="missions/new" element={<NewMissionForm />} />
            <Route path="missions/:id" element={<MissionDetail />} />
            
            <Route path="alerts" element={<AlertsList />} />
            <Route path="alerts/new" element={<NewAlertForm />} />
            
            <Route path="sales" element={<SalesList />} />
            <Route path="sales/new" element={<NewSaleForm />} />

            <Route path="activations" element={<ActivationsList />} />
            <Route path="activations/new" element={<NewActivationForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
