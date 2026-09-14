import { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Pencil, Send } from 'lucide-react';

interface Student { id: number; fullName: string; matricNo: string }
interface Course { id: number; code: string; title: string }
interface Result { id: number; studentId: number; courseId: number; testScore: string; assignmentScore: string; attendanceScore: string; totalScore: string; status: string }

export default function AdminResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Result | null>(null);
  const [form, setForm] = useState({ studentId: '', courseId: '', testScore: '', assignmentScore: '', attendanceScore: '' });

  async function loadData() {
    setLoading(true);
    try {
      const [res, stud, cour] = await Promise.all([
        api.get('/results'),
        api.get('/students'),
        api.get('/courses'),
      ]);
      setResults(res.data);
      setStudents(stud.data);
      setCourses(cour.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ studentId: '', courseId: selectedCourse, testScore: '', assignmentScore: '', attendanceScore: '' });
    setShowForm(true);
  }

  function openEdit(r: Result) {
    setEditing(r);
    setForm({ studentId: r.studentId.toString(), courseId: r.courseId.toString(), testScore: r.testScore, assignmentScore: r.assignmentScore, attendanceScore: r.attendanceScore });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, studentId: Number(form.studentId), courseId: Number(form.courseId) };
    if (editing) {
      await api.put(`/results/${editing.id}`, payload);
    } else {
      await api.post('/results', payload);
    }
    setShowForm(false);
    loadData();
  }

  async function handlePublish(courseId: number) {
    if (!confirm('Publish all draft results for this course?')) return;
    await api.post(`/results/publish/course/${courseId}`);
    loadData();
  }

  const getStudentName = (id: number) => students.find(s => s.id === id)?.fullName || 'Unknown';
  const getCourseCode = (id: number) => courses.find(c => c.id === id)?.code || 'Unknown';

  const filteredResults = selectedCourse ? results.filter(r => r.courseId === Number(selectedCourse)) : results;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Results</h1>
        <div className="flex gap-2">
          <select className="input w-auto" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16} /> Add Result</button>
        </div>
      </div>

      {selectedCourse && (
        <button onClick={() => handlePublish(Number(selectedCourse))} className="btn-secondary gap-2 mb-4"><Send size={14} /> Publish All Drafts for Selected Course</button>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Result' : 'Add Result'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="label">Student</label>
                <select className="input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.matricNo} - {s.fullName}</option>)}
                </select>
              </div>
              <div><label className="label">Course</label>
                <select className="input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="label">Test</label><input className="input" type="number" step="0.01" value={form.testScore} onChange={(e) => setForm({ ...form, testScore: e.target.value })} /></div>
                <div><label className="label">Assignment</label><input className="input" type="number" step="0.01" value={form.assignmentScore} onChange={(e) => setForm({ ...form, assignmentScore: e.target.value })} /></div>
                <div><label className="label">Attendance</label><input className="input" type="number" step="0.01" value={form.attendanceScore} onChange={(e) => setForm({ ...form, attendanceScore: e.target.value })} /></div>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Test</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Assignment</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Attendance</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">{getStudentName(r.studentId)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{getCourseCode(r.courseId)}</td>
                  <td className="px-4 py-3 text-right">{r.testScore || '-'}</td>
                  <td className="px-4 py-3 text-right">{r.assignmentScore || '-'}</td>
                  <td className="px-4 py-3 text-right">{r.attendanceScore || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{r.totalScore || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">No results found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
