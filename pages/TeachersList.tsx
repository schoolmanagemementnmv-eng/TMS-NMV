
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, UserRole } from '../types';

const TeachersList: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>(storageService.getUsers().filter(u => u.role === UserRole.TEACHER));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  
  // State for multi-select classes
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.nic.includes(search) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  // Sync selected classes when editing starts
  useEffect(() => {
    if (editingTeacher) {
      const classes = editingTeacher.assignedClass.split(', ').filter(c => c !== '');
      setSelectedClasses(classes);
    } else {
      setSelectedClasses([]);
    }
  }, [editingTeacher, isModalOpen]);

  const handleToggleActive = (id: string) => {
    const updated = teachers.map(t => t.id === id ? { ...t, active: !t.active } : t);
    setTeachers(updated);
    const u = updated.find(t => t.id === id);
    if (u) storageService.saveUser(u);
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Join selected classes into a single string
    const assignedClassString = selectedClasses.length > 0 ? selectedClasses.join(', ') : 'N/A';

    const data: User = {
      id: editingTeacher?.id || Math.random().toString(36).substr(2, 9),
      email: formData.get('email') as string,
      password: (formData.get('password') as string) || editingTeacher?.password || 'Teacher123',
      name: formData.get('name') as string,
      role: UserRole.TEACHER,
      nic: formData.get('nic') as string,
      designation: formData.get('designation') as string,
      subject: formData.get('subject') as string,
      assignedClass: assignedClassString,
      contact: formData.get('contact') as string,
      serviceType: formData.get('serviceType') as string,
      active: editingTeacher ? editingTeacher.active : true,
    };

    storageService.saveUser(data);
    setTeachers(storageService.getUsers().filter(u => u.role === UserRole.TEACHER));
    setIsModalOpen(false);
    setEditingTeacher(null);
    setSelectedClasses([]);
  };

  const toggleClass = (cls: string) => {
    if (cls === 'N/A') {
      setSelectedClasses(['N/A']);
      return;
    }
    
    setSelectedClasses(prev => {
      const filtered = prev.filter(c => c !== 'N/A');
      if (filtered.includes(cls)) {
        return filtered.filter(c => c !== cls);
      } else {
        return [...filtered, cls];
      }
    });
  };

  // Generate class options 1-11 with sections A, B, C
  const classOptions = useMemo(() => {
    const options: string[] = [];
    for (let grade = 1; grade <= 11; grade++) {
      ['A', 'B', 'C'].forEach(section => {
        options.push(`Grade ${grade}-${section}`);
      });
    }
    return options;
  }, []);

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
                    <div className="text-emerald-600 text-[10px] font-black uppercase tracking-tight line-clamp-2 max-w-[200px]">{t.assignedClass}</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 bg-emerald-800 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">{editingTeacher ? 'Update Teacher Profile' : 'Register New Teacher'}</h2>
                <p className="text-emerald-200 text-sm font-medium">A/Nikawewa Muslim Vidyalaya Official Record</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }} className="text-emerald-200 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveTeacher} className="p-8 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Personal Data */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px] border-b border-emerald-50 pb-2">Identification</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input name="name" required defaultValue={editingTeacher?.name} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">NIC Number</label>
                      <input name="nic" required defaultValue={editingTeacher?.nic} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px] border-b border-emerald-50 pb-2 pt-4">Portal Access</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Official Email</label>
                      <input name="email" type="email" required defaultValue={editingTeacher?.email} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Secret Password</label>
                      <input name="password" type="text" placeholder={editingTeacher ? '••••••••' : 'Default: Teacher123'} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Professional Assignment */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px] border-b border-emerald-50 pb-2">Academic Role</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Designation</label>
                      <input name="designation" required defaultValue={editingTeacher?.designation} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Primary Subject</label>
                      <input name="subject" required defaultValue={editingTeacher?.subject} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assigned Classes (Multi-Select)</label>
                      <div className="bg-gray-50 rounded-[24px] border-2 border-transparent p-4 focus-within:border-emerald-500 transition-all">
                        {/* Selected Badges */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                          {selectedClasses.length > 0 ? selectedClasses.map(cls => (
                            <span key={cls} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm shadow-emerald-100">
                              {cls}
                              <button type="button" onClick={() => toggleClass(cls)} className="hover:text-red-200">×</button>
                            </span>
                          )) : (
                            <span className="text-gray-400 text-[10px] font-medium italic">No classes selected. Select from below...</span>
                          )}
                        </div>
                        
                        {/* Checkbox Grid */}
                        <div className="max-h-48 overflow-y-auto pr-2 grid grid-cols-2 gap-2 custom-scrollbar">
                           <label className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors group">
                             <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                              checked={selectedClasses.includes('N/A')}
                              onChange={() => toggleClass('N/A')}
                             />
                             <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-700">Not Applicable (N/A)</span>
                           </label>
                           {classOptions.map(opt => (
                             <label key={opt} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors group">
                               <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                                checked={selectedClasses.includes(opt)}
                                onChange={() => toggleClass(opt)}
                                disabled={selectedClasses.includes('N/A')}
                               />
                               <span className={`text-xs font-bold transition-colors ${selectedClasses.includes(opt) ? 'text-emerald-700' : 'text-gray-600'} group-hover:text-emerald-700`}>{opt}</span>
                             </label>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }} className="px-8 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest text-xs">Discard Changes</button>
                <button type="submit" className="bg-emerald-600 text-white px-12 py-4 rounded-[24px] font-black text-lg hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all hover:-translate-y-1">
                  {editingTeacher ? 'Update Record' : 'Create Teacher Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default TeachersList;
