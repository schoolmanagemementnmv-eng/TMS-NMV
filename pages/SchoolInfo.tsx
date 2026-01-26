
import React from 'react';
import { storageService } from '../services/storageService';

const SchoolInfo: React.FC = () => {
  const profile = storageService.getSchoolProfile();

  // Fix: Made children optional to resolve TypeScript/JSX error where nested content is not correctly mapped to a required 'children' prop in the component interface.
  const InfoSection = ({ title, icon, children }: { title: string, icon: string, children?: React.ReactNode }) => (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value, fullWidth = false }: { label: string, value?: string, fullWidth?: boolean }) => (
    <div className={fullWidth ? "col-span-full" : ""}>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <p className="text-gray-800 font-semibold break-words">{value || 'Not Provided'}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">School Information</h1>
          <p className="text-gray-500 font-medium">Official institutional records and administrative data</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Principal</p>
            <p className="text-sm font-black text-emerald-700">{profile.principalName}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        </div>
      </div>

      {/* Header Info Card */}
      <div className="bg-emerald-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 items-center">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-700 rounded-full -ml-24 -mb-24 blur-2xl opacity-30"></div>
        
        <div className="relative w-48 h-48 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
          {profile.logoUrl ? (
            <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
          ) : (
            <span className="text-white font-black text-4xl">NM</span>
          )}
        </div>
        
        <div className="relative flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="text-4xl font-black mb-2">{profile.name}</h2>
            <p className="text-emerald-200 font-medium text-lg opacity-80">{profile.fullName}</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <span className="bg-emerald-800/50 backdrop-blur px-5 py-2 rounded-2xl text-sm font-bold border border-emerald-700">
              📅 Established: {profile.establishmentDate}
            </span>
            <span className="bg-emerald-800/50 backdrop-blur px-5 py-2 rounded-2xl text-sm font-bold border border-emerald-700">
              📋 Census No: {profile.censusNo}
            </span>
            <span className="bg-emerald-800/50 backdrop-blur px-5 py-2 rounded-2xl text-sm font-bold border border-emerald-700">
              🎓 Zone: {profile.schoolZone}
            </span>
          </div>
          <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
             <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                <span className="text-sm font-medium">{profile.email}</span>
             </div>
             <div className="w-1 h-1 bg-emerald-700 rounded-full"></div>
             <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.815 4.815l.773-1.548a1 1 0 011.06-.539l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                <span className="text-sm font-medium">{profile.contactNo}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Administrative Details */}
        <InfoSection title="Administration" icon="🏛️">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem label="Principal" value={profile.principalName} />
            <InfoItem label="Census Number" value={profile.censusNo} />
            <InfoItem label="Education District" value={profile.educationalDistrict} />
            <InfoItem label="School Zone" value={profile.schoolZone} />
            <InfoItem label="Nearest School" value={profile.nearestSchool} fullWidth />
          </div>
        </InfoSection>

        {/* Location & Jurisdiction */}
        <InfoSection title="Jurisdiction" icon="📍">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem label="Province" value={profile.province} />
            <InfoItem label="District" value={profile.district} />
            <InfoItem label="DS Division" value={profile.divisionalSecretariat} />
            <InfoItem label="GN Division" value={profile.gnDivision} />
            <InfoItem label="Electoral District" value={profile.electoralDistrict} />
            <InfoItem label="Coordinates" value={profile.coordinates} />
            <InfoItem label="Address" value={profile.address} fullWidth />
          </div>
        </InfoSection>

        {/* Public Service & Academic */}
        <div className="space-y-8">
           <InfoSection title="Service Points" icon="🚑">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Police Station" value={profile.policeStation} />
              <InfoItem label="Post Office" value={profile.postOffice} />
              <InfoItem label="Nearest Hospital" value={profile.hospital} fullWidth />
              <InfoItem label="Bank Branch" value={profile.bank} fullWidth />
            </div>
          </InfoSection>

          <InfoSection title="Academic Year" icon="🗓️">
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800">Current Session</span>
                <span className="text-emerald-700 font-black">{profile.academicYear}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Term 1</span>
                  <span className="text-gray-700 font-semibold">{profile.termDates.term1}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Term 2</span>
                  <span className="text-gray-700 font-semibold">{profile.termDates.term1}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Term 3</span>
                  <span className="text-gray-700 font-semibold">{profile.termDates.term1}</span>
                </div>
              </div>
            </div>
          </InfoSection>
        </div>
      </div>

      {/* Map Placeholder or Info Footer */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-gray-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
        <div className="text-center">
          <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Location Reference</p>
          <p className="text-sm font-medium italic">Located at {profile.coordinates} in {profile.district} District.</p>
        </div>
      </div>
    </div>
  );
};

export default SchoolInfo;
