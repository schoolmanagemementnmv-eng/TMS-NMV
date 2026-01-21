
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface TeacherProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedUser: User = {
      ...user,
      contact: formData.get('contact') as string,
      address: formData.get('address') as string,
      dob: formData.get('dob') as string,
      qualifications: formData.get('qualifications') as string,
    };

    storageService.saveUser(updatedUser);
    onUpdate(updatedUser);
    localStorage.setItem('logged_user', JSON.stringify(updatedUser));
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Teacher Profile</h1>
          <p className="text-gray-500">Manage your personal and professional records</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-bounce text-center">
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-32 h-32 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl text-emerald-700 border-4 border-white shadow-xl">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-emerald-600 font-medium text-sm">{user.designation}</p>
            <div className="mt-6 pt-6 border-t space-y-4">
               <div className="text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase">Employee ID</span>
                  <p className="text-sm font-mono text-gray-700">#NM-{user.id.substring(0,6).toUpperCase()}</p>
               </div>
               <div className="text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase">Service Category</span>
                  <p className="text-sm text-gray-700 font-semibold">{user.serviceType}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="space-y-8">
              {/* Professional Details Section - Read Only */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  Professional Details (System Only)
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</label>
                    <p className="bg-gray-50 px-4 py-2 rounded-lg text-gray-700 border border-gray-100 font-medium">{user.subject}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Class</label>
                    <p className="bg-gray-50 px-4 py-2 rounded-lg text-gray-700 border border-gray-100 font-medium">{user.assignedClass}</p>
                  </div>
                </div>
              </section>

              {/* Personal Details Section - Editable */}
              <section className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                    <input readOnly value={user.name} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NIC Number</label>
                    <input readOnly value={user.nic} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Number</label>
                    <input 
                      name="contact" 
                      required 
                      readOnly={!isEditing} 
                      defaultValue={user.contact} 
                      className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isEditing ? 'border-2 border-emerald-500 bg-white shadow-lg' : 'bg-gray-50 border border-gray-100'}`} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      name="dob" 
                      readOnly={!isEditing} 
                      defaultValue={user.dob} 
                      className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isEditing ? 'border-2 border-emerald-500 bg-white shadow-lg' : 'bg-gray-50 border border-gray-100'}`} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Permanent Address</label>
                    <textarea 
                      name="address" 
                      rows={2} 
                      readOnly={!isEditing} 
                      defaultValue={user.address} 
                      className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${isEditing ? 'border-2 border-emerald-500 bg-white shadow-lg' : 'bg-gray-50 border border-gray-100'}`} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Academic & Professional Qualifications</label>
                    <textarea 
                      name="qualifications" 
                      rows={3} 
                      readOnly={!isEditing} 
                      defaultValue={user.qualifications} 
                      placeholder="Degrees, Diplomas, etc."
                      className={`w-full px-4 py-3 rounded-xl outline-none transition-all resize-none ${isEditing ? 'border-2 border-emerald-500 bg-white shadow-lg' : 'bg-gray-50 border border-gray-100'}`} 
                    />
                  </div>
                </div>
              </section>

              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-xl transition-all"
                  >
                    Save Profile Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
