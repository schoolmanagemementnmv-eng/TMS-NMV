
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, UserRole, SchoolStats, GradeStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatisticsModuleProps {
  user: User;
}

const StatisticsModule: React.FC<StatisticsModuleProps> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [stats, setStats] = useState<SchoolStats>(storageService.getSchoolStats());
  const [isEditing, setIsEditing] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'entry'>(isAdmin ? 'entry' : 'dashboard');

  useEffect(() => {
    setStats(storageService.getSchoolStats());
  }, []);

  const totals = useMemo(() => {
    let totalBoys = 0;
    let totalGirls = 0;
    let primaryTotal = 0;
    let secondaryTotal = 0;

    stats.gradeData.forEach(g => {
      totalBoys += g.boys;
      totalGirls += g.girls;
      const gradeNum = parseInt(g.grade);
      if (gradeNum <= 5) {
        primaryTotal += g.boys + g.girls;
      } else {
        secondaryTotal += g.boys + g.girls;
      }
    });

    return {
      totalStudents: totalBoys + totalGirls,
      totalBoys,
      totalGirls,
      primaryTotal,
      secondaryTotal,
      totalTeachers: stats.teacherCount
    };
  }, [stats]);

  const handleStatChange = (gradeIndex: number, field: 'boys' | 'girls', value: string) => {
    const num = parseInt(value) || 0;
    const newGradeData = [...stats.gradeData];
    newGradeData[gradeIndex] = { ...newGradeData[gradeIndex], [field]: num };
    setStats({ ...stats, gradeData: newGradeData });
  };

  const handleTeacherChange = (value: string) => {
    const num = parseInt(value) || 0;
    setStats({ ...stats, teacherCount: num });
  };

  const handleSave = () => {
    storageService.saveSchoolStats(stats);
    setIsEditing(false);
    alert('Statistics updated successfully!');
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
  
  const genderData = [
    { name: 'Boys', value: totals.totalBoys, color: '#3b82f6' },
    { name: 'Girls', value: totals.totalGirls, color: '#ec4899' }
  ];

  const sectionData = [
    { name: 'Primary', value: totals.primaryTotal, color: '#10b981' },
    { name: 'Secondary', value: totals.secondaryTotal, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Institution Census</h1>
          <p className="text-gray-500 font-medium italic">Demographic distribution and faculty statistics</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm ring-1 ring-gray-50">
             <button 
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}
             >
                Dashboard
             </button>
             <button 
                onClick={() => setActiveView('entry')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'entry' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}
             >
                Admin Entry
             </button>
          </div>
        )}
      </div>

      {activeView === 'dashboard' ? (
        <div className="space-y-10 animate-in fade-in duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 border-l-[12px] border-emerald-500 ring-1 ring-gray-50">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Students</p>
               <h3 className="text-4xl font-black text-emerald-900">{totals.totalStudents}</h3>
               <div className="mt-4 flex gap-4 text-[10px] font-black uppercase">
                  <span className="text-blue-500">♂ {totals.totalBoys} Boys</span>
                  <span className="text-pink-500">♀ {totals.totalGirls} Girls</span>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 border-l-[12px] border-blue-500 ring-1 ring-gray-50">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Teachers</p>
               <h3 className="text-4xl font-black text-blue-900">{totals.totalTeachers}</h3>
               <p className="text-[10px] text-gray-400 font-bold mt-4">Faculty Registry v2.0</p>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 border-l-[12px] border-orange-500 ring-1 ring-gray-50">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Section</p>
               <h3 className="text-4xl font-black text-orange-900">{totals.primaryTotal}</h3>
               <p className="text-[10px] text-gray-400 font-bold mt-4">Grade 1 to 5</p>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 border-l-[12px] border-purple-500 ring-1 ring-gray-50">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secondary Section</p>
               <h3 className="text-4xl font-black text-purple-900">{totals.secondaryTotal}</h3>
               <p className="text-[10px] text-gray-400 font-bold mt-4">Grade 6 to 11</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Distribution Chart */}
            <div className="lg:col-span-2 bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 ring-1 ring-gray-50">
               <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Grade-wise Enrollment Distribution</h3>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.gradeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="grade" axisLine={false} tickLine={false} fontSize={12} fontStyle="bold" label={{ value: 'Grade', position: 'insideBottom', offset: -5 }} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="boys" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="girls" stackId="a" fill="#ec4899" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Pie Charts Side Block */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 ring-1 ring-gray-50 flex flex-col items-center">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-4">Gender Ratio</h4>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                          {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-xs font-black">BOYS</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-full"></div><span className="text-xs font-black">GIRLS</span></div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 ring-1 ring-gray-50 flex flex-col items-center">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-4">Section Balance</h4>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sectionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                          {sectionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-xs font-black">PRIMARY</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-xs font-black">SECONDARY</span></div>
                 </div>
              </div>
            </div>
          </div>

          {/* List View for Detailed Counts */}
          <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
             <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Consolidated Class Ledger</h3>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">
                  Last Sync: {new Date(stats.lastUpdated).toLocaleString()}
                </span>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                   <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[3px]">
                      <tr>
                         <th className="px-12 py-8 text-left">Academic Unit</th>
                         <th className="px-12 py-8 text-center">Male Count</th>
                         <th className="px-12 py-8 text-center">Female Count</th>
                         <th className="px-12 py-8 text-center bg-emerald-50 text-emerald-900">Aggregate</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 font-bold">
                      {stats.gradeData.map((g) => (
                        <tr key={g.grade} className="hover:bg-gray-50 transition-colors">
                           <td className="px-12 py-6">Grade {g.grade}</td>
                           <td className="px-12 py-6 text-center text-blue-600 font-black">{g.boys}</td>
                           <td className="px-12 py-6 text-center text-pink-600 font-black">{g.girls}</td>
                           <td className="px-12 py-6 text-center bg-emerald-50 font-black text-lg text-emerald-900">{g.boys + g.girls}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-right-10 duration-500">
           <div className="bg-emerald-950 text-white p-12 rounded-[56px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-3xl font-black mb-4">Census Entry Console</h2>
                 <p className="text-emerald-300 font-medium italic opacity-80">Authorized Admin override for institutional aggregates.</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 opacity-20"></div>
           </div>

           <div className="bg-white p-12 rounded-[56px] shadow-sm border border-gray-100 space-y-10 ring-1 ring-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] border-b border-gray-50 pb-4">Global Faculty Count</h3>
                    <div>
                       <label className="block text-[11px] font-black text-emerald-700 uppercase mb-3 tracking-widest">Total Active Teachers</label>
                       <input 
                         type="number" 
                         value={stats.teacherCount} 
                         onChange={(e) => handleTeacherChange(e.target.value)}
                         className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                       />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] border-b border-gray-50 pb-4">Quick Stats Preview</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-emerald-50 p-6 rounded-3xl">
                          <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Students</p>
                          <p className="text-2xl font-black text-emerald-900">{totals.totalStudents}</p>
                       </div>
                       <div className="bg-blue-50 p-6 rounded-3xl">
                          <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest mb-1">Teachers</p>
                          <p className="text-2xl font-black text-blue-900">{stats.teacherCount}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] border-b border-gray-50 pb-4">Grade-wise Census Entry</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.gradeData.map((g, idx) => (
                      <div key={g.grade} className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Grade {g.grade}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{g.boys + g.girls} Total</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 text-center">Boys</label>
                               <input 
                                 type="number" 
                                 value={g.boys} 
                                 onChange={(e) => handleStatChange(idx, 'boys', e.target.value)}
                                 className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl px-3 py-3 text-center font-black outline-none transition-all shadow-sm"
                               />
                            </div>
                            <div>
                               <label className="block text-[9px] font-black text-pink-500 uppercase tracking-widest mb-2 text-center">Girls</label>
                               <input 
                                 type="number" 
                                 value={g.girls} 
                                 onChange={(e) => handleStatChange(idx, 'girls', e.target.value)}
                                 className="w-full bg-white border-2 border-transparent focus:border-pink-500 rounded-xl px-3 py-3 text-center font-black outline-none transition-all shadow-sm"
                               />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end pt-10">
                 <button 
                   onClick={handleSave} 
                   className="bg-emerald-950 text-emerald-400 px-20 py-6 rounded-[40px] font-black text-xl shadow-[0_40px_80px_-15px_rgba(6,78,59,0.4)] hover:bg-black hover:text-white transform transition-all tracking-[4px] border-4 border-emerald-900"
                 >
                   Save Official Census
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .recharts-cartesian-grid-horizontal line { stroke: #f3f4f6; }
      `}</style>
    </div>
  );
};

export default StatisticsModule;
