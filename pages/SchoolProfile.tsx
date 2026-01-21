
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { SchoolProfile } from '../types';

const SchoolProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile>(storageService.getSchoolProfile());
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: SchoolProfile = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      academicYear: formData.get('academicYear') as string,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Profile Management</h1>
        <p className="text-gray-500">Global settings for A/Nikawewa Muslim Vidyalaya</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-emerald-800 border-b pb-2">Institution Details</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">School Name</label>
                <input name="name" required defaultValue={profile.name} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                <textarea name="address" rows={3} defaultValue={profile.address} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Current Academic Year</label>
                <input name="academicYear" required defaultValue={profile.academicYear} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-emerald-800 border-b pb-2">Term Dates Configuration</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Term 1 (Primary)</label>
                <input name="term1" required defaultValue={profile.termDates.term1} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="YYYY-MM-DD to YYYY-MM-DD" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Term 2</label>
                <input name="term2" required defaultValue={profile.termDates.term2} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Term 3</label>
                <input name="term3" required defaultValue={profile.termDates.term3} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            {isSaved ? (
              <span className="text-emerald-600 font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Settings saved successfully!
              </span>
            ) : <span />}
            <button type="submit" className="bg-emerald-800 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-900 transition-all">
              Update School Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolProfilePage;
