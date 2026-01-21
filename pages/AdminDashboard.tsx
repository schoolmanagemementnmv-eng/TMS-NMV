
import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LeaveStatus } from '../types';

const AdminDashboard: React.FC = () => {
  const teachers = storageService.getUsers().filter(u => u.role === 'TEACHER');
  const leaves = storageService.getLeaves();
  const news = storageService.getNews();

  const pendingLeaves = leaves.filter(l => l.status === LeaveStatus.PENDING);
  
  const stats = [
    { label: 'Total Teachers', value: teachers.length, color: 'bg-blue-500', icon: '👨‍🏫' },
    { label: 'Pending Leaves', value: pendingLeaves.length, color: 'bg-orange-500', icon: '📝' },
    { label: 'Total Leaves (MTD)', value: leaves.length, color: 'bg-emerald-500', icon: '📅' },
    { label: 'Active Notices', value: news.length, color: 'bg-purple-500', icon: '🔔' },
  ];

  const chartData = useMemo(() => {
    const types: Record<string, number> = {};
    leaves.forEach(l => {
      types[l.type] = (types[l.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [leaves]);

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">Real-time status of A/Nikawewa Muslim Vidyalaya</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leave Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Leave Distribution (Current Year)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Pending Leaves */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Leave Requests</h3>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</button>
          </div>
          <div className="space-y-4">
            {pendingLeaves.length > 0 ? pendingLeaves.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{l.teacherName}</p>
                  <p className="text-xs text-gray-500">{l.type} • {l.startDate}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">Pending</span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 italic">No pending requests</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
