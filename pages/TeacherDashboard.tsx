
import React from 'react';
import { User, NewsItem } from '../types';
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
        {/* Left Column - Profile & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-4xl text-emerald-700 mb-4 border-4 border-white shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.designation}</p>
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between text-sm py-2 border-b">
                    <span className="text-gray-500">Subject</span>
                    <span className="font-semibold">{user.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b">
                    <span className="text-gray-500">Class</span>
                    <span className="font-semibold">{user.assignedClass}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-500">Service</span>
                    <span className="font-semibold">{user.serviceType}</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-lg shadow-emerald-200">
             <h4 className="font-bold mb-4">My Dashboard Summary</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-800 p-3 rounded-xl border border-emerald-700">
                  <p className="text-xs text-emerald-300">Leaves Taken</p>
                  <p className="text-xl font-bold">{myLeaves.length}</p>
                </div>
                <div className="bg-emerald-800 p-3 rounded-xl border border-emerald-700">
                  <p className="text-xs text-emerald-300">Total Students</p>
                  <p className="text-xl font-bold">{myStudents.length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column - Notices & Circulars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-emerald-600">🔔</span> Latest School Notices
            </h3>
            <div className="space-y-6">
              {news.length > 0 ? news.map(item => (
                <div key={item.id} className="border-l-4 border-emerald-500 pl-4 py-2 hover:bg-emerald-50 transition-colors cursor-pointer group rounded-r-lg">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{item.category}</span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                   </div>
                   <h5 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.title}</h5>
                   <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.content}</p>
                </div>
              )) : (
                <div className="text-center py-20">
                   <p className="text-gray-400 italic">No new notices from the office.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📁</div>
               <div>
                 <h6 className="font-bold text-sm">Circulars Archive</h6>
                 <p className="text-xs text-gray-500">Download official documents</p>
               </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
               <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">🗓️</div>
               <div>
                 <h6 className="font-bold text-sm">Term Dates</h6>
                 <p className="text-xs text-gray-500">View academic calendar</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
