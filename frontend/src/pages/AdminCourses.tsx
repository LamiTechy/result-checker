import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Course { id: number; code: string; title: string; unit: number; session: string; semester: string; lecturerId: number | null }

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ code: '', title: '', unit: 3, session: '', semester: 'first', lecturerId: '' });

  async function loadCourses() {
    setLoading(true);
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadCourses(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ code: '', title: '', unit: 3, session: '2024/2025', semester: 'first', lecturerId: '' });
    setShowForm(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setForm({ code: c.code, title: c.title, unit: c.unit, session: c.session, semester: c.semester, lecturerId: c.lecturerId?.toString() || '' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await api.put(`/courses/${editing.id}`, { ...form, lecturerId: form.lecturerId ? Number(form.lecturerId) : null });
    } else {
      await api.post('/courses', { ...form, lecturerId: form.lecturerId ? Number(form.lecturerId) : null });
    }
    setShowForm(false);
    loadCourses();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    loadCourses();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16} /> Add Course</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Course' : 'Add Course'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Course Code</label><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
                <div><label className="label">Unit</label><input className="input" type="number" value={form.unit} onChange={(e) => setForm({ ...form, unit: Number(e.target.value) })} required /></div>
              </div>
              <div><label className="label">Course Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Session</label><input className="input" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} required /></div>
                <div><label className="label">Semester</label><select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                  <option value="first">First</option><option value="second">Second</option>
                </select></div>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Session</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Semester</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.code}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3">{c.unit}</td>
                  <td className="px-4 py-3">{c.session}</td>
                  <td className="px-4 py-3 capitalize">{c.semester}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 mr-3"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No courses found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
