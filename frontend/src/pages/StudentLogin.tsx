import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, LogIn, ArrowRight } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';

export default function StudentLogin() {
  const { login, studentToken, loading } = useStudentAuth();
  const navigate = useNavigate();
  const [matricNo, setMatricNo] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }
  if (studentToken) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(matricNo.trim(), pin);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 flex flex-col">
      <header className="py-6 px-4 text-center text-white">
        <GraduationCap className="mx-auto mb-2" size={36} />
        <h1 className="text-xl font-bold tracking-tight">CA Result Checker</h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Student Sign In</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in with your matriculation number and PIN to check your CA results.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="label">Matriculation Number</label>
                <input className="input" placeholder="e.g. 24/145/0001" value={matricNo} onChange={(e) => setMatricNo(e.target.value)} required />
              </div>
              <div>
                <label className="label">PIN</label>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="4-6 digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
                <LogIn size={16} /> {submitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>
            <p className="text-sm text-gray-500 text-center mt-6">
              No account yet?{' '}
              <Link to="/signup" className="text-primary-600 font-medium hover:text-primary-700">Create one</Link>
            </p>
          </div>
          <p className="text-center text-white/50 text-xs mt-4">Only published results are displayed.</p>
        </motion.div>
      </div>

      <footer className="py-4 text-center text-white/40 text-xs">CA Result Checker &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
