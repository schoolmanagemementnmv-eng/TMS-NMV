
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Exam, Student, Subject, ExamResult, User, UserRole, SchoolProfile, SubjectResult } from '../types';

interface ResultManagementProps {
  user: User;
}

const ResultManagement: React.FC<ResultManagementProps> = ({ user }) => {
  const [exams, setExams] = useState<Exam[]>(storageService.getExams());
  const [students] = useState<Student[]>(storageService.getStudents());
  const [school] = useState<SchoolProfile>(storageService.getSchoolProfile());
  
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedGrade, setSelectedGrade] = useState('9');
  const [selectedClass, setSelectedClass] = useState('A');
  
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({}); 
  const [electives, setElectives] = useState<Record<string, Record<string, string>>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [printStudentId, setPrintStudentId] = useState<string | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [printClassMode, setPrintClassMode] = useState(false);
  const [printBatchMode, setPrintBatchMode] = useState(false);
  const [showExamManager, setShowExamManager] = useState(false);

  // Sync printing classes for orientation
  useEffect(() => {
    if (printClassMode) {
      document.body.classList.add('print-class-active');
    } else {
      document.body.classList.remove('print-class-active');
    }
    if (printBatchMode) {
      document.body.classList.add('print-batch-active');
    } else {
      document.body.classList.remove('print-batch-active');
    }
  }, [printClassMode, printBatchMode]);

  const isSenior = useMemo(() => parseInt(selectedGrade) >= 10, [selectedGrade]);
  const allGradeSubjects = useMemo(() => storageService.getSubjects(selectedGrade), [selectedGrade]);
  
  const coreSubjects = useMemo(() => allGradeSubjects.filter((s: any) => s.category === 'Core'), [allGradeSubjects]);
  const cat1Options = useMemo(() => allGradeSubjects.filter((s: any) => s.category === 'Category 1'), [allGradeSubjects]);
  const cat2Options = useMemo(() => allGradeSubjects.filter((s: any) => s.category === 'Category 2'), [allGradeSubjects]);
  const cat3Options = useMemo(() => allGradeSubjects.filter((s: any) => s.category === 'Category 3'), [allGradeSubjects]);

  const currentStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && s.class === selectedClass);
  }, [students, selectedGrade, selectedClass]);

  const currentResults = useMemo(() => {
    const results = storageService.getResults(selectedExamId);
    return results.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return student && student.grade === selectedGrade && student.class === selectedClass;
    }).sort((a, b) => (a.classRank || 0) - (b.classRank || 0));
  }, [selectedExamId, students, selectedGrade, selectedClass]);

  const handleLoadResults = () => {
    const existing = storageService.getResults(selectedExamId);
    const newMarks: Record<string, Record<string, number>> = {};
    const newElectives: Record<string, Record<string, string>> = {};

    existing.forEach(r => {
      newMarks[r.studentId] = {};
      newElectives[r.studentId] = {};
      r.results.forEach(sr => {
        const sub = allGradeSubjects.find(s => s.id === sr.subjectId);
        if (sub && (sub as any).category?.startsWith('Category')) {
           newElectives[r.studentId][(sub as any).category] = sub.id;
        }
        newMarks[r.studentId][sr.subjectId] = sr.marks;
      });
    });
    setMarks(newMarks);
    setElectives(newElectives);
  };

  const handleAddExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      title: fd.get('title') as string,
      year: fd.get('year') as string,
      term: fd.get('term') as string
    };
    storageService.saveExam(newExam);
    const updated = storageService.getExams();
    setExams(updated);
    setSelectedExamId(newExam.id);
    setShowExamManager(false);
  };

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [subjectId]: numValue }
    }));
  };

  const handleElectiveChange = (studentId: string, cat: string, subjectId: string) => {
    setElectives(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [cat]: subjectId }
    }));
  };

  const handleSaveAll = () => {
    Object.entries(marks).forEach(([studentId, studentMarks]) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const subjectResults: SubjectResult[] = [];
      
      coreSubjects.forEach(cs => {
        if (studentMarks[cs.id] !== undefined) {
          subjectResults.push({
            subjectId: cs.id,
            subjectName: cs.name,
            marks: studentMarks[cs.id],
            grade: storageService.calculateGrade(studentMarks[cs.id])
          });
        }
      });

      if (isSenior) {
        ['Category 1', 'Category 2', 'Category 3'].forEach(cat => {
          const subId = electives[studentId]?.[cat];
          const sub = allGradeSubjects.find(s => s.id === subId);
          if (sub && studentMarks[subId] !== undefined) {
            subjectResults.push({
              subjectId: subId,
              subjectName: sub.name,
              marks: studentMarks[subId],
              grade: storageService.calculateGrade(studentMarks[subId])
            });
          }
        });
      }

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

    setSaveStatus("Results Published & Ranks Calculated!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handlePrintIndividual = (studentId: string) => {
    setPrintStudentId(studentId);
    setPrintClassMode(false);
    setPrintBatchMode(false);
    setTimeout(() => {
      window.print();
      setPrintStudentId(null);
    }, 250);
  };

  const handlePrintClassReport = () => {
    setPrintClassMode(true);
    setPrintBatchMode(false);
    setPrintStudentId(null);
    setTimeout(() => {
      window.print();
      setPrintClassMode(false);
    }, 250);
  };

  const handlePrintBatchIndividual = () => {
    setPrintBatchMode(true);
    setPrintClassMode(false);
    setPrintStudentId(null);
    setTimeout(() => {
      window.print();
      setPrintBatchMode(false);
    }, 250);
  };

  const reportData = (studentId: string | null) => {
    if (!studentId) return null;
    const student = students.find(s => s.id === studentId);
    const results = storageService.getResults(selectedExamId);
    const result = results.find(r => r.studentId === studentId);
    const exam = exams.find(e => e.id === selectedExamId);
    
    const passes = { A: 0, B: 0, C: 0, S: 0, W: 0 };
    result?.results.forEach(r => {
      if (passes.hasOwnProperty(r.grade)) {
        (passes as any)[r.grade]++;
      } else {
        passes.W++;
      }
    });

    return { student, result, exam, passes };
  };

  const printIndividualData = useMemo(() => reportData(printStudentId), [printStudentId, students, selectedExamId, exams]);
  const viewIndividualData = useMemo(() => reportData(viewingStudentId), [viewingStudentId, students, selectedExamId, exams]);
  
  const batchData = useMemo(() => {
    return currentStudents.map(s => reportData(s.id)).filter(d => !!d);
  }, [currentStudents, selectedExamId, exams]);

  const classSummary = useMemo(() => {
    const summary = { A: 0, B: 0, C: 0, S: 0, W: 0, total: 0 };
    currentResults.forEach(r => {
      r.results.forEach(res => {
        if (summary.hasOwnProperty(res.grade)) {
          (summary as any)[res.grade]++;
          summary.total++;
        }
      });
    });
    return summary;
  }, [currentResults]);

  const examInfo = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

  // Fix: Explicitly typed ReportCardLayout as a React.FC to resolve TypeScript error where the 'key' prop was considered missing from the component's expected properties during list rendering.
  const ReportCardLayout: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return null;
    const { student, result, exam, passes } = data;
    const isGCE = parseInt(student?.grade) >= 10;
    
    return (
      <div className="w-[210mm] min-h-[297mm] mx-auto p-[15mm] bg-white border-2 border-black font-sans text-black relative flex flex-col page-break-after-always">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src={school.logoUrl} className="w-24 h-24 object-contain mb-4" alt="Logo" />
          <h1 className="text-4xl font-black text-black uppercase mb-1 tracking-tighter">A/NIKAWEWA MUSLIM VIDYALAYA</h1>
          <p className="text-lg font-bold uppercase tracking-widest mb-2">NIKAWEWA, HOROWPOTHANA</p>
          <div className="grid grid-cols-3 w-full text-[11px] font-black border-y-2 border-black py-2 mt-2 bg-[#ffedd5]">
            <span>Tel : {school.contactNo}</span>
            <span>Census: {school.censusNo}</span>
            <span>Email: {school.email}</span>
          </div>
        </div>

        {/* Exam Title Blocks */}
        <div className="bg-[#b4dce5] text-center py-4 border-x border-t border-black">
          <h2 className="text-2xl font-black uppercase tracking-widest">
            {isGCE ? 'G.C.E O/L EXAMINATION' : 'YEARLY EVALUATION'} – {exam?.year}
          </h2>
        </div>
        <div className="bg-[#b1a2c7] text-center py-2 border border-black mb-6">
          <h3 className="text-lg font-black uppercase tracking-tight">RESULTS SCHEDULE</h3>
        </div>

        {/* Student Information Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border-2 border-black text-sm">
            <tbody>
              <tr>
                <td className="border-2 border-black px-6 py-3 font-black uppercase bg-gray-50 w-52">FULL NAME</td>
                <td className="border-2 border-black px-6 py-3 font-black uppercase text-base">{student?.fullName || student?.nameWithInitials}</td>
              </tr>
              <tr>
                <td className="border-2 border-black px-6 py-3 font-black uppercase bg-gray-50">CENTRE NO</td>
                <td className="border-2 border-black px-6 py-3 font-black">19519</td>
              </tr>
              <tr>
                <td className="border-2 border-black px-6 py-3 font-black uppercase bg-gray-50">YEAR</td>
                <td className="border-2 border-black px-6 py-3 font-black">{exam?.year}</td>
              </tr>
              <tr>
                <td className="border-2 border-black px-6 py-3 font-black uppercase bg-gray-50">INDEX NO</td>
                <td className="border-2 border-black px-6 py-3 font-black text-2xl tracking-tighter">{student?.indexNo}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Results Data Table */}
        <div className="mb-10 flex-grow">
          <table className="w-full border-collapse border-2 border-black text-sm">
            <thead className="bg-gray-100">
              <tr className="h-14">
                <th className="border-2 border-black px-8 py-3 text-left font-black uppercase tracking-widest">SUBJECT</th>
                <th className="border-2 border-black px-6 py-3 text-center font-black uppercase tracking-widest w-40">MEDIUM</th>
                <th className="border-2 border-black px-6 py-3 text-center font-black uppercase tracking-widest w-40">GRADE</th>
              </tr>
            </thead>
            <tbody>
              {result?.results.map((r: any) => (
                <tr key={r.subjectId} className="h-12">
                  <td className="border-2 border-black px-8 py-3 font-black uppercase">{r.subjectName}</td>
                  <td className="border-2 border-black px-6 py-3 text-center font-bold uppercase tracking-tighter">TAMIL</td>
                  <td className="border-2 border-black px-6 py-3 text-center font-black text-2xl">{isGCE ? r.grade : r.marks}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 9 - (result?.results?.length || 0)) }).map((_, i) => (
                <tr key={`filler-${i}`} className="h-12">
                  <td className="border-2 border-black px-8 py-3">&nbsp;</td>
                  <td className="border-2 border-black px-6 py-3 text-center font-bold uppercase tracking-tighter">TAMIL</td>
                  <td className="border-2 border-black px-6 py-3 text-center">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Statistics and Distribution Section */}
        <div className="grid grid-cols-2 gap-10 items-end mt-4 mb-20">
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 border-2 border-black inline-block rounded-2xl">
                 <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Performance Summary</p>
                 <div className="flex gap-6">
                   <div className="text-center">
                     <p className="text-xs font-bold uppercase text-gray-400">Total</p>
                     <p className="text-2xl font-black text-black">{result?.totalMarks}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-xs font-bold uppercase text-gray-400">Avg %</p>
                     <p className="text-2xl font-black text-emerald-700">{result?.average.toFixed(1)}%</p>
                   </div>
                   <div className="text-center">
                     <p className="text-xs font-bold uppercase text-gray-400">Rank</p>
                     <p className="text-2xl font-black text-orange-700">{result?.classRank || '-'}</p>
                   </div>
                 </div>
               </div>
               {isGCE && (
                 <div className="font-black text-xs uppercase tracking-widest text-emerald-900 bg-emerald-50 px-4 py-2 rounded-xl inline-block border border-emerald-100">
                   Result Summary: {passes.A}A {passes.B}B {passes.C}C {passes.S}S
                 </div>
               )}
            </div>

            <div className="flex justify-end">
              <table className="border-collapse border-2 border-black text-[11px] w-full max-w-[320px]">
                <thead className="bg-gray-100">
                  <tr className="h-8">
                    <th colSpan={4} className="border-2 border-black p-1 font-black uppercase">PASSES</th>
                    <th rowSpan={2} className="border-2 border-black p-1 font-black uppercase w-16">TOTAL</th>
                  </tr>
                  <tr className="bg-gray-100 h-8">
                    <th className="border-2 border-black p-1 w-12">A</th>
                    <th className="border-2 border-black p-1 w-12">B</th>
                    <th className="border-2 border-black p-1 w-12">C</th>
                    <th className="border-2 border-black p-1 w-12">S</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-14 text-center font-black text-2xl">
                    <td className="border-2 border-black">{passes.A || '-'}</td>
                    <td className="border-2 border-black">{passes.B || '-'}</td>
                    <td className="border-2 border-black">{passes.C || '-'}</td>
                    <td className="border-2 border-black">{passes.S || '-'}</td>
                    <td className="border-2 border-black bg-gray-50">{result?.results?.length || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>

        {/* Signatures */}
        <div className="mt-auto">
          <div className="grid grid-cols-2 gap-x-24 gap-y-16">
            <div className="text-[11px] space-y-10">
              <p className="font-black uppercase tracking-tight">PREPARED BY: N.M. ASARUDEEN (SLTS)</p>
              <p className="font-black uppercase tracking-tight">CHECKED BY: ......................................................</p>
            </div>
            <div className="text-[11px] text-right space-y-10 flex flex-col items-end">
              <div className="text-center w-64">
                <div className="border-t-2 border-black pt-2">
                  <p className="font-black uppercase tracking-widest text-base">PRINCIPAL</p>
                </div>
              </div>
              <div className="w-full">
                <p className="font-black uppercase tracking-tight">DATE: ................................................................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. INDIVIDUAL STUDENT REPORT (Print Only) */}
      <div id="report-card-print" className="hidden print:block fixed inset-0 bg-white p-0 text-black overflow-visible">
        {printIndividualData && !printClassMode && !printBatchMode && <ReportCardLayout data={printIndividualData} />}
      </div>

      {/* 2. BATCH PRINT INDIVIDUAL REPORTS (Print Only) */}
      <div id="batch-report-print" className="hidden print:block fixed inset-0 bg-white p-0 text-black overflow-visible">
        {printBatchMode && batchData.map((data, idx) => (
          <ReportCardLayout key={idx} data={data} />
        ))}
      </div>

      {/* 3. MASTER RESULTS SCHEDULE (Print Only) */}
      <div id="class-report-print" className="hidden print:block fixed inset-0 bg-white p-0 text-black overflow-visible">
        {printClassMode && (
          <div className="w-[297mm] min-h-[210mm] mx-auto p-[15mm] bg-white border-2 border-black relative flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
              <div className="flex items-center gap-6">
                <img src={school.logoUrl} className="w-24 h-24 object-contain" alt="Logo" />
                <div>
                  <h1 className="text-4xl font-black text-black uppercase tracking-tighter">A/NIKAWEWA MUSLIM VIDYALAYA</h1>
                  <p className="text-lg font-bold text-gray-700 tracking-widest uppercase">NIKAWEWA, HOROWPOTHANA</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tight">MASTER RESULTS SCHEDULE</h2>
                <div className="text-base font-bold text-emerald-900 bg-emerald-50 px-4 py-2 rounded-xl inline-block mt-3 border border-emerald-100">
                  {examInfo?.title} ({examInfo?.year}) | GRADE: {selectedGrade}-{selectedClass}
                </div>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-black text-[10px]">
              <thead>
                <tr className="bg-gray-100 font-black h-12 uppercase tracking-widest">
                  <th className="border-2 border-black px-2 py-2 text-center w-12">RNK</th>
                  <th className="border-2 border-black px-2 py-2 text-left w-28">INDEX NO</th>
                  <th className="border-2 border-black px-4 py-2 text-left">STUDENT NAME</th>
                  {coreSubjects.map(s => <th key={s.id} className="border-2 border-black px-1 py-2 text-center min-w-[55px] text-[9px]">{s.name.toUpperCase()}</th>)}
                  <th className="border-2 border-black px-2 py-2 text-center w-16 bg-gray-50">TOTAL</th>
                  <th className="border-2 border-black px-2 py-2 text-center w-16 bg-gray-50">AVG %</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((r, idx) => {
                  const student = students.find(s => s.id === r.studentId);
                  return (
                    <tr key={r.id} className="h-10 hover:bg-gray-50">
                      <td className="border-2 border-black px-2 py-1 font-black text-center text-sm">{r.classRank || idx + 1}</td>
                      <td className="border-2 border-black px-2 py-1 font-black text-base tracking-tighter">{student?.indexNo}</td>
                      <td className="border-2 border-black px-4 py-1 font-black uppercase text-xs truncate max-w-[200px]">{student?.nameWithInitials}</td>
                      {coreSubjects.map(sub => {
                        const score = r.results.find(res => res.subjectId === sub.id);
                        return (
                          <td key={sub.id} className="border-2 border-black px-1 py-1 text-center">
                            <div className="font-black text-sm">{score?.marks || '--'}</div>
                            <div className="text-[9px] font-black text-emerald-800">{score?.grade || ''}</div>
                          </td>
                        );
                      })}
                      <td className="border-2 border-black px-2 py-1 text-center font-black bg-gray-50 text-base">{r.totalMarks}</td>
                      <td className="border-2 border-black px-2 py-1 text-center font-black bg-gray-50 text-emerald-900 text-base">{r.average.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-10 grid grid-cols-4 gap-10">
               <div className="col-span-2">
                  <table className="w-full border-collapse border-2 border-black text-[11px] font-black">
                     <thead>
                        <tr className="bg-gray-100 uppercase h-8">
                           <th colSpan={6} className="border-2 border-black">CLASS PERFORMANCE DISTRIBUTION</th>
                        </tr>
                        <tr className="bg-gray-50 h-8">
                           <th className="border-2 border-black w-1/6">A</th>
                           <th className="border-2 border-black w-1/6">B</th>
                           <th className="border-2 border-black w-1/6">C</th>
                           <th className="border-2 border-black w-1/6">S</th>
                           <th className="border-2 border-black w-1/6">W</th>
                           <th className="border-2 border-black w-1/6">TOTAL</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="h-12 text-center text-xl">
                           <td className="border-2 border-black">{classSummary.A}</td>
                           <td className="border-2 border-black">{classSummary.B}</td>
                           <td className="border-2 border-black">{classSummary.C}</td>
                           <td className="border-2 border-black">{classSummary.S}</td>
                           <td className="border-2 border-black">{classSummary.W}</td>
                           <td className="border-2 border-black bg-gray-50">{classSummary.total}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               
               <div className="col-span-2 flex justify-between items-end px-10 text-xs font-black pb-4">
                  <div className="text-center w-52 border-t-2 border-black pt-2">
                    <p className="uppercase tracking-widest">CLASS TEACHER</p>
                  </div>
                  <div className="text-center w-52 border-t-2 border-black pt-2">
                    <p className="uppercase tracking-widest text-base">PRINCIPAL</p>
                  </div>
               </div>
            </div>
            
            <div className="mt-4 text-[10px] font-bold text-gray-400 italic">
               A/Nikawewa Academic Records System © {new Date().getFullYear()}
            </div>
          </div>
        )}
      </div>

      {/* 4. WEB PREVIEW MODAL */}
      {viewingStudentId && viewIndividualData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-[240mm] max-h-[95vh] overflow-y-auto rounded-[60px] shadow-2xl flex flex-col p-10 custom-scrollbar relative">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Student Academic Passport</h3>
                    <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest opacity-60 italic">Official Result Schedule Format</p>
                 </div>
                 <button 
                  onClick={() => setViewingStudentId(null)}
                  className="bg-emerald-50 text-emerald-600 hover:text-red-600 w-14 h-14 rounded-3xl shadow-lg flex items-center justify-center transition-all z-10 hover:bg-red-50"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="transform scale-[0.95] origin-top md:scale-100 mb-8 border-4 border-emerald-100 rounded-[20px] overflow-hidden shadow-inner bg-white">
                <ReportCardLayout data={viewIndividualData} />
              </div>

              <div className="mt-6 flex flex-col md:flex-row justify-center gap-6 pb-6">
                 <button 
                  onClick={() => { handlePrintIndividual(viewingStudentId!); setViewingStudentId(null); }}
                  className="bg-emerald-700 text-white px-12 py-5 rounded-[28px] font-black text-lg uppercase tracking-widest shadow-2xl shadow-emerald-200 flex items-center justify-center gap-4 hover:bg-emerald-800 hover:-translate-y-1 transition-all"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                   Download Official PDF
                 </button>
                 <button 
                  onClick={() => setViewingStudentId(null)}
                  className="bg-gray-100 text-gray-500 px-10 py-5 rounded-[28px] font-black text-lg uppercase tracking-widest hover:bg-gray-200 transition-all"
                 >
                   Close Preview
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* 5. MAIN WEB INTERFACE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Records System</h1>
          <p className="text-gray-500 font-medium italic">High-Precision Evaluation Engine</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handlePrintClassReport}
            className="bg-emerald-950 text-emerald-400 px-6 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-3 shadow-lg border-2 border-emerald-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4" /></svg>
            Master Schedule PDF
          </button>
          <button 
            onClick={handlePrintBatchIndividual}
            className="bg-white text-emerald-800 px-6 py-3 rounded-2xl font-black text-sm border-2 border-emerald-100 hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Batch PDF Cards
          </button>
          <button 
            onClick={() => setShowExamManager(!showExamManager)}
            className="bg-emerald-50 text-emerald-800 px-6 py-3 rounded-2xl font-black text-sm border-2 border-emerald-100 hover:bg-emerald-100 transition-all"
          >
            {showExamManager ? 'Hide Registry' : 'Exam Registry'}
          </button>
          {saveStatus && (
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm border-2 border-emerald-500 animate-bounce">
              {saveStatus}
            </div>
          )}
        </div>
      </div>

      {showExamManager && (
        <div className="bg-emerald-950 text-white p-10 rounded-[50px] shadow-2xl animate-in slide-in-from-top-4 duration-300 print:hidden relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-4 uppercase tracking-widest text-emerald-300 relative z-10">
            <span className="bg-emerald-800 p-2 rounded-xl text-white font-black">📑</span>
            Register New Examination Event
          </h3>
          <form onSubmit={handleAddExam} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end relative z-10">
            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Examination Title</label>
              <input name="title" required placeholder="G.C.E O/L Evaluation..." className="w-full bg-emerald-900/50 border-2 border-emerald-800/50 rounded-2xl px-6 py-4 font-black text-white outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Academic Year</label>
              <input name="year" required placeholder="2024" className="w-full bg-emerald-900/50 border-2 border-emerald-800/50 rounded-2xl px-6 py-4 font-black text-white outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Term</label>
              <select name="term" className="w-full bg-emerald-900/50 border-2 border-emerald-800/50 rounded-2xl px-6 py-4 font-black text-white outline-none focus:border-emerald-500 appearance-none">
                <option value="1">1st Term</option>
                <option value="2">2nd Term</option>
                <option value="3">3rd Term</option>
              </select>
            </div>
            <button type="submit" className="bg-emerald-500 text-white px-10 py-4 rounded-[20px] font-black text-sm hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-xl">
              Registry Exam
            </button>
          </form>
        </div>
      )}

      {/* Selectors */}
      <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-8 items-end print:hidden">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Examination</label>
          <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black outline-none focus:ring-2 focus:ring-emerald-500">
            {exams.map(e => <option key={e.id} value={e.id}>{e.title} ({e.year})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Grade</label>
          <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black outline-none">
            {[...Array(11)].map((_, i) => <option key={i+1} value={String(i+1)}>GRADE {i+1}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Section</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black outline-none">
            {['A', 'B', 'C'].map(c => <option key={c} value={c}>SECTION {c}</option>)}
          </select>
        </div>
        <button onClick={handleLoadResults} className="bg-emerald-600 text-white px-10 py-4 rounded-[20px] font-black text-sm hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-lg">
          Sync Student List
        </button>
      </div>

      {/* Entry Table */}
      <div className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden overflow-x-auto print:hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-emerald-950 text-[10px] font-black text-emerald-400 uppercase tracking-[3px]">
            <tr>
              <th className="px-10 py-8 sticky left-0 bg-emerald-950 z-10 text-left">Academic Profile</th>
              {coreSubjects.map(s => <th key={s.id} className="px-4 py-8 text-center">{s.name.toUpperCase()}</th>)}
              {isSenior && (
                <>
                  <th className="px-4 py-8 text-center bg-emerald-900">Cat 1</th>
                  <th className="px-4 py-8 text-center bg-emerald-900">Cat 2</th>
                  <th className="px-4 py-8 text-center bg-emerald-900">Cat 3</th>
                </>
              )}
              <th className="px-10 py-8 bg-emerald-950 text-right">Reporting Engine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentStudents.map(s => (
              <tr key={s.id} className="hover:bg-emerald-50/40 transition-colors">
                <td className="px-10 py-6 sticky left-0 bg-white shadow-md border-r z-10 cursor-pointer group" onClick={() => setViewingStudentId(s.id)}>
                  <div className="font-black text-emerald-800 text-[10px] mb-1 tracking-widest">#{s.indexNo}</div>
                  <div className="font-black text-gray-900 text-sm truncate max-w-[200px] uppercase group-hover:text-emerald-900">{s.nameWithInitials}</div>
                  <div className="text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase italic tracking-tighter">Click to View Schedule</div>
                </td>
                
                {coreSubjects.map(sub => (
                  <td key={sub.id} className="px-4 py-6 text-center">
                    <input 
                      type="number" 
                      value={marks[s.id]?.[sub.id] || ''} 
                      onChange={(e) => handleMarkChange(s.id, sub.id, e.target.value)}
                      className="w-16 h-12 bg-gray-50 border-2 border-transparent rounded-2xl text-center font-black text-lg text-gray-900 focus:border-emerald-500 transition-all outline-none appearance-none"
                    />
                  </td>
                ))}

                {isSenior && (
                  <>
                    <td className="px-4 py-6 text-center bg-gray-50/40">
                       <div className="space-y-3">
                          <select 
                            value={electives[s.id]?.['Category 1'] || ''} 
                            onChange={(e) => handleElectiveChange(s.id, 'Category 1', e.target.value)}
                            className="w-full text-[9px] font-black bg-white rounded-xl p-2 border border-emerald-100"
                          >
                            <option value="">Subject</option>
                            {cat1Options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                          </select>
                          {electives[s.id]?.['Category 1'] && (
                            <input 
                              type="number" 
                              value={marks[s.id]?.[electives[s.id]['Category 1']] || ''} 
                              onChange={(e) => handleMarkChange(s.id, electives[s.id]['Category 1'], e.target.value)}
                              className="w-16 h-10 bg-white border-2 border-emerald-100 rounded-xl text-center font-black"
                            />
                          )}
                       </div>
                    </td>
                    <td className="px-4 py-6 text-center bg-gray-50/40">
                       <div className="space-y-3">
                          <select 
                            value={electives[s.id]?.['Category 2'] || ''} 
                            onChange={(e) => handleElectiveChange(s.id, 'Category 2', e.target.value)}
                            className="w-full text-[9px] font-black bg-white rounded-xl p-2 border border-emerald-100"
                          >
                            <option value="">Subject</option>
                            {cat2Options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                          </select>
                          {electives[s.id]?.['Category 2'] && (
                            <input 
                              type="number" 
                              value={marks[s.id]?.[electives[s.id]['Category 2']] || ''} 
                              onChange={(e) => handleMarkChange(s.id, electives[s.id]['Category 2'], e.target.value)}
                              className="w-16 h-10 bg-white border-2 border-emerald-100 rounded-xl text-center font-black"
                            />
                          )}
                       </div>
                    </td>
                    <td className="px-4 py-6 text-center bg-gray-50/40">
                       <div className="space-y-3">
                          <select 
                            value={electives[s.id]?.['Category 3'] || ''} 
                            onChange={(e) => handleElectiveChange(s.id, 'Category 3', e.target.value)}
                            className="w-full text-[9px] font-black bg-white rounded-xl p-2 border border-emerald-100"
                          >
                            <option value="">Subject</option>
                            {cat1Options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                          </select>
                          {electives[s.id]?.['Category 3'] && (
                            <input 
                              type="number" 
                              value={marks[s.id]?.[electives[s.id]['Category 3']] || ''} 
                              onChange={(e) => handleMarkChange(s.id, electives[s.id]['Category 3'], e.target.value)}
                              className="w-16 h-10 bg-white border-2 border-emerald-100 rounded-xl text-center font-black"
                            />
                          )}
                       </div>
                    </td>
                  </>
                )}

                <td className="px-10 py-6 text-right flex items-center justify-end gap-3">
                   <button 
                    onClick={() => setViewingStudentId(s.id)}
                    className="text-emerald-800 font-black text-[10px] bg-emerald-100/50 px-5 py-3 rounded-2xl hover:bg-emerald-200 transition-all uppercase tracking-[2px]"
                   >
                     View Schedule
                   </button>
                   <button 
                    onClick={() => handlePrintIndividual(s.id)}
                    className="text-white font-black text-[10px] bg-emerald-600 px-5 py-3 rounded-2xl hover:bg-emerald-700 transition-all uppercase tracking-[2px] shadow-lg shadow-emerald-50"
                   >
                     Official PDF
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-10 print:hidden">
        <button 
          onClick={handleSaveAll}
          disabled={currentStudents.length === 0}
          className="bg-emerald-950 text-emerald-400 px-20 py-6 rounded-[35px] font-black text-xl shadow-2xl hover:bg-black hover:text-white transition-all disabled:opacity-20 uppercase tracking-widest border-2 border-emerald-900"
        >
          Publish Results & Execute Ranks
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-card-print, #report-card-print * { visibility: visible; }
          #class-report-print, #class-report-print * { visibility: visible; }
          #batch-report-print, #batch-report-print * { visibility: visible; }
          
          #report-card-print, #class-report-print, #batch-report-print { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white; 
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }

          .page-break-after-always {
            page-break-after: always;
          }
        }

        @media print {
          .print-class-active #report-card-print, 
          .print-class-active #batch-report-print { display: none !important; }
          .print-class-active #class-report-print { display: block !important; }
          .print-class-active @page { size: A4 landscape; }
        }
        
        @media print {
          .print-batch-active #class-report-print, 
          .print-batch-active #report-card-print { display: none !important; }
          .print-batch-active #batch-report-print { display: block !important; }
          .print-batch-active @page { size: A4 portrait; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f0fdf4; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #064e3b; border-radius: 20px; border: 3px solid #f0fdf4; }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ResultManagement;
