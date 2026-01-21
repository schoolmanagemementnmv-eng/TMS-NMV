
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

  if (loading) return <div className="flex items-center justify-center h-screen text-emerald-600 font-bold">Loading Vidyalaya Portal...</div>;

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/" 
          element={
            currentUser ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                {currentUser.role === UserRole.ADMIN ? <AdminDashboard /> : <TeacherDashboard user={currentUser} />}
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Admin Specific Routes */}
        <Route path="/admin/teachers" element={
          currentUser?.role === UserRole.ADMIN ? (
            <Layout user={currentUser} onLogout={handleLogout}><TeachersList /></Layout>
          ) : <Navigate to="/" />
        } />
        <Route path="/admin/leaves" element={
          currentUser?.role === UserRole.ADMIN ? (
            <Layout user={currentUser} onLogout={handleLogout}><LeaveManagement /></Layout>
          ) : <Navigate to="/" />
        } />
        <Route path="/admin/school" element={
          currentUser?.role === UserRole.ADMIN ? (
            <Layout user={currentUser} onLogout={handleLogout}><SchoolProfilePage /></Layout>
          ) : <Navigate to="/" />
        } />
        <Route path="/admin/news" element={
          currentUser?.role === UserRole.ADMIN ? (
            <Layout user={currentUser} onLogout={handleLogout}><NewsManagement /></Layout>
          ) : <Navigate to="/" />
        } />

        {/* Teacher Specific Routes */}
        <Route path="/teacher/profile" element={
          currentUser?.role === UserRole.TEACHER ? (
            <Layout user={currentUser} onLogout={handleLogout}><TeacherProfile user={currentUser} onUpdate={setCurrentUser} /></Layout>
          ) : <Navigate to="/" />
        } />
        <Route path="/teacher/leaves" element={
          currentUser?.role === UserRole.TEACHER ? (
            <Layout user={currentUser} onLogout={handleLogout}><TeacherLeaves user={currentUser}/></Layout>
          ) : <Navigate to="/" />
        } />
        <Route path="/teacher/class" element={
          currentUser?.role === UserRole.TEACHER ? (
            <Layout user={currentUser} onLogout={handleLogout}><ClassManagement user={currentUser}/></Layout>
          ) : <Navigate to="/" />
        } />

      </Routes>
    </HashRouter>
  );
};

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user.role === UserRole.ADMIN ? [
    { name: 'Dashboard', path: '/', icon: <Icons.Dashboard /> },
    { name: 'Teachers', path: '/admin/teachers', icon: <Icons.Users /> },
    { name: 'Leave Requests', path: '/admin/leaves', icon: <Icons.Calendar /> },
    { name: 'School Profile', path: '/admin/school', icon: <Icons.Settings /> },
    { name: 'Notices & Circulars', path: '/admin/news', icon: <Icons.Documents /> },
  ] : [
    { name: 'Dashboard', path: '/', icon: <Icons.Dashboard /> },
    { name: 'My Profile', path: '/teacher/profile', icon: <Icons.Users /> },
    { name: 'My Leaves', path: '/teacher/leaves', icon: <Icons.Calendar /> },
    { name: 'My Class', path: '/teacher/class', icon: <Icons.Users /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-white text-emerald-900 rounded p-1">NM</span>
            Vidyalaya
          </h1>
          <p className="text-emerald-300 text-xs mt-1">Teacher Management System</p>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition-colors text-emerald-100"
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}
          
          <button
            onClick={() => { onLogout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800 text-red-200 transition-colors mt-8"
          >
            <Icons.Logout />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden p-2 -ml-2 text-gray-600" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-gray-800 lg:block hidden">Welcome, {user.name}</h2>
            <h2 className="text-lg font-semibold text-gray-800 lg:hidden block truncate">{SCHOOL_NAME}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-500">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
