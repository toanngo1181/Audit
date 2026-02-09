import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { Loader2, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

// Định nghĩa Props
interface AdminPageProps {
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [farms, setFarms] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFarm, setNewFarm] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await auditApi.getSettings();
    if (data.farms) setFarms(data.farms);
    if (data.roles) setRoles(data.roles);
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    await auditApi.saveSettings(farms, roles);
    alert("Đã lưu cấu hình!");
    setLoading(false);
  };

  // Logic thêm/xóa
  const addFarm = () => { if(newFarm) { setFarms([...farms, newFarm]); setNewFarm(""); }};
  const removeFarm = (idx: number) => setFarms(farms.filter((_, i) => i !== idx));
  const addRole = () => { if(newRole) { setRoles([...roles, newRole]); setNewRole(""); }};
  const removeRole = (idx: number) => setRoles(roles.filter((_, i) => i !== idx));

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow-sm">
           <ArrowLeft className="text-slate-600" />
        </button>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Cấu hình hệ thống</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
          <h2 className="text-xl font-bold mb-4">Danh sách Trại</h2>
          <div className="flex gap-2 mb-4">
            <input value={newFarm} onChange={e => setNewFarm(e.target.value)} placeholder="Tên trại..." className="flex-1 p-4 border rounded-xl outline-none" />
            <button onClick={addFarm} className="bg-indigo-600 text-white p-4 rounded-xl"><Plus /></button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {farms.map((farm, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold">{farm}</span>
                <button onClick={() => removeFarm(idx)} className="text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
          <h2 className="text-xl font-bold mb-4">Danh sách Vai trò</h2>
          <div className="flex gap-2 mb-4">
            <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Vai trò..." className="flex-1 p-4 border rounded-xl outline-none" />
            <button onClick={addRole} className="bg-emerald-600 text-white p-4 rounded-xl"><Plus /></button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {roles.map((role, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold">{role}</span>
                <button onClick={() => removeRole(idx)} className="text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t flex justify-center z-50">
        <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-black text-lg shadow-xl flex items-center gap-3">
          {loading ? <Loader2 className="animate-spin" /> : <Save />} Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default AdminPage;