
import React, { useState } from 'react';
import { ChecklistItem } from '../../types';
import { T } from '../../constants/i18n';
import { Trash2, Plus, Save, Download } from 'lucide-react';

interface ChecklistTableProps {
  items: ChecklistItem[];
  onSave: (items: ChecklistItem[]) => Promise<void>;
}

export const ChecklistTable: React.FC<ChecklistTableProps> = ({ items: initialItems, onSave }) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [saving, setSaving] = useState(false);

  const handleEdit = (id: string, field: keyof ChecklistItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    // CẬP NHẬT: Thêm các trường còn thiếu theo interface ChecklistItem
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      module: 'New Module',
      category: 'General',
      title: 'New Requirement',
      description: 'Describe what to check...',
      inputType: 'text',
      photoRule: 'none',
      risk: 'LOW',
      weight: 10
    };
    setItems(prev => [newItem, ...prev]);
  };

  const deleteItem = (id: string) => {
    if (confirm(T.admin.confirm_delete)) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex gap-2">
          <button 
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> {T.admin.add_item}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">
            <Download size={16} /> {T.admin.export}
          </button>
        </div>
        <button 
          onClick={() => { setSaving(true); onSave(items).finally(() => setSaving(false)); }}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {saving ? T.admin.updating : <><Save size={16} /> {T.admin.sync_sheet}</>}
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{T.admin.col_module}</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{T.admin.col_title}</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{T.admin.col_desc}</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{T.admin.col_risk}</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{T.admin.col_weight}</th>
              <th className="px-6 py-4 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <input 
                    className="bg-transparent font-bold text-sm text-indigo-600 w-32 border-none focus:ring-0" 
                    value={item.module} 
                    onChange={e => handleEdit(item.id, 'module', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3">
                  <input 
                    className="bg-transparent font-bold text-sm text-slate-900 w-48 border-none focus:ring-0" 
                    value={item.title} 
                    onChange={e => handleEdit(item.id, 'title', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea 
                    className="bg-transparent text-xs text-slate-500 w-64 border-none focus:ring-0 resize-none h-8 leading-relaxed" 
                    value={item.description} 
                    onChange={e => handleEdit(item.id, 'description', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <select 
                    className="bg-transparent text-[10px] font-black uppercase text-slate-600 border-none focus:ring-0"
                    value={item.risk}
                    onChange={e => handleEdit(item.id, 'risk', e.target.value)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input 
                    type="number"
                    className="bg-transparent font-black text-sm text-slate-700 w-16 text-center border-none focus:ring-0" 
                    value={item.weight} 
                    onChange={e => handleEdit(item.id, 'weight', parseInt(e.target.value))}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
