
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { LeaveRequest, LeaveStatus } from '../types';

const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(storageService.getLeaves());
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setLeaves(storageService.getLeaves());
  }, []);

  const handleAction = (id: string, status: LeaveStatus) => {
    storageService.updateLeaveStatus(id, status);
    setLeaves(storageService.getLeaves());
  };

  const generateAiReport = async () => {
    setLoadingAi(true);
    try {
      const summary = await geminiService.summarizeLeaveReport(leaves);
      setAiSummary(summary || "Unable to generate summary at this time.");
    } catch (e) {
      setAiSummary("Error generating summary.");
    } finally {
      setLoadingAi(false);
    }
  };

  const getStatusStyle = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED: return 'bg-emerald-100 text-emerald-700';
      case LeaveStatus.REJECTED: return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Review and approve teacher leave requests</p>
        </div>
        <button 
          onClick={generateAiReport}
          disabled={loadingAi}
          className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg font-medium hover:bg-emerald-100 transition-all disabled:opacity-50"
        >
          {loadingAi ? 'Analyzing...' : '✨ Generate AI Summary'}
        </button>
      </div>

      {aiSummary && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl relative">
          <button onClick={() => setAiSummary(null)} className="absolute top-2 right-2 text-emerald-500 hover:text-emerald-700">×</button>
          <p className="text-emerald-900 text-sm leading-relaxed italic">
            <strong>AI Insight:</strong> {aiSummary}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Teacher</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {leaves.length > 0 ? leaves.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{l.teacherName}</td>
                  <td className="px-6 py-4">{l.type}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{l.startDate}</div>
                    <div className="text-gray-500 text-xs">to {l.endDate}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{l.reason}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {l.status === LeaveStatus.PENDING ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(l.id, LeaveStatus.APPROVED)}
                          className="bg-emerald-600 text-white px-3 py-1 rounded-md text-xs hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(l.id, LeaveStatus.REJECTED)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Processed</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
