
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { User, LeaveType, LeaveStatus, LeaveRequest } from '../types';

interface TeacherLeavesProps {
  user: User;
}

const TeacherLeaves: React.FC<TeacherLeavesProps> = ({ user }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(storageService.getLeaves().filter(l => l.teacherId === user.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Simple Calendar Logic
  const calendarDays = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const startDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const days = [];
    
    // Padding for start of week
    for (let i = 0; i < startDay; i++) days.push(null);
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const leave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate && l.status === LeaveStatus.APPROVED);
      days.push({ day: d, date: dateStr, leave });
    }
    return days;
  }, [leaves]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      teacherId: user.id,
      teacherName: user.name,
      type: formData.get('type') as LeaveType,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      reason: formData.get('reason') as string,
    };

    storageService.addLeave(data);
    setLeaves(storageService.getLeaves().filter(l => l.teacherId === user.id));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-500">Track and manage your attendance</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="bg-white p-1 rounded-xl border flex gap-1 shadow-sm">
             <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
             >
               List
             </button>
             <button 
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Calendar
             </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 flex-1 sm:flex-none"
          >
            Apply New
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date Range</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.length > 0 ? leaves.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{l.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {l.startDate} <span className="text-emerald-400 mx-1">→</span> {l.endDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">"{l.reason}"</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        l.status === LeaveStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' : 
                        l.status === LeaveStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Approved</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded-sm border"></span> Working</div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
            ))}
            {calendarDays.map((d, i) => (
              <div 
                key={i} 
                className={`aspect-square p-2 rounded-xl border transition-all flex flex-col items-center justify-center ${
                  d === null ? 'border-transparent' : 
                  d.leave ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}
              >
                {d && <span className="text-sm font-bold">{d.day}</span>}
                {d?.leave && <span className="text-[10px] mt-1 font-medium hidden sm:block">On Leave</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950 bg-opacity-80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
            <div className="bg-emerald-800 p-8 text-white text-center">
              <h2 className="text-3xl font-black">Apply Leave</h2>
              <p className="text-emerald-200 text-sm mt-1 uppercase tracking-widest font-bold">Nikawewa Muslim Vidyalaya</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Category</label>
                <select name="type" required className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all appearance-none font-bold text-gray-700">
                  {Object.values(LeaveType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">From</label>
                  <input type="date" name="startDate" required className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">To</label>
                  <input type="date" name="endDate" required className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason for Leave</label>
                <textarea name="reason" rows={3} required className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none resize-none font-medium" placeholder="Explain the necessity of this leave..."></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Dismiss</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white px-4 py-4 rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaves;
