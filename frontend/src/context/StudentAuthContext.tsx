import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';

export interface Student {
  id: number;
  fullName: string;
  matricNo: string;
  department: string;
  level: string;
  session: string;
}

interface StudentAuthContextType {
  student: Student | null;
  studentToken: string | null;
  login: (matricNo: string, pin: string) => Promise<void>;
  register: (matricNo: string, surname: string, pin: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [studentToken, setStudentToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('studentToken');
    const savedStudent = localStorage.getItem('student');
    if (savedToken && savedStudent) {
      setStudentToken(savedToken);
      setStudent(JSON.parse(savedStudent));
    }
    setLoading(false);
  }, []);

  async function login(matricNo: string, pin: string) {
    const { data } = await api.post('/auth/student/login', { matricNo, pin });
    localStorage.setItem('studentToken', data.token);
    localStorage.setItem('student', JSON.stringify(data.student));
    setStudentToken(data.token);
    setStudent(data.student);
  }

  async function register(matricNo: string, surname: string, pin: string) {
    const { data } = await api.post('/auth/student/register', { matricNo, surname, pin });
    localStorage.setItem('studentToken', data.token);
    localStorage.setItem('student', JSON.stringify(data.student));
    setStudentToken(data.token);
    setStudent(data.student);
  }

  function logout() {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('student');
    setStudentToken(null);
    setStudent(null);
  }

  return (
    <StudentAuthContext.Provider value={{ student, studentToken, login, register, logout, loading }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}
