import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Button, Card, Input, Label } from './ui';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
              <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="#2D3130" strokeWidth="12" strokeLinecap="square"/>
              <path d="M 100 180 A 80 80 0 0 1 20 100" fill="none" stroke="#2D3130" strokeWidth="12" strokeLinecap="square"/>

              <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#5F6D4F" strokeWidth="12" strokeLinecap="square"/>
              <path d="M 180 100 A 80 80 0 0 1 100 180" fill="none" stroke="#5F6D4F" strokeWidth="12" strokeLinecap="square"/>

              <line x1="5" y1="100" x2="60" y2="100" stroke="#2D3130" strokeWidth="8"/>
              <line x1="140" y1="100" x2="195" y2="100" stroke="#2D3130" strokeWidth="8"/>
              <line x1="100" y1="5" x2="100" y2="60" stroke="#2D3130" strokeWidth="8"/>
              <line x1="100" y1="140" x2="100" y2="195" stroke="#2D3130" strokeWidth="8"/>

              <polygon points="100,72 108,89 127,89 112,100 117,118 100,107 83,118 88,100 73,89 92,89" fill="#5F6D4F"/>
            </svg>
          </div>
          <h2 className="text-2xl font-orbitron font-black tracking-tighter text-slate-900 uppercase text-center">
            Sync<span className="text-slate-400 font-medium mx-[1px]">·</span><span className="text-[#5F6D4F]">Ops</span>
          </h2>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400 text-center">
            Ejecución, Inteligencia y Operaciones
          </p>
        </div>

        <form className="space-y-3 max-w-[260px] mx-auto" onSubmit={handleLogin}>
          <select
            id="user"
            name="user"
            className="block w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-sm tracking-widest text-slate-900 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 appearance-none"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <button type="submit" className="w-full h-12 flex items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
            Ingresar
          </button>
          
          <div className="pt-6 text-center">
            <p className="text-[9px] font-medium tracking-widest text-slate-400/80 uppercase">
              Built by Pascatech
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
