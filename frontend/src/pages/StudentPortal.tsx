import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, GraduationCap, ArrowRight } from 'lucide-react';

export default function StudentPortal() {
  const navigate = useNavigate();
  const [matricNo, setMatricNo] = useState('');
  const [surname, setSurname] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matricNo && surname) {
      navigate(`/results?matric=${encodeURIComponent(matricNo)}&surname=${encodeURIComponent(surname)}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 flex flex-col">
      <header className="py-6 px-4 text-center text-white">
        <GraduationCap className="mx-auto mb-2" size={36} />
        <h1 className="text-xl font-bold tracking-tight">MAPOLY CA Result Checker</h1>
        <p className="text-white/70 text-sm">Moshood Abiola Polytechnic</p>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Check Your Results</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your matriculation number and surname to view your CA results.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Matriculation Number</label>
                <input className="input" placeholder="e.g. IFE2020/001" value={matricNo} onChange={(e) => setMatricNo(e.target.value)} required />
              </div>
              <div>
                <label className="label">Surname</label>
                <input className="input" placeholder="e.g. Adeyemi" value={surname} onChange={(e) => setSurname(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full gap-2">
                <Search size={16} /> Search Results <ArrowRight size={16} />
              </button>
            </form>
          </div>
          <p className="text-center text-white/50 text-xs mt-4">Only published results are displayed.</p>
        </motion.div>
      </div>

      <footer className="py-4 text-center text-white/40 text-xs">Moshood Abiola Polytechnic &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
