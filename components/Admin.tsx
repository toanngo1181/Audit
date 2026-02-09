
import React from 'react';
import { Database, MapPin, UserCog, Link, RefreshCw, Trash2 } from 'lucide-react';
import { FARMS, ROLES, GAS_URL } from '../constants';

interface AdminProps {
  farm: string;
  role: string;
  auditorName: string;
  onUpdate: (field: string, value: string) => void;
  onClearCache: () => void;
}

const Admin: React.FC<AdminProps> = ({ farm, role, auditorName, onUpdate, onClearCache }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900">Administration</h2>
        <p className="text-slate-500 text-sm">System configuration and data management.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
          <UserCog className="text-indigo-600" size={20} />
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Auditor Profile</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Auditor Name</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
              value={auditorName}
              onChange={(e) => onUpdate('auditorName', e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Active Farm</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold appearance-none focus:ring-2 focus:ring-indigo-500"
                  value={farm}
                  onChange={(e) => onUpdate('farm', e.target.value)}
                >
                  <option value="" disabled>Select Farm</option>
                  {FARMS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Duty Role</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold appearance-none focus:ring-2 focus:ring-indigo-500"
                value={role}
                onChange={(e) => onUpdate('role', e.target.value)}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* API Connection */}
      <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 space-y-4">
        <div className="flex items-center gap-3">
          <Link className="text-indigo-600" size={18} />
          <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">API Endpoint</h3>
        </div>
        <div className="bg-white/50 p-3 rounded-xl border border-indigo-200 text-[10px] font-mono text-indigo-700 break-all leading-relaxed">
          {GAS_URL}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-red-600" size={18} />
          <h3 className="font-black text-red-900 uppercase text-xs tracking-widest">Danger Zone</h3>
        </div>
        <button
          onClick={onClearCache}
          className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-3xl border border-red-100 font-bold hover:bg-red-600 hover:text-white transition-all group"
        >
          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          CLEAR AUDIT DATA & RESET
        </button>
      </div>
    </div>
  );
};

export default Admin;
