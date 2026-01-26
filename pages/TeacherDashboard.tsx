
import React from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Icons } from '../constants';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const news = storageService.getNews();
  const school = storageService.getSchoolProfile();
  const myLeaves = storageService.getLeaves().filter(l => l.teacherId === user.id);
  const myStudents = storageService.getStudents(user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salam, {user.name}</h1>
          <p className="text-gray-500">Welcome to your teacher portal.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2">
          <Icons.Calendar />
          <span className="text-sm font-semibold">Academic Year: {school.academicYear}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            <div className="relative">
              <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-emerald-700 border-4 border-white shadow-lg font-black">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-black text-gray-900 leading-tight">{user.name}</h3>
              <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider mt-1">{user.designation}</p>
            </div>
            
            <div className="mt-8 w-full space-y-4 pt-6 border-t border-gray-50">
              <div className="flex justify-between text-xs font-bold text-left">
                <span className="text-gray-400 uppercase tracking-widest">Primary Subject</span>
                <span className="text-gray-800">{user.subject}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-left">
                <span className="text-gray-400 uppercase tracking-widest">Assigned Class</span>
                <span className="text-emerald-700">{user.assignedClass}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-2xl shadow-emerald-200">
             <h4 className="text-sm font-black uppercase tracking-[3px] mb-6 opacity-60">Personal Summary</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-800 p-4 rounded-2xl border border-emerald-700/50">
                  <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest mb-1">Approved Leaves</p>
                  <p className="text-3xl font-black">{myLeaves.filter(l => l.status === 'APPROVED').length}</p>
                </div>
                <div className="bg-emerald-800 p-4 rounded-2xl border border-emerald-700/50">
                  <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest mb-1">Assigned Students</p>
                  <p className="text-3xl font-black">{myStudents.length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Notices Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                LATEST ANNOUNCEMENTS
              </h3>
              <div className="bg-emerald-50 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black text-emerald-700">{news.length} ITEMS</span>
              </div>
            </div>

            <div className="space-y-12">
              {news.length > 0 ? news.map(item => (
                <div key={item.id} className="relative group">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          item.category === 'Circular' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {item.category}
                        </span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span className="text-xs font-bold text-gray-400">{item.date}</span>
                      </div>
                   </div>
                   
                   <h5 className="font-black text-gray-900 text-2xl mb-4 group-hover:text-emerald-700 transition-colors leading-tight">{item.title}</h5>
                   
                   {item.imageUrls && item.imageUrls.length > 0 && (
                     <div className={`mt-4 mb-6 grid gap-2 max-w-3xl rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-sm transition-transform group-hover:scale-[1.01] duration-300 ${
                       item.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                     }`}>
                       {item.imageUrls.map((url, idx) => (
                         <div key={idx} className={`relative bg-gray-50 ${item.imageUrls?.length === 3 && idx === 0 ? 'row-span-2 aspect-auto min-h-[300px]' : 'aspect-video'}`}>
                           <img src={url} alt={item.title} className="w-full h-full object-cover" />
                         </div>
                       ))}
                     </div>
                   )}
                   
                   <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{item.content}</p>
                   
                   <div className="mt-8 border-b border-gray-50"></div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                     <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4" /></svg>
                   </div>
                   <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">No official notices published yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
