import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { motion } from 'framer-motion';
import { GraduationCap, Printer, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

interface Student { id: number; fullName: string; matricNo: string; department: string; level: string; session: string }
interface Result { courseCode: string; courseTitle: string; unit: number; testScore: string; assignmentScore: string; attendanceScore: string; totalScore: string; status: string }

export default function StudentResults() {
  const [params] = useSearchParams();
  const matricNo = params.get('matric') || '';
  const surname = params.get('surname') || '';
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!matricNo || !surname) { setLoading(false); setError('Missing credentials'); return; }
    api.post('/students/verify', { matricNo, surname })
      .then(({ data }) => { setStudent(data.student); setResults(data.results); })
      .catch((err) => setError(err.response?.data?.error || 'No results found'))
      .finally(() => setLoading(false));
  }, [matricNo, surname]);

  function handlePrint() { window.print(); }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><Loader2 className="animate-spin mx-auto mb-3 text-primary-500" size={32} /><p className="text-gray-500">Fetching your results...</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm"><AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
        <h2 className="text-lg font-semibold mb-1">Result Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Link to="/" className="btn-primary gap-2"><ArrowLeft size={16} /> Try Again</Link>
      </div>
    </div>
  );

  const totalUnits = results.reduce((sum, r) => sum + r.unit, 0);
  const totalScore = results.reduce((sum, r) => sum + Number(r.totalScore || 0), 0);
  const gpa = results.length > 0 ? (totalScore / totalUnits).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-3xl mx-auto p-4 print:p-0">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"><ArrowLeft size={14} /> Back</Link>
          <button onClick={handlePrint} className="btn-secondary gap-2"><Printer size={14} /> Print</button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border p-8 print:shadow-none print:border-none">
          <div className="text-center border-b pb-6 mb-6">
            <GraduationCap className="mx-auto mb-2 text-primary-500" size={32} />
            <h1 className="text-lg font-bold">Moshood Abiola Polytechnic</h1>
            <p className="text-sm text-gray-500">Continuous Assessment Result Slip</p>
          </div>

          {student && (
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{student.fullName}</span></div>
              <div><span className="text-gray-500">Matric No:</span> <span className="font-medium">{student.matricNo}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{student.department}</span></div>
              <div><span className="text-gray-500">Level:</span> <span className="font-medium">{student.level}</span></div>
              <div><span className="text-gray-500">Session:</span> <span className="font-medium">{student.session}</span></div>
            </div>
          )}

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">Course Code</th>
                <th className="text-left py-2 font-semibold text-gray-700">Course Title</th>
                <th className="text-center py-2 font-semibold text-gray-700">Unit</th>
                <th className="text-center py-2 font-semibold text-gray-700">Test</th>
                <th className="text-center py-2 font-semibold text-gray-700">Assign</th>
                <th className="text-center py-2 font-semibold text-gray-700">Attend</th>
                <th className="text-center py-2 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2.5 font-mono text-xs font-semibold">{r.courseCode}</td>
                  <td className="py-2.5">{r.courseTitle}</td>
                  <td className="py-2.5 text-center">{r.unit}</td>
                  <td className="py-2.5 text-center">{r.testScore || '-'}</td>
                  <td className="py-2.5 text-center">{r.assignmentScore || '-'}</td>
                  <td className="py-2.5 text-center">{r.attendanceScore || '-'}</td>
                  <td className="py-2.5 text-center font-bold">{r.totalScore || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t pt-4 text-sm text-gray-600">
            <p><span className="font-medium">Total Units:</span> {totalUnits}</p>
            <p><span className="font-medium">Total Score:</span> {totalScore}</p>
          </div>

          <div className="mt-6 pt-4 border-t text-center text-xs text-gray-400 print:mt-4">
            This is a computer-generated slip. Results are subject to departmental confirmation.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
