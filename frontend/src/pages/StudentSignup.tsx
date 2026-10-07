import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, UserPlus, ArrowRight } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';

export default function StudentSignup() {
  const { register, studentToken, loading } = useStudentAuth();
  const navigate = useNavigate();
  const [matricNo, setMatricNo] = useState('');
  const [surname, setSurname] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
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
    if (!/^\d{2}\/145\/(?!0000)\d{4}$/.test(matricNo.trim())) {
      setError('Matric number must be in format YY/145/0001 (e.g. 24/145/0001)');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be 4 to 6 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register(matricNo.trim(), surname.trim(), pin);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Create Student Account</h2>
            <p className="text-sm text-gray-500 mb-6">Register with your matriculation number, surname and a PIN. Your details must already exist in the school records.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="label">Matriculation Number</label>
                <input className="input" placeholder="e.g. 24/145/0001" value={matricNo} onChange={(e) => setMatricNo(e.target.value)} required />
              </div>
              <div>
                <label className="label">Surname</label>
                <input className="input" placeholder="e.g. Adeyemi" value={surname} onChange={(e) => setSurname(e.target.value)} required />
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
              <div>
                <label className="label">Confirm PIN</label>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Re-enter PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
                <UserPlus size={16} /> {submitting ? 'Creating account...' : 'Sign Up'} <ArrowRight size={16} />
              </button>
            </form>
            <p className="text-sm text-gray-500 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>

      <footer className="py-4 text-center text-white/40 text-xs">CA Result Checker &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
