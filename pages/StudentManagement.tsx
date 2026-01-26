
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Student } from '../types';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(storageService.getStudents());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      (filterGrade === 'All' || s.grade === filterGrade) &&
      (filterClass === 'All' || s.class === filterClass)
    );
  }, [students, filterGrade, filterClass]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Student = {
      id: editingStudent?.id || Math.random().toString(36).substr(2, 9),
      indexNo: fd.get('indexNo') as string,
      nameWithInitials: fd.get('nameWithInitials') as string,
      fullName: fd.get('fullName') as string,
      dob: fd.get('dob') as string,
      grade: fd.get('grade') as string,
      class: fd.get('class') as string,
      gender: fd.get('gender') as any,
      contactNo: fd.get('contactNo') as string,
      teacherId: editingStudent?.teacherId || ''
    };
    storageService.saveStudent(data);
    setStudents(storageService.getStudents());
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Student Database</h1>
          <p className="text-gray-500">Manage institutional records class-wise</p>
        </div>
        <button 
          onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          Add New Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter Grade:</span>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="All">All Grades</option>
            {[...Array(11)].map((_, i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter Class:</span>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="All">All Sections</option>
            {['A', 'B', 'C'].map(c => <option key={c} value={c}>Section {c}</option>)}
          </select>
        </div>
        <div className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">
          Showing {filteredStudents.length} Students
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
            <tr>
              <th className="px-8 py-6">Index No</th>
              <th className="px-8 py-6">Name with Initials</th>
              <th className="px-8 py-6">Grade/Class</th>
              <th className="px-8 py-6">DOB</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.length > 0 ? filteredStudents.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-5 font-black text-emerald-700">{s.indexNo}</td>
                <td className="px-8 py-5">
                  <div className="font-bold text-gray-900">{s.nameWithInitials}</div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{s.fullName}</div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest">
                    {s.grade}-{s.class}
                  </span>
                </td>
                <td className="px-8 py-5 text-gray-500 font-medium">{s.dob}</td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => { setEditingStudent(s); setIsModalOpen(true); }} className="text-emerald-600 font-black text-xs hover:underline">Edit Record</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No matching students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 bg-emerald-800 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">{editingStudent ? 'Update Profile' : 'New Enrollment'}</h2>
                <p className="text-emerald-200 text-sm font-medium uppercase tracking-widest">Student Database Record</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSave} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Index Number</label>
                  <input name="indexNo" required defaultValue={editingStudent?.indexNo} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-black text-emerald-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Name with Initials</label>
                  <input name="nameWithInitials" required defaultValue={editingStudent?.nameWithInitials} placeholder="e.g. M.Z. Mohamed" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-gray-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name</label>
                  <textarea name="fullName" required defaultValue={editingStudent?.fullName} rows={2} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium resize-none text-gray-700" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Grade</label>
                    <select name="grade" required defaultValue={editingStudent?.grade || '9'} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black text-gray-800">
                      {[...Array(11)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Class</label>
                    <select name="class" required defaultValue={editingStudent?.class || 'A'} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black text-gray-800">
                      {['A', 'B', 'C'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Date of Birth</label>
                  <input type="date" name="dob" required defaultValue={editingStudent?.dob} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black text-gray-800" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all text-xs uppercase tracking-widest">Discard</button>
                  <button type="submit" className="bg-emerald-600 text-white px-12 py-4 rounded-[24px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Save Student</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
