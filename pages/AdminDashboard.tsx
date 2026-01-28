
import React, { useMemo, useState } from 'react';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LeaveStatus } from '../types';

const AdminDashboard: React.FC = () => {
  const teachers = storageService.getUsers().filter(u => u.role === 'TEACHER');
  const leaves = storageService.getLeaves();
  const news = storageService.getNews();
  const stats = storageService.getSchoolStats();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalStudents = useMemo(() => {
    return stats.gradeData.reduce((acc, g) => acc + g.boys + g.girls, 0);
  }, [stats]);

  const pendingLeaves = leaves.filter(l => l.status === LeaveStatus.PENDING);
  
  const dashboardStats = [
    { label: 'Total Teachers', value: stats.teacherCount, color: 'bg-blue-500', icon: '👨‍🏫' },
    { label: 'Total Students', value: totalStudents, color: 'bg-emerald-500', icon: '🎓' },
    { label: 'Pending Leaves', value: pendingLeaves.length, color: 'bg-orange-500', icon: '📝' },
    { label: 'Active Notices', value: news.length, color: 'bg-purple-500', icon: '🔔' },
  ];

  const chartData = useMemo(() => {
    const types: Record<string, number> = {};
    leaves.forEach(l => {
      types[l.type] = (types[l.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [leaves]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleManualReload = () => {
    if (confirm("Are you sure you want to reload the application? Unsaved temporary states may be lost.")) {
      window.location.reload();
    }
  };

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Admin Overview</h1>
          <p className="text-gray-500 font-medium italic">Operational status of A/Nikawewa Muslim Vidyalaya</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Census Last Updated</p>
           <p className="text-xs font-bold text-gray-400">{new Date(stats.lastUpdated).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between ring-1 ring-gray-50">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-2xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollment Snapshot Widget */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 ring-1 ring-gray-50 flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Enrollment Snapshot</h3>
              <a href="#/stats" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View Analytics</a>
           </div>
           <div className="flex-1 space-y-4">
              {stats.gradeData.slice(0, 6).map(g => (
                <div key={g.grade} className="flex items-center gap-4">
                   <span className="w-16 text-[10px] font-black text-gray-400 uppercase">Gr {g.grade}</span>
                   <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(g.boys / (g.boys + g.girls || 1)) * 100}%` }} className="h-full bg-blue-500"></div>
                      <div style={{ width: `${(g.girls / (g.boys + g.girls || 1)) * 100}%` }} className="h-full bg-pink-500"></div>
                   </div>
                   <span className="w-10 text-[10px] font-black text-gray-900">{g.boys + g.girls}</span>
                </div>
              ))}
              <div className="pt-4 border-t text-center">
                 <p className="text-[10px] font-bold text-gray-400 italic">Previewing first 6 grades. Click for full report.</p>
              </div>
           </div>
        </div>

        {/* System Operations Card */}
        <div className="bg-emerald-950 p-8 rounded-[40px] shadow-2xl shadow-emerald-900/20 text-white flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tight mb-2">System Operations</h3>
              <p className="text-emerald-100/60 text-xs font-medium italic mb-8">Override browser UI restrictions directly from the portal.</p>
           </div>
           
           <div className="space-y-4">
              <button 
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-between px-6 py-4 bg-emerald-900/50 hover:bg-emerald-900 rounded-2xl border border-emerald-800 transition-all group"
              >
                <span className="text-xs font-black uppercase tracking-widest">Toggle Fullscreen</span>
                <span className="text-xl group-hover:scale-125 transition-transform">{isFullscreen ? '🗗' : '🗖'}</span>
              </button>
              
              <button 
                onClick={handleManualReload}
                className="w-full flex items-center justify-between px-6 py-4 bg-emerald-900/50 hover:bg-emerald-900 rounded-2xl border border-emerald-800 transition-all group"
              >
                <span className="text-xs font-black uppercase tracking-widest">Force App Reload</span>
                <span className="text-xl group-hover:rotate-180 transition-transform duration-500">🔄</span>
              </button>

              <div className="mt-4 p-4 bg-emerald-900/30 rounded-2xl border border-emerald-800/30">
                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-relaxed">
                    Developer Note: If platform controls are disabled, use these internal triggers to manage your view.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Leave Trends */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 ring-1 ring-gray-50">
        <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tight">Leave Distribution Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                 {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
