
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface TeacherProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'service' | 'academic' | 'residential'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Helper to calculate Y/M/D from a date string
  const calculatePeriod = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const start = new Date(dateStr);
    const end = new Date();
    if (isNaN(start.getTime())) return 'N/A';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years}Y ${months}M ${days}D`;
  };

  const teacherAge = useMemo(() => calculatePeriod(user.dob), [user.dob]);
  const totalService = useMemo(() => calculatePeriod(user.firstAppointmentDate), [user.firstAppointmentDate]);
  const schoolService = useMemo(() => calculatePeriod(user.presentSchoolJoinDate), [user.presentSchoolJoinDate]);
  const zoneService = useMemo(() => calculatePeriod(user.zoneAppointmentDate), [user.zoneAppointmentDate]);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const updatedUser: User = {
      ...user,
      empNo: fd.get('empNo') as string,
      title: fd.get('title') as string,
      initials: fd.get('initials') as string,
      surname: fd.get('surname') as string,
      fullName: fd.get('fullName') as string,
      dob: fd.get('dob') as string,
      gender: fd.get('gender') as string,
      mobileNo: fd.get('mobileNo') as string,
      fixedLineNo: fd.get('fixedLineNo') as string,
      designation: fd.get('designation') as string,
      service: fd.get('service') as string,
      grade: fd.get('grade') as string,
      nic: fd.get('nic') as string,
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
      alSubject1: fd.get('alSubject1') as string,
      alSubject2: fd.get('alSubject2') as string,
      alSubject3: fd.get('alSubject3') as string,
      alSubject4: fd.get('alSubject4') as string,
      degreeTitle: fd.get('degreeTitle') as string,
      degreeSubject1: fd.get('degreeSubject1') as string,
      degreeSubject2: fd.get('degreeSubject2') as string,
      degreeSubject3: fd.get('degreeSubject3') as string,
      otherProfessionalQual: fd.get('otherProfessionalQual') as string,
      releasedPlace: fd.get('releasedPlace') as string,
      releasedDesignation: fd.get('releasedDesignation') as string,
      releasedFromDate: fd.get('releasedFromDate') as string,
      releasedToDate: fd.get('releasedToDate') as string,
      residentialProvince: fd.get('residentialProvince') as string,
      residentialZone: fd.get('residentialZone') as string,
      residentialDivision: fd.get('residentialDivision') as string,
      residentialDsDivision: fd.get('residentialDsDivision') as string,
      residentialGnDivision: fd.get('residentialGnDivision') as string,
      privateAddress: fd.get('privateAddress') as string,
      email: fd.get('email') as string,
      zoneAppointmentDate: fd.get('zoneAppointmentDate') as string,
    };

    storageService.saveUser(updatedUser);
    onUpdate(updatedUser);
    localStorage.setItem('logged_user', JSON.stringify(updatedUser));
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const Field = ({ label, name, type = "text", options, value, readOnly }: { label: string, name: string, type?: string, options?: string[], value?: string, readOnly?: boolean }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      {options ? (
        <select 
          name={name} 
          disabled={!isEditing || readOnly} 
          defaultValue={value}
          className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none font-bold text-sm ${isEditing && !readOnly ? 'border-emerald-500 bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          name={name} 
          type={type} 
          readOnly={!isEditing || readOnly} 
          defaultValue={value}
          className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none font-bold text-sm ${isEditing && !readOnly ? 'border-emerald-500 bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`}
        />
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Teacher Information System</h1>
          <p className="text-gray-500 font-medium italic">Comprehensive Faculty Digital Record</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100">Cancel</button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-emerald-600 text-white px-8 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Edit Record</button>
          )}
          {isSaved && <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest animate-in fade-in zoom-in">Saved!</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 text-center">
             <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-black text-emerald-700">
                {user.name.charAt(0)}
             </div>
             <h3 className="font-black text-gray-900">{user.name}</h3>
             <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">{user.empNo || 'EMP NO PENDING'}</p>
          </div>
          
          <div className="bg-emerald-950 p-2 rounded-3xl flex flex-col gap-1">
            {[
              { id: 'personal', label: 'Personal Information', icon: '👤' },
              { id: 'service', label: 'Service History', icon: '📋' },
              { id: 'academic', label: 'Academic & Teaching', icon: '🎓' },
              { id: 'residential', label: 'Residential Details', icon: '🏠' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-emerald-100/50 hover:text-white'}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl space-y-4">
             <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Live Period Tracking</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-600/70 font-bold uppercase">Age</span>
                  <span className="text-xs font-black text-emerald-900">{teacherAge}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-600/70 font-bold uppercase">Total Service</span>
                  <span className="text-xs font-black text-emerald-900">{totalService}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-600/70 font-bold uppercase">In School</span>
                  <span className="text-xs font-black text-emerald-900">{schoolService}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-600/70 font-bold uppercase">In Zone</span>
                  <span className="text-xs font-black text-emerald-900">{zoneService}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            
            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Field label="Employee Number" name="empNo" value={user.empNo} />
                  <Field label="Title" name="title" options={['REV', 'MR', 'MRS', 'MISS']} value={user.title} />
                  <Field label="Initials" name="initials" value={user.initials} />
                  <Field label="Surname" name="surname" value={user.surname} />
                  <Field label="Full Name" name="fullName" value={user.fullName} />
                  <Field label="Gender" name="gender" options={['MALE', 'FEMALE']} value={user.gender} />
                  <Field label="Date of Birth (M/D/Y)" name="dob" type="date" value={user.dob} />
                  <Field label="NIC Number" name="nic" value={user.nic} />
                  <Field label="Ethnic" name="ethnic" options={['SINHALESE', 'TAMIL', 'MUSLIM']} value={user.ethnic} />
                  <Field label="Mobile Phone No" name="mobileNo" value={user.mobileNo} />
                  <Field label="Fixed Line No" name="fixedLineNo" value={user.fixedLineNo} />
                  <Field label="Email Address" name="email" type="email" value={user.email} />
                </div>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Designation" name="designation" value={user.designation} />
                  <Field label="Service" name="service" value={user.service} />
                  <Field label="Grade" name="grade" value={user.grade} />
                  <Field label="Zone" name="zone" value={user.zone} />
                  <Field label="1st Appoinment Date" name="firstAppointmentDate" type="date" value={user.firstAppointmentDate} />
                  <Field label="Trained / Untrained" name="trainedStatus" options={['TRAINED', 'UNTRAINED']} value={user.trainedStatus} />
                  <Field label="Type of Appointment" name="appointmentType" value={user.appointmentType} />
                  <Field label="Appoinment Category" name="appointmentCategory" options={['SLPS', 'SLTS', 'OTHER']} value={user.appointmentCategory} />
                  <Field label="Appoinment Subject" name="appointmentSubject" value={user.appointmentSubject} />
                  <Field label="Training Subject" name="trainingSubject" value={user.trainingSubject} />
                  <Field label="Appoinment Date to Zone" name="zoneAppointmentDate" type="date" value={user.zoneAppointmentDate} />
                  <Field label="Duty Assumed Present School" name="presentSchoolJoinDate" type="date" value={user.presentSchoolJoinDate} />
                </div>
                
                <div className="pt-8 border-t space-y-6">
                  <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Released for Other Service</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Release Place" name="releasedPlace" value={user.releasedPlace} />
                    <Field label="Release Designation" name="releasedDesignation" value={user.releasedDesignation} />
                    <Field label="Released From" name="releasedFromDate" type="date" value={user.releasedFromDate} />
                    <Field label="Released To" name="releasedToDate" type="date" value={user.releasedToDate} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Main Subject 1" name="mainSubject1" value={user.mainSubject1} />
                  <Field label="Main Subject 2" name="mainSubject2" value={user.mainSubject2} />
                  <Field label="Main Subject 3" name="mainSubject3" value={user.mainSubject3} />
                  <Field label="Teaching Grades" name="teachingGrades" value={user.teachingGrades} />
                  <Field label="Medium" name="medium" options={['SINHALA', 'TAMIL', 'ENGLISH']} value={user.medium} />
                  <Field label="Total Periods Per Week" name="totalPeriodsPerWeek" value={user.totalPeriodsPerWeek} />
                </div>

                <div className="pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">A/L Record</h4>
                      <Field label="A/L Stream" name="alStream" value={user.alStream} />
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Subject 1" name="alSubject1" value={user.alSubject1} />
                        <Field label="Subject 2" name="alSubject2" value={user.alSubject2} />
                        <Field label="Subject 3" name="alSubject3" value={user.alSubject3} />
                        <Field label="Subject 4" name="alSubject4" value={user.alSubject4} />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Higher Education</h4>
                      <Field label="Title of Degree" name="degreeTitle" value={user.degreeTitle} />
                      <div className="grid grid-cols-1 gap-4">
                        <Field label="Degree Subject 1" name="degreeSubject1" value={user.degreeSubject1} />
                        <Field label="Degree Subject 2" name="degreeSubject2" value={user.degreeSubject2} />
                        <Field label="Degree Subject 3" name="degreeSubject3" value={user.degreeSubject3} />
                      </div>
                   </div>
                </div>
                <div className="pt-6 border-t">
                   <Field label="Other Professional Qualifications" name="otherProfessionalQual" value={user.otherProfessionalQual} />
                </div>
              </div>
            )}

            {activeTab === 'residential' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Residential Province" name="residentialProvince" value={user.residentialProvince} />
                  <Field label="Residential Education Zone" name="residentialZone" value={user.residentialZone} />
                  <Field label="Residential Education Division" name="residentialDivision" value={user.residentialDivision} />
                  <Field label="Residential DS Division" name="residentialDsDivision" value={user.residentialDsDivision} />
                  <Field label="Residential GN Division" name="residentialGnDivision" value={user.residentialGnDivision} />
                </div>
                <div className="pt-6 border-t">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Private Address</label>
                  <textarea 
                    name="privateAddress" 
                    readOnly={!isEditing} 
                    defaultValue={user.privateAddress} 
                    className={`w-full px-5 py-4 rounded-[24px] border-2 outline-none font-medium transition-all resize-none min-h-[120px] ${isEditing ? 'border-emerald-500 bg-white' : 'border-transparent bg-gray-50'}`}
                  />
                </div>
              </div>
            )}

            {isEditing && (
              <div className="mt-auto pt-10 flex justify-end">
                <button type="submit" className="bg-emerald-600 text-white px-16 py-4 rounded-[28px] font-black text-lg shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all">
                  Sync Profile to Database
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
