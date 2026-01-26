
import React, { useState, useRef } from 'react';
import { storageService } from '../services/storageService';
import { SchoolProfile } from '../types';

const SchoolProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile>(storageService.getSchoolProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [tempLogo, setTempLogo] = useState<string | undefined>(profile.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updated: SchoolProfile = {
      name: formData.get('name') as string,
      fullName: formData.get('fullName') as string,
      address: formData.get('address') as string,
      academicYear: formData.get('academicYear') as string,
      contactNo: formData.get('contactNo') as string,
      email: formData.get('email') as string,
      logoUrl: tempLogo,
      establishmentDate: formData.get('establishmentDate') as string,
      censusNo: formData.get('censusNo') as string,
      principalName: formData.get('principalName') as string,
      educationalDistrict: formData.get('educationalDistrict') as string,
      schoolZone: formData.get('schoolZone') as string,
      nearestSchool: formData.get('nearestSchool') as string,
      district: formData.get('district') as string,
      province: formData.get('province') as string,
      divisionalSecretariat: formData.get('divisionalSecretariat') as string,
      gnDivision: formData.get('gnDivision') as string,
      electoralDistrict: formData.get('electoralDistrict') as string,
      policeStation: formData.get('policeStation') as string,
      postOffice: formData.get('postOffice') as string,
      telegraphicOffice: formData.get('telegraphicOffice') as string,
      hospital: formData.get('hospital') as string,
      bank: formData.get('bank') as string,
      coordinates: formData.get('coordinates') as string,
      termDates: {
        term1: formData.get('term1') as string,
        term2: formData.get('term2') as string,
        term3: formData.get('term3') as string,
      }
    };
    
    storageService.updateSchoolProfile(updated);
    setProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Profile Management</h1>
          <p className="text-gray-500">Institutional information and global system settings</p>
        </div>
        {isSaved && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            System Updated
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section: Logo Upload & Main ID */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="relative group">
            <div className="w-40 h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {tempLogo ? (
                <img src={tempLogo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="mt-2 block text-xs font-semibold text-gray-500 uppercase">No Logo</span>
                </div>
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
              title="Upload New Logo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Official Name (Display)</label>
              <input name="name" required defaultValue={profile.name} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Legal Name</label>
              <input name="fullName" required defaultValue={profile.fullName} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1: Administrative Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Administrative Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Establishment Date</label>
                  <input type="date" name="establishmentDate" required defaultValue={profile.establishmentDate} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">School Census No</label>
                  <input name="censusNo" required defaultValue={profile.censusNo} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Principal Name</label>
                  <input name="principalName" required defaultValue={profile.principalName} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Educational District</label>
                  <input name="educationalDistrict" required defaultValue={profile.educationalDistrict} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">School Zone</label>
                  <input name="schoolZone" required defaultValue={profile.schoolZone} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nearest School</label>
                  <input name="nearestSchool" required defaultValue={profile.nearestSchool} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Location & Area Jurisdiction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Province</label>
                  <input name="province" required defaultValue={profile.province} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">District</label>
                  <input name="district" required defaultValue={profile.district} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Divisional Secretariat</label>
                  <input name="divisionalSecretariat" required defaultValue={profile.divisionalSecretariat} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">GN Division</label>
                  <input name="gnDivision" required defaultValue={profile.gnDivision} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Electoral District</label>
                  <input name="electoralDistrict" required defaultValue={profile.electoralDistrict} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Coordinates (Lat, Long)</label>
                  <input name="coordinates" required defaultValue={profile.coordinates} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Postal Address</label>
                  <textarea name="address" required rows={2} defaultValue={profile.address} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Public Services */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Contact Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Official Email</label>
                  <input type="email" name="email" required defaultValue={profile.email} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact Number</label>
                  <input name="contactNo" required defaultValue={profile.contactNo} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Academic Year</label>
                  <input name="academicYear" required defaultValue={profile.academicYear} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Public Service Points
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Police Station</label>
                  <input name="policeStation" required defaultValue={profile.policeStation} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Post Office</label>
                  <input name="postOffice" required defaultValue={profile.postOffice} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nearest Hospital</label>
                  <input name="hospital" required defaultValue={profile.hospital} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Official Bank</label>
                  <input name="bank" required defaultValue={profile.bank} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Term Dates Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-emerald-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Term Dates Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Term 1</label>
                <input name="term1" required defaultValue={profile.termDates.term1} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Term 2</label>
                <input name="term2" required defaultValue={profile.termDates.term2} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Term 3</label>
                <input name="term3" required defaultValue={profile.termDates.term3} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
           <button type="submit" className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all">
              Update Global School Profile
           </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolProfilePage;
