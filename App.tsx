
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { storageService } from './services/storageService';
import { Icons, SCHOOL_NAME } from './constants';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeachersList from './pages/TeachersList';
import LeaveManagement from './pages/LeaveManagement';
import SchoolProfilePage from './pages/SchoolProfile';
import NewsManagement from './pages/NewsManagement';
import TeacherLeaves from './pages/TeacherLeaves';
import ClassManagement from './pages/ClassManagement';
import TeacherProfile from './pages/TeacherProfile';
import SchoolInfo from './pages/SchoolInfo';
import StudentManagement from './pages/StudentManagement';
import ResultManagement from './pages/ResultManagement';
import StatisticsModule from './pages/StatisticsModule';
import ReportCentral from './pages/ReportCentral';

interface AuthRouteProps {
  user: User | null;
  role?: UserRole;
  onLogout: () => void;
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ user, role, onLogout, children }) => {
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <Layout user={user} onLogout={onLogout}>{children}</Layout>;
};

const Layout: React.FC<{ user: User, onLogout: () => void, children: React.ReactNode }> = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const school = storageService.getSchoolProfile();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = user.role === UserRole.ADMIN ? [
    { name: 'Dashboard', path: '/', icon: <Icons.Dashboard /> },
    { name: 'Institution Stats', path: '/stats', icon: <Icons.Dashboard /> },
    { name: 'Teachers', path: '/admin/teachers', icon: <Icons.Users /> },
    { name: 'Students', path: '/admin/students', icon: <Icons.Users /> },
    { name: 'Results System', path: '/admin/results', icon: <Icons.Documents /> },
    { name: 'Report Central', path: '/reports', icon: <Icons.Documents /> },
    { name: 'Leave Requests', path: '/admin/leaves', icon: <Icons.Calendar /> },
    { name: 'School Profile', path: '/admin/school', icon: <Icons.Settings /> },
    { name: 'Notices', path: '/admin/news', icon: <Icons.Documents /> },
  ] : [
    { name: 'Dashboard', path: '/', icon: <Icons.Dashboard /> },
    { name: 'School Stats', path: '/stats', icon: <Icons.Dashboard /> },
    { name: 'Results Entry', path: '/admin/results', icon: <Icons.Documents /> },
    { name: 'Generate Reports', path: '/reports', icon: <Icons.Documents /> },
    { name: 'My Class', path: '/teacher/class', icon: <Icons.Users /> },
    { name: 'My Profile', path: '/teacher/profile', icon: <Icons.Users /> },
    { name: 'My Leaves', path: '/teacher/leaves', icon: <Icons.Calendar /> },
    { name: 'School Info', path: '/teacher/school-info', icon: <Icons.Settings /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-white transform transition-transform duration-200 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <span className="bg-white text-emerald-900 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg">N</span>
            Vidyalaya
          </h1>
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[3px] mt-2">Edu Portal v2.0</p>
        </div>
        <nav className="mt-8 px-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-emerald-900/50 transition-all text-emerald-100/70 hover:text-white font-bold text-sm">
              {item.icon} {item.name}
            </button>
          ))}
          <button onClick={() => { onLogout(); navigate('/login'); }} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-red-900/20 text-red-400 transition-all mt-10 font-bold text-sm">
            <Icons.Logout /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div className="hidden md:block">
              <h2 className="text-lg font-black text-emerald-900 uppercase tracking-tight">{SCHOOL_NAME}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                   Academic Session: {school.academicYear}
                </span>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                   Live: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900">{user.name}</p>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black border-2 border-emerald-500 shadow-sm">{user.name.charAt(0)}</div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.init();
    const savedUser = localStorage.getItem('logged_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('logged_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logged_user');
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-emerald-600 font-bold italic">Initializing Portal...</div>;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={currentUser ? (
            <Layout user={currentUser} onLogout={handleLogout}>
              {currentUser.role === UserRole.ADMIN ? <AdminDashboard /> : <TeacherDashboard user={currentUser} />}
            </Layout>
          ) : <Navigate to="/login" />} 
        />
        
        <Route path="/stats" element={<AuthRoute user={currentUser} onLogout={handleLogout}><StatisticsModule user={currentUser!} /></AuthRoute>} />
        <Route path="/reports" element={<AuthRoute user={currentUser} onLogout={handleLogout}><ReportCentral user={currentUser!} /></AuthRoute>} />
        <Route path="/admin/teachers" element={<AuthRoute user={currentUser} role={UserRole.ADMIN} onLogout={handleLogout}><TeachersList /></AuthRoute>} />
        <Route path="/admin/students" element={<AuthRoute user={currentUser} role={UserRole.ADMIN} onLogout={handleLogout}><StudentManagement /></AuthRoute>} />
        <Route path="/admin/results" element={<AuthRoute user={currentUser} onLogout={handleLogout}><ResultManagement user={currentUser!} /></AuthRoute>} />
        <Route path="/admin/leaves" element={<AuthRoute user={currentUser} role={UserRole.ADMIN} onLogout={handleLogout}><LeaveManagement /></AuthRoute>} />
        <Route path="/admin/school" element={<AuthRoute user={currentUser} role={UserRole.ADMIN} onLogout={handleLogout}><SchoolProfilePage /></AuthRoute>} />
        <Route path="/admin/news" element={<AuthRoute user={currentUser} role={UserRole.ADMIN} onLogout={handleLogout}><NewsManagement /></AuthRoute>} />

        <Route path="/teacher/profile" element={<AuthRoute user={currentUser} role={UserRole.TEACHER} onLogout={handleLogout}><TeacherProfile user={currentUser!} onUpdate={setCurrentUser} /></AuthRoute>} />
        <Route path="/teacher/leaves" element={<AuthRoute user={currentUser} role={UserRole.TEACHER} onLogout={handleLogout}><TeacherLeaves user={currentUser!} /></AuthRoute>} />
        <Route path="/teacher/class" element={<AuthRoute user={currentUser} role={UserRole.TEACHER} onLogout={handleLogout}><ClassManagement user={currentUser!} /></AuthRoute>} />
        <Route path="/teacher/school-info" element={<AuthRoute user={currentUser} role={UserRole.TEACHER} onLogout={handleLogout}><SchoolInfo /></AuthRoute>} />
      </Routes>
    </HashRouter>
  );
};

export default App;
