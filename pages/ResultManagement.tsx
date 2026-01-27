
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Exam, Student, Subject, ExamResult, User, UserRole, SchoolProfile, SubjectResult } from '../types';

interface ResultManagementProps {
  user: User;
}

const ResultManagement: React.FC<ResultManagementProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'analysis' | 'filtering'>('entry');
  const [exams, setExams] = useState<Exam[]>(storageService.getExams());
  const [students] = useState<Student[]>(storageService.getStudents());
  const [school] = useState<SchoolProfile>(storageService.getSchoolProfile());
  
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedGrade, setSelectedGrade] = useState('9');
  const [selectedClass, setSelectedClass] = useState('A');
  
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({}); 
  const [electives, setElectives] = useState<Record<string, Record<string, string>>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  const [filterThreshold, setFilterThreshold] = useState<number>(40);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  
  const [printAuditMode, setPrintAuditMode] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  useEffect(() => {
    storageService.init();
    handleLoadResults();
  }, [selectedExamId, selectedGrade, selectedClass]);

  const allGradeSubjects = useMemo(() => storageService.getSubjects(selectedGrade), [selectedGrade]);
  const coreSubjects = useMemo(() => allGradeSubjects.filter((s: any) => s.category === 'Core'), [allGradeSubjects]);
  const currentStudents = useMemo(() => students.filter(s => s.grade === selectedGrade && s.class === selectedClass), [students, selectedGrade, selectedClass]);
  const currentResults = useMemo(() => {
    const results = storageService.getResults(selectedExamId);
    return results.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return student && student.grade === selectedGrade && student.class === selectedClass;
    }).sort((a, b) => (a.classRank || 0) - (b.classRank || 0));
  }, [selectedExamId, students, selectedGrade, selectedClass]);

  const examInfo = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

  const handleLoadResults = () => {
    const existing = storageService.getResults(selectedExamId);
    const newMarks: Record<string, Record<string, number>> = {};
    const newElectives: Record<string, Record<string, string>> = {};

    existing.forEach(r => {
      if (currentStudents.some(s => s.id === r.studentId)) {
        newMarks[r.studentId] = {};
        newElectives[r.studentId] = {};
        r.results.forEach(sr => {
          newMarks[r.studentId][sr.subjectId] = sr.marks;
        });
      }
    });
    setMarks(newMarks);
    setElectives(newElectives);
  };

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    const val = value === '' ? 0 : Math.min(100, Math.max(0, parseInt(value) || 0));
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [subjectId]: val }
    }));
  };

  const handleSaveAll = () => {
    Object.entries(marks).forEach(([studentId, studentMarks]) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const subjectResults: SubjectResult[] = Object.entries(studentMarks).map(([subId, val]) => {
        const sub = allGradeSubjects.find(s => s.id === subId);
        return {
          subjectId: subId,
          subjectName: sub?.name || 'Unknown',
          marks: val,
          grade: storageService.calculateGrade(val)
        };
      });

      const examResult: ExamResult = {
        id: `${studentId}_${selectedExamId}`,
        studentId,
        studentIndexNo: student.indexNo,
        examId: selectedExamId,
        results: subjectResults,
        totalMarks: 0,
        average: 0
      };
      storageService.saveResult(examResult);
    });
    setSaveStatus("Registry Updated Successfully!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // ANALYSIS LOGIC
  const analyticsData = useMemo(() => {
    const stats: Record<string, any> = {};
    allGradeSubjects.forEach(sub => {
      const scores = currentResults.map(r => r.results.find(res => res.subjectId === sub.id)?.marks).filter(m => m !== undefined) as number[];
      if (scores.length > 0) {
        stats[sub.id] = {
          subjectName: sub.name,
          count: scores.length,
          passCount: scores.filter(s => s >= 40).length,
          failCount: scores.filter(s => s < 40).length,
          highest: Math.max(...scores),
          lowest: Math.min(...scores),
          average: scores.reduce((a, b) => a + b, 0) / scores.length
        };
      }
    });
    return stats;
  }, [currentResults, allGradeSubjects]);

  const distribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0, S: 0, W: 0 };
    currentResults.forEach(r => {
      r.results.forEach(res => {
        if (dist.hasOwnProperty(res.grade)) (dist as any)[res.grade]++;
      });
    });
    return dist;
  }, [currentResults]);

  // EXPORT LOGIC
  const exportToCSV = () => {
    let csv = "Index No,Name,Average,Rank,";
    csv += allGradeSubjects.map(s => s.name).join(",") + "\n";
    
    currentResults.forEach(r => {
      const student = students.find(s => s.id === r.studentId);
      let row = `${student?.indexNo},${student?.nameWithInitials},${r.average.toFixed(1)},${r.classRank},`;
      row += allGradeSubjects.map(s => r.results.find(res => res.subjectId === s.id)?.marks || "--").join(",");
      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Results_${selectedGrade}_${selectedClass}_${examInfo?.title}.csv`;
    a.click();
  };

  const handlePrintAudit = () => {
    setPrintAuditMode(true);
    setTimeout(() => {
      window.print();
      setPrintAuditMode(false);
    }, 500);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 1. PRINT TEMPLATE (Hidden from UI) */}
      <div id="audit-print" className={`hidden ${printAuditMode ? 'print:block' : ''} fixed inset-0 bg-white z-[9999] p-[15mm] text-black overflow-visible font-serif`}>
        <div className="text-center border-b-4 border-emerald-900 pb-8 mb-10">
          <img src={school.logoUrl} className="w-24 h-24 mx-auto mb-4" alt="School Crest" />
          <h1 className="text-3xl font-black uppercase text-emerald-900">Academic Audit Report</h1>
          <h2 className="text-xl font-bold opacity-60 uppercase tracking-widest">{school.name}</h2>
          <div className="flex justify-between mt-6 text-xs font-black uppercase tracking-tighter">
            <span>Class: {selectedGrade}-{selectedClass}</span>
            <span>Exam Cycle: {examInfo?.title}</span>
            <span>Academic Year: {school.academicYear}</span>
          </div>
        </div>

        <h3 className="text-lg font-black border-l-8 border-emerald-600 pl-4 mb-6 uppercase">I. Subject-wise Competency Analysis</h3>
        <table className="w-full border-collapse border-2 border-black text-[10px] mb-12">
           <thead className="bg-gray-100 uppercase">
             <tr>
               <th className="border-2 border-black p-2 text-left">Subject Component</th>
               <th className="border-2 border-black p-2 text-center">Appeared</th>
               <th className="border-2 border-black p-2 text-center">Pass Rate</th>
               <th className="border-2 border-black p-2 text-center">Highest</th>
               <th className="border-2 border-black p-2 text-center">Lowest</th>
               <th className="border-2 border-black p-2 text-center bg-emerald-50">Class Average</th>
             </tr>
           </thead>
           <tbody>
             {Object.values(analyticsData).map((data: any) => (
               <tr key={data.subjectName}>
                 <td className="border-2 border-black p-2 font-black">{data.subjectName}</td>
                 <td className="border-2 border-black p-2 text-center">{data.count}</td>
                 <td className="border-2 border-black p-2 text-center font-bold">
                   {((data.passCount/data.count)*100).toFixed(1)}%
                 </td>
                 <td className="border-2 border-black p-2 text-center">{data.highest}</td>
                 <td className="border-2 border-black p-2 text-center">{data.lowest}</td>
                 <td className="border-2 border-black p-2 text-center font-black bg-emerald-50 text-emerald-900">
                   {data.average.toFixed(1)}
                 </td>
               </tr>
             ))}
           </tbody>
        </table>

        <h3 className="text-lg font-black border-l-8 border-emerald-600 pl-4 mb-6 uppercase">II. Merit Distribution Overview</h3>
        <div className="grid grid-cols-5 gap-4 mb-12">
           {Object.entries(distribution).map(([grade, count]) => (
             <div key={grade} className="border-2 border-black p-4 text-center">
               <div className="text-3xl font-black">{grade}</div>
               <div className="text-[10px] font-bold text-gray-500 uppercase">Frequency: {count}</div>
             </div>
           ))}
        </div>

        <div className="mt-auto border-t-2 border-gray-100 pt-10 grid grid-cols-2 gap-20">
           <div className="text-center border-t-2 border-black pt-2 font-black text-xs uppercase">Internal Auditor</div>
           <div className="text-center border-t-2 border-black pt-2 font-black text-xs uppercase">Principal's Endorsement</div>
        </div>
      </div>

      {/* 2. MAIN WEB UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Merit Intelligence Module</h1>
          <p className="text-gray-500 font-medium italic">Integrated Academic Records & Performance Analytics</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportToCSV} className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-200 transition-all border border-emerald-200 shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" /></svg>
            Excel Export
          </button>
          <button onClick={handlePrintAudit} className="bg-emerald-950 text-emerald-400 px-6 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-2 border border-emerald-900 shadow-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Audit PDF
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-[32px] shadow-sm border border-gray-100 inline-flex gap-2 print:hidden">
        {[
          { id: 'entry', label: 'Merit Entry', icon: '📝' },
          { id: 'analysis', label: 'Class Analytics', icon: '📊' },
          { id: 'filtering', label: 'Targeted Filtering', icon: '🔍' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Selectors */}
      <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 print:hidden ring-1 ring-gray-50">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Target Evaluation</label>
          <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-800 focus:ring-2 focus:ring-emerald-500">
            {exams.map(e => <option key={e.id} value={e.id}>{e.title} ({e.year})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Class Grade</label>
          <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-800">
            {[...Array(11)].map((_, i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Section</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-800">
            {['A', 'B', 'C'].map(c => <option key={c} value={c}>Section {c}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT VIEWS */}
      <div className="print:hidden">
        {activeTab === 'entry' && (
          <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-100">
                 <thead className="bg-emerald-950 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-10 py-8 text-left sticky left-0 bg-emerald-950 z-10 w-64">Candidate Profile</th>
                     {coreSubjects.map(s => <th key={s.id} className="px-4 py-8 text-center">{s.name}</th>)}
                     <th className="px-10 py-8 text-right bg-emerald-900 text-white">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {currentStudents.map(s => (
                     <tr key={s.id} className="hover:bg-emerald-50/40 transition-colors group">
                       <td className="px-10 py-6 sticky left-0 bg-white group-hover:bg-emerald-50/40 z-10 border-r border-emerald-50">
                          <div className="font-black text-emerald-800 text-[10px] tracking-widest">#{s.indexNo}</div>
                          <div className="font-black text-gray-900 text-base uppercase truncate max-w-[200px]">{s.nameWithInitials}</div>
                       </td>
                       {coreSubjects.map(sub => (
                         <td key={sub.id} className="px-4 py-6 text-center">
                            <input 
                              type="number"
                              value={marks[s.id]?.[sub.id] || ''}
                              onChange={(e) => handleMarkChange(s.id, sub.id, e.target.value)}
                              className={`w-16 h-12 bg-gray-50 border-2 rounded-xl text-center font-black text-lg focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none ${ (marks[s.id]?.[sub.id] || 0) < 40 ? 'border-red-100 text-red-600' : 'border-transparent text-gray-900'}`}
                            />
                         </td>
                       ))}
                       <td className="px-10 py-6 text-right">
                          <button onClick={handleSaveAll} className="bg-emerald-100 text-emerald-700 p-3 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="p-10 flex justify-end bg-gray-50/50">
               <button onClick={handleSaveAll} className="bg-emerald-950 text-emerald-400 px-12 py-5 rounded-[28px] font-black text-xl shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1">
                 Commit Evaluation Results
               </button>
             </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.values(analyticsData).map((data: any) => (
                  <div key={data.subjectName} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow border-t-8 border-emerald-600">
                     <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">{data.subjectName}</h3>
                     <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Average</p>
                           <p className="text-3xl font-black text-emerald-900">{data.average.toFixed(1)}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pass Rate</p>
                           <p className="text-3xl font-black text-emerald-600">{((data.passCount/data.count)*100).toFixed(0)}%</p>
                        </div>
                        <div className="col-span-2 h-px bg-gray-50 my-2"></div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">High Score</p>
                           <p className="text-xl font-black text-gray-900">{data.highest}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Low Score</p>
                           <p className="text-xl font-black text-red-600">{data.lowest}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'filtering' && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-300">
             <div className="bg-emerald-950 p-10 rounded-[48px] shadow-2xl text-white">
                <div className="flex flex-col md:flex-row gap-10 items-end">
                   <div className="flex-1">
                      <label className="block text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Criterion Subject</label>
                      <select value={filterSubjectId} onChange={e => setFilterSubjectId(e.target.value)} className="w-full bg-emerald-900 border-0 rounded-2xl px-6 py-4 font-black text-white focus:ring-2 focus:ring-emerald-500">
                         <option value="all">Aggregate All Subjects</option>
                         {allGradeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                   </div>
                   <div className="w-48">
                      <label className="block text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Score Threshold</label>
                      <input 
                        type="number" 
                        value={filterThreshold} 
                        onChange={e => setFilterThreshold(parseInt(e.target.value))} 
                        className="w-full bg-emerald-900 border-0 rounded-2xl px-6 py-4 font-black text-white" 
                      />
                   </div>
                   <div className="flex-1">
                      <p className="text-emerald-300 font-medium italic text-sm mb-4">Filtering will identify all students with a score <span className="text-white font-black underline">less than {filterThreshold}</span> in the selected context.</p>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                   <thead className="bg-gray-50 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-10 py-6 text-left">Candidate Name</th>
                         <th className="px-10 py-6 text-center">Identified Score</th>
                         <th className="px-10 py-6 text-center">Class Rank</th>
                         <th className="px-10 py-6 text-right">Performance Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {currentResults.filter(r => {
                         if (filterSubjectId === 'all') return r.results.some(res => res.marks < filterThreshold);
                         const score = r.results.find(res => res.subjectId === filterSubjectId)?.marks;
                         return score !== undefined && score < filterThreshold;
                      }).map(r => {
                         const student = students.find(s => s.id === r.studentId);
                         const targetScore = filterSubjectId === 'all' ? r.results.find(res => res.marks < filterThreshold)?.marks : r.results.find(res => res.subjectId === filterSubjectId)?.marks;
                         return (
                           <tr key={r.id} className="hover:bg-red-50/20 transition-colors">
                              <td className="px-10 py-5 font-black uppercase text-gray-900">{student?.nameWithInitials}</td>
                              <td className="px-10 py-5 text-center">
                                 <span className="bg-red-100 text-red-700 px-5 py-2 rounded-xl font-black text-lg shadow-sm border border-red-200">
                                    {targetScore}
                                 </span>
                              </td>
                              <td className="px-10 py-5 text-center font-bold text-gray-500">#{r.classRank}</td>
                              <td className="px-10 py-5 text-right">
                                 <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">Action Required</span>
                              </td>
                           </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {saveStatus && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-10 py-5 rounded-[32px] font-black text-lg shadow-2xl shadow-emerald-900/40 animate-in slide-in-from-bottom-10 duration-500">
           {saveStatus}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #audit-print, #audit-print * { visibility: visible; }
          #audit-print { position: fixed; left: 0; top: 0; width: 100%; margin: 0; padding: 15mm; }
          @page { size: A4 portrait; margin: 0; }
        }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default ResultManagement;
