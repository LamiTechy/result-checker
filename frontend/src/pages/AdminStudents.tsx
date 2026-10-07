import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Student { id: number; fullName: string; matricNo: string; department: string; level: string; session: string }

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ fullName: '', matricNo: '', department: '', level: '', session: '' });

  async function loadStudents() {
    setLoading(true);
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadStudents(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ fullName: '', matricNo: '', department: '', level: '', session: '' });
    setShowForm(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setForm({ fullName: s.fullName, matricNo: s.matricNo, department: s.department, level: s.level, session: s.session });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await api.put(`/students/${editing.id}`, form);
    } else {
      await api.post('/students', form);
    }
    setShowForm(false);
    loadStudents();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this student?')) return;
    await api.delete(`/students/${id}`);
    loadStudents();
  }

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.matricNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16} /> Add Student</button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input className="input pl-10" placeholder="Search by name or matric number..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="label">Full Name</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
              <div><label className="label">Matric No</label><input className="input" placeholder="e.g. 24/145/0001" value={form.matricNo} onChange={(e) => setForm({ ...form, matricNo: e.target.value })} required /></div>
              <div><label className="label">Department</label><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Level</label><input className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required /></div>
                <div><label className="label">Session</label><input className="input" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} required /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" /></div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Matric No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Full Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Level</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Session</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.matricNo}</td>
                  <td className="px-4 py-3">{s.fullName}</td>
                  <td className="px-4 py-3">{s.department}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3">{s.session}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 mr-3"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
