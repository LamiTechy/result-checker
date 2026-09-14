import { useEffect, useState } from 'react';
import api from '../api/client';
import { Users, BookOpen, ClipboardList, Activity } from 'lucide-react';

interface Stats { students: number; courses: number; results: number; published: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ students: 0, courses: 0, results: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students').then(r => r.data),
      api.get('/courses').then(r => r.data),
      api.get('/results').then(r => r.data),
    ]).then(([students, courses, results]) => {
      setStats({
        students: students.length,
        courses: courses.length,
        results: results.length,
        published: results.filter((r: any) => r.status === 'published').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Total Results', value: stats.results, icon: ClipboardList, color: 'bg-purple-500' },
    { label: 'Published', value: stats.published, icon: Activity, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="text-white" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
