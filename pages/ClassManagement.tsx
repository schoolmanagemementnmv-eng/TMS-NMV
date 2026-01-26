
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User, Student } from '../types';

interface ClassManagementProps {
  user: User;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ user }) => {
  // Correctly passing teacherId to storageService
  const [students, setStudents] = useState<Student[]>(storageService.getStudents(user.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Updated student object to satisfy required fields and fix 'name' property error
    const newStudent: Student = {
      id: editingStudent?.id || Math.random().toString(36).substr(2, 9),
      indexNo: editingStudent?.indexNo || 'N/A',
      nameWithInitials: formData.get('name') as string,
      fullName: editingStudent?.fullName || formData.get('name') as string,
      dob: editingStudent?.dob || '2000-01-01',
      grade: formData.get('grade') as string,
      class: formData.get('class') as string,
      teacherId: user.id
    };
    storageService.saveStudent(newStudent);
    // Correctly passing teacherId to storageService
    setStudents(storageService.getStudents(user.id));
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management ({user.assignedClass})</h1>
          <p className="text-gray-500">Manage student records for your assigned class</p>
        </div>
        <button 
          onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-emerald-700 transition-colors"
        >
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Grade & Class</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-500 uppercase">#{s.id.substring(0, 5)}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{s.nameWithInitials}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.grade}-{s.class}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setEditingStudent(s); setIsModalOpen(true); }}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No students assigned to your record yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
             <div className="p-6 border-b">
                <h2 className="text-lg font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
             </div>
             <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input name="name" required defaultValue={editingStudent?.nameWithInitials} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <input name="grade" required defaultValue={editingStudent?.grade || user.assignedClass.split(' ')[1]?.split('-')[0]} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <input name="class" required defaultValue={editingStudent?.class || user.assignedClass.split('-')[1]} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-medium">Cancel</button>
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Save Student</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
