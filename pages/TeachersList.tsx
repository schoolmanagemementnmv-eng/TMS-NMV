
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, UserRole } from '../types';

const TeachersList: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>(storageService.getUsers().filter(u => u.role === UserRole.TEACHER));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'service' | 'academic' | 'residential'>('personal');
  
  const school = storageService.getSchoolProfile();
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Sync state with storage whenever we open the page or close a modal
  const refreshData = () => {
    setTeachers(storageService.getUsers().filter(u => u.role === UserRole.TEACHER));
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.nic.includes(search) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.empNo?.toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  useEffect(() => {
    if (editingTeacher) {
      const classes = editingTeacher.assignedClass?.split(', ').filter(c => c !== '') || [];
      setSelectedClasses(classes);
    } else {
      setSelectedClasses([]);
    }
  }, [editingTeacher, isModalOpen]);

  const handleToggleActive = (id: string) => {
    const updated = teachers.map(t => t.id === id ? { ...t, active: !t.active } : t);
    const u = updated.find(t => t.id === id);
    if (u) {
      storageService.saveUser(u);
      refreshData();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("CRITICAL: Are you sure you want to delete this teacher? This will permanently remove their profile and database entry.")) {
      storageService.deleteUser(id);
      refreshData();
    }
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const assignedClassString = selectedClasses.length > 0 ? selectedClasses.join(', ') : 'N/A';

    const data: User = {
      ...editingTeacher,
      id: editingTeacher?.id || Math.random().toString(36).substr(2, 9),
      email: fd.get('email') as string,
      password: (fd.get('password') as string) || editingTeacher?.password || 'Teacher123',
      name: fd.get('name') as string,
      role: UserRole.TEACHER,
      nic: fd.get('nic') as string,
      designation: fd.get('designation') as string,
      subject: fd.get('subject') as string,
      assignedClass: assignedClassString,
      contact: fd.get('contact') as string,
      active: editingTeacher ? editingTeacher.active : true,
      
      // Syncing all fields from teacher profile schema
      empNo: fd.get('empNo') as string,
      title: fd.get('title') as string,
      initials: fd.get('initials') as string,
      surname: fd.get('surname') as string,
      fullName: fd.get('fullName') as string,
      dob: fd.get('dob') as string,
      gender: fd.get('gender') as string,
      mobileNo: fd.get('mobileNo') as string,
      fixedLineNo: fd.get('fixedLineNo') as string,
      service: fd.get('service') as string,
      grade: fd.get('grade') as string,
      zone: fd.get('zone') as string,
      ethnic: fd.get('ethnic') as string,
      firstAppointmentDate: fd.get('firstAppointmentDate') as string,
      trainedStatus: fd.get('trainedStatus') as string,
      appointmentType: fd.get('appointmentType') as string,
      appointmentCategory: fd.get('appointmentCategory') as string,
      appointmentSubject: fd.get('appointmentSubject') as string,
      trainingSubject: fd.get('trainingSubject') as string,
      mainSubject1: fd.get('mainSubject1') as string,
      mainSubject2: fd.get('mainSubject2') as string,
      mainSubject3: fd.get('mainSubject3') as string,
      teachingGrades: fd.get('teachingGrades') as string,
      totalPeriodsPerWeek: fd.get('totalPeriodsPerWeek') as string,
      medium: fd.get('medium') as string,
      presentSchoolJoinDate: fd.get('presentSchoolJoinDate') as string,
      alStream: fd.get('alStream') as string,
      degreeTitle: fd.get('degreeTitle') as string,
      residentialProvince: fd.get('residentialProvince') as string,
      residentialZone: fd.get('residentialZone') as string,
      privateAddress: fd.get('privateAddress') as string,
    };

    storageService.saveUser(data);
    refreshData();
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const exportToExcel = () => {
    let csv = "Emp No,Title,Name,NIC,Designation,Subject,Classes,Contact,Email,Status\n";
    teachers.forEach(t => {
      csv += `${t.empNo || 'N/A'},${t.title || ''},${t.name},${t.nic},${t.designation},${t.subject},"${t.assignedClass}",${t.contact},${t.email},${t.active ? 'Active' : 'Inactive'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Teachers_Database_${new Date().getFullYear()}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    const content = `
      <html>
        <head>
          <title>Teachers Database Ledger</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 15mm; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { margin: 0; color: #065f46; text-transform: uppercase; font-size: 18pt; }
            h2 { margin: 5px 0; font-size: 12pt; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 9pt; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; text-transform: uppercase; color: #475569; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
            .sig { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-size: 9pt; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${school.fullName}</h1>
            <h2>OFFICIAL TEACHERS DATABASE LEDGER - ACADEMIC YEAR ${school.academicYear}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Emp No</th>
                <th>Full Name</th>
                <th>NIC</th>
                <th>Designation</th>
                <th>Primary Subject</th>
                <th>Assigned Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${teachers.map(t => `
                <tr>
                  <td>${t.empNo || 'N/A'}</td>
                  <td>${t.title || ''} ${t.name}</td>
                  <td>${t.nic}</td>
                  <td>${t.designation}</td>
                  <td>${t.subject}</td>
                  <td>${t.assignedClass}</td>
                  <td>${t.active ? 'Active' : 'Inactive'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div class="sig">Administrative Clerk</div>
            <div class="sig">Principal / Sectional Head</div>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(content);
      win.document.close();
      win.print();
    }
  };

  const toggleClass = (cls: string) => {
    if (cls === 'N/A') { setSelectedClasses(['N/A']); return; }
    setSelectedClasses(prev => {
      const filtered = prev.filter(c => c !== 'N/A');
      return filtered.includes(cls) ? filtered.filter(c => c !== cls) : [...filtered, cls];
    });
  };

  const classOptions = useMemo(() => {
    const options: string[] = [];
    for (let grade = 1; grade <= 11; grade++) {
      ['A', 'B', 'C'].forEach(section => options.push(`Grade ${grade}-${section}`));
    }
    return options;
  }, []);

  const Field = ({ label, name, type = "text", options, defaultValue, readOnly }: any) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      {options ? (
        <select name={name} defaultValue={defaultValue} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-sm">
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} readOnly={readOnly} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-sm" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Teachers Database</h1>
          <p className="text-gray-500 font-medium italic">Centralized Repository of Faculty Service Records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportToExcel} className="bg-white border border-gray-200 text-emerald-700 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-all text-xs flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          <button onClick={exportToPDF} className="bg-white border border-gray-200 text-red-700 px-5 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-all text-xs flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            PDF
          </button>
          <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 text-xs">
            Add New Record
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search database by Name, NIC, ID..."
            className="block w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-gray-50 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Faculty Profile</th>
                <th className="px-8 py-6">Employee ID</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredTeachers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black uppercase shadow-inner">
                         {t.name.charAt(0)}
                       </div>
                       <div>
                          <div className="font-black text-gray-900 uppercase">{t.title} {t.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t.nic} • {t.subject}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-emerald-700 font-black bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-xs">
                      {t.empNo || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {t.active ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-4">
                    <button onClick={() => { setEditingTeacher(t); setIsModalOpen(true); }} className="text-emerald-600 hover:text-emerald-800 font-black text-xs uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleToggleActive(t.id)} className={`${t.active ? 'text-orange-600 hover:text-orange-800' : 'text-emerald-600 hover:text-emerald-800'} font-black text-xs uppercase tracking-widest`}>
                      {t.active ? 'Lock' : 'Unlock'}
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 font-black text-xs uppercase tracking-widest">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md">
          <div className="bg-white rounded-[48px] w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-10 bg-emerald-800 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">{editingTeacher ? 'Modify Database Entry' : 'Register Faculty'}</h2>
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest opacity-80">System-Wide Professional Record Control</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="bg-emerald-900 px-10 py-3 flex gap-6 overflow-x-auto border-b border-emerald-800">
               {['personal', 'service', 'academic', 'residential'].map((tab: any) => (
                 <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`text-[10px] font-black uppercase tracking-widest py-2 transition-all border-b-2 ${activeTab === tab ? 'text-white border-white' : 'text-emerald-400 border-transparent hover:text-white whitespace-nowrap'}`}
                 >
                   {tab} Data
                 </button>
               ))}
            </div>

            <form onSubmit={handleSaveTeacher} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-white">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                  <div className="lg:col-span-3 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-4 tracking-widest">Authentication (Admin Controlled)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Portal Username (Email)" name="email" type="email" defaultValue={editingTeacher?.email} />
                      <Field label="Portal Password" name="password" placeholder="Set or reset access key" />
                    </div>
                  </div>
                  <Field label="Full Name" name="name" defaultValue={editingTeacher?.name} />
                  <Field label="NIC Number" name="nic" defaultValue={editingTeacher?.nic} />
                  <Field label="Employee No" name="empNo" defaultValue={editingTeacher?.empNo} />
                  <Field label="Title" options={['REV', 'MR', 'MRS', 'MISS']} defaultValue={editingTeacher?.title} name="title" />
                  <Field label="Contact No" name="contact" defaultValue={editingTeacher?.contact} />
                  <Field label="Date of Birth" name="dob" type="date" defaultValue={editingTeacher?.dob} />
                  <Field label="Gender" options={['MALE', 'FEMALE']} defaultValue={editingTeacher?.gender} name="gender" />
                  <Field label="Ethnic" options={['MUSLIM', 'SINHALESE', 'TAMIL']} defaultValue={editingTeacher?.ethnic} name="ethnic" />
                </div>
              )}

              {activeTab === 'service' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                  <Field label="Designation" name="designation" defaultValue={editingTeacher?.designation} />
                  <Field label="Primary Subject" name="subject" defaultValue={editingTeacher?.subject} />
                  <Field label="Service Type" name="service" defaultValue={editingTeacher?.service} />
                  <Field label="Service Grade" name="grade" defaultValue={editingTeacher?.grade} />
                  <Field label="Current Zone" name="zone" defaultValue={editingTeacher?.zone} />
                  <Field label="1st Appointment" name="firstAppointmentDate" type="date" defaultValue={editingTeacher?.firstAppointmentDate} />
                  <Field label="Appointment Type" name="appointmentType" defaultValue={editingTeacher?.appointmentType} />
                  <Field label="Category" options={['SLPS', 'SLTS', 'OTHER']} defaultValue={editingTeacher?.appointmentCategory} name="appointmentCategory" />
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Field label="Highest Degree" name="degreeTitle" defaultValue={editingTeacher?.degreeTitle} />
                      <Field label="Teaching Grades" name="teachingGrades" defaultValue={editingTeacher?.teachingGrades} />
                      <Field label="Teaching Medium" options={['TAMIL', 'SINHALA', 'ENGLISH']} defaultValue={editingTeacher?.medium} name="medium" />
                      <Field label="Total Periods/Week" name="totalPeriodsPerWeek" defaultValue={editingTeacher?.totalPeriodsPerWeek} />
                   </div>
                   
                   <div className="bg-gray-50 p-8 rounded-3xl space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Class Allocation</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedClasses.length > 0 ? selectedClasses.map(cls => (
                          <span key={cls} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                            {cls}
                            <button type="button" onClick={() => toggleClass(cls)} className="hover:text-red-200">×</button>
                          </span>
                        )) : <span className="text-gray-400 italic text-xs">No assignments.</span>}
                      </div>
                      <div className="max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border text-[10px] font-bold cursor-pointer">
                           <input type="checkbox" checked={selectedClasses.includes('N/A')} onChange={() => toggleClass('N/A')} /> N/A
                        </label>
                        {classOptions.map(opt => (
                           <label key={opt} className="flex items-center gap-2 p-2 bg-white rounded-lg border text-[10px] font-bold cursor-pointer hover:bg-emerald-50">
                             <input type="checkbox" checked={selectedClasses.includes(opt)} onChange={() => toggleClass(opt)} disabled={selectedClasses.includes('N/A')} /> {opt}
                           </label>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'residential' && (
                <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
                   <div className="grid grid-cols-2 gap-8">
                      <Field label="Residential Province" name="residentialProvince" defaultValue={editingTeacher?.residentialProvince} />
                      <Field label="Residential Zone" name="residentialZone" defaultValue={editingTeacher?.residentialZone} />
                   </div>
                   <div className="space-y-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Permanent Address</label>
                     <textarea name="privateAddress" defaultValue={editingTeacher?.privateAddress} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-medium min-h-[120px] resize-none" />
                   </div>
                </div>
              )}

              <div className="flex justify-end gap-6 pt-10 border-t">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }} className="px-10 py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white px-12 py-4 rounded-[24px] font-black text-lg hover:bg-emerald-700 shadow-xl transition-all">Update Database Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TeachersList;
