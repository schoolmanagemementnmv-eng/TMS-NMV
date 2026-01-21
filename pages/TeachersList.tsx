
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { User, UserRole } from '../types';

const TeachersList: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>(storageService.getUsers().filter(u => u.role === UserRole.TEACHER));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.nic.includes(search) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  const handleToggleActive = (id: string) => {
    const updated = teachers.map(t => t.id === id ? { ...t, active: !t.active } : t);
    setTeachers(updated);
    const u = updated.find(t => t.id === id);
    if (u) storageService.saveUser(u);
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: User = {
      id: editingTeacher?.id || Math.random().toString(36).substr(2, 9),
      email: formData.get('email') as string,
      password: (formData.get('password') as string) || editingTeacher?.password || 'Teacher123',
      name: formData.get('name') as string,
      role: UserRole.TEACHER,
      nic: formData.get('nic') as string,
      designation: formData.get('designation') as string,
      subject: formData.get('subject') as string,
      assignedClass: formData.get('assignedClass') as string,
      contact: formData.get('contact') as string,
      serviceType: formData.get('serviceType') as string,
      active: editingTeacher ? editingTeacher.active : true,
    };

    storageService.saveUser(data);
    setTeachers(storageService.getUsers().filter(u => u.role === UserRole.TEACHER));
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers Database</h1>
          <p className="text-gray-500">Manage all academic staff credentials and roles</p>
        </div>
        <button 
          onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
        >
          <span>Add New Teacher</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search by Name, NIC, or Subject..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Teacher Profile</th>
                <th className="px-6 py-4">NIC</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTeachers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{t.nic}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-bold">{t.subject}</div>
                    <div className="text-emerald-600 text-xs font-bold">{t.assignedClass}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button 
                      onClick={() => { setEditingTeacher(t); setIsModalOpen(true); }}
                      className="text-emerald-600 hover:text-emerald-800 font-bold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleToggleActive(t.id)}
                      className={`${t.active ? 'text-red-600 hover:text-red-800' : 'text-emerald-600 hover:text-emerald-800'} font-bold`}
                    >
                      {t.active ? 'Lock' : 'Unlock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 bg-emerald-800 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">{editingTeacher ? 'Update Teacher' : 'Register New Teacher'}</h2>
                <p className="text-emerald-200 text-sm">Fill in details for administrative registration</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-200 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveTeacher} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                  <input name="name" required defaultValue={editingTeacher?.name} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Portal Email</label>
                  <input name="email" type="email" required defaultValue={editingTeacher?.email} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Default Password</label>
                  <input name="password" type="text" placeholder={editingTeacher ? 'Leave empty to keep current' : 'e.g. Teacher@2024'} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NIC Number</label>
                  <input name="nic" required defaultValue={editingTeacher?.nic} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Designation</label>
                  <input name="designation" required defaultValue={editingTeacher?.designation} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</label>
                  <input name="subject" required defaultValue={editingTeacher?.subject} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Class</label>
                  <input name="assignedClass" required defaultValue={editingTeacher?.assignedClass} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Service Rank</label>
                  <input name="serviceType" required defaultValue={editingTeacher?.serviceType} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Number</label>
                   <input name="contact" required defaultValue={editingTeacher?.contact} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-bold text-gray-700" />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all">
                  {editingTeacher ? 'Update Record' : 'Create Teacher Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersList;
