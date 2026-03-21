import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Button, Card, Input, Label } from './ui';
import { Briefcase } from 'lucide-react';

export const Login = () => {
  const { users, login } = useAppStore();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(users[0].id);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <Briefcase className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sinergia Comercial
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ejecución, Venta y Retroalimentación
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="user" className="block text-sm font-medium text-slate-700">
                Selecciona tu perfil
              </Label>
              <div className="mt-1">
                <select
                  id="user"
                  name="user"
                  className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role === 'escritorio' ? 'Estratégico' : 'Táctico'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full flex justify-center py-2 px-4">
                Ingresar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
