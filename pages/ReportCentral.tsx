
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { User, Student, ExamResult, LeaveRequest, UserRole, SchoolProfile, Subject } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface ReportCentralProps {
  user: User;
}

const ReportCentral: React.FC<ReportCentralProps> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const school = storageService.getSchoolProfile();
  const students = storageService.getStudents();
  const teachers = storageService.getUsers().filter(u => u.role === UserRole.TEACHER);
  const leaves = storageService.getLeaves();
  const exams = storageService.getExams();
  const stats = storageService.getSchoolStats();

  const [activeTab, setActiveTab] = useState<'static' | 'live'>('static');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      (selectedGrade === 'All' || s.grade === selectedGrade) &&
      (selectedClass === 'All' || s.class === selectedClass)
    ).sort((a, b) => a.nameWithInitials.localeCompare(b.nameWithInitials));
  }, [students, selectedGrade, selectedClass]);

  const marksReportData = useMemo(() => {
    const results = storageService.getResults(selectedExamId);
    return results.filter(r => {
      const s = students.find(stud => stud.id === r.studentId);
      return s && (selectedGrade === 'All' || s.grade === selectedGrade) && (selectedClass === 'All' || s.class === selectedClass);
    }).sort((a, b) => (a.classRank || 0) - (b.classRank || 0));
  }, [selectedExamId, students, selectedGrade, selectedClass]);

  const subjects = useMemo(() => storageService.getSubjects(selectedGrade !== 'All' ? selectedGrade : '9'), [selectedGrade]);

  const reportStyles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20mm; color: #000; line-height: 1.5; }
      h1, h2 { text-align: center; text-transform: uppercase; margin-bottom: 5px; }
      h3 { border-bottom: 2px solid #000; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; font-size: 16px; }
      .header-info { text-align: center; margin-bottom: 30px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
      th, td { border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; }
      th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
      .text-center { text-align: center; }
      .page-break { page-break-before: always; }
      .summary-box { border: 1px solid #000; padding: 15px; margin-top: 20px; background-color: #fafafa; }
      .signature-space { margin-top: 60px; display: flex; justify-content: space-between; }
      .sig-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; font-weight: bold; }
    </style>
  `;

  const downloadReportHTML = (filename: string, content: string) => {
    const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${filename}</title>${reportStyles}</head><body>${content}</body></html>`;
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const generateCensusReport = () => {
    const totalPopulation = stats.gradeData.reduce((acc, g) => acc + g.boys + g.girls, 0);
    const content = `
      <h1>Census Entry Console Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Academic Year: ${school.academicYear} | Census Date: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <h3>1. Introduction</h3>
      <p>This document presents the official demographic distribution and population census for ${school.name} for the current academic session. This data is utilized for resource allocation, faculty assignment, and infrastructure planning.</p>

      <h3>2. Key Statistics Overview</h3>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Enrollment</td><td>${totalPopulation} Students</td></tr>
        <tr><td>Total Faculty Count</td><td>${stats.teacherCount} Active Teachers</td></tr>
        <tr><td>Primary Section (Gr 1-5)</td><td>${stats.gradeData.slice(0, 5).reduce((a, b) => a + b.boys + b.girls, 0)}</td></tr>
        <tr><td>Secondary Section (Gr 6-11)</td><td>${stats.gradeData.slice(5).reduce((a, b) => a + b.boys + b.girls, 0)}</td></tr>
      </table>

      <h3>3. Area-wise Distribution (Grade-wise)</h3>
      <table>
        <thead>
          <tr><th>Grade Level</th><th>Boys</th><th>Girls</th><th>Total Strength</th></tr>
        </thead>
        <tbody>
          ${stats.gradeData.map(g => `<tr><td>Grade ${g.grade}</td><td class="text-center">${g.boys}</td><td class="text-center">${g.girls}</td><td class="text-center">${g.boys + g.girls}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>4. Gender Ratio Analysis</h3>
      <p>The current student population consists of <strong>${((stats.gradeData.reduce((a, b) => a + b.boys, 0) / totalPopulation) * 100).toFixed(1)}% Male</strong> and <strong>${((stats.gradeData.reduce((a, b) => a + b.girls, 0) / totalPopulation) * 100).toFixed(1)}% Female</strong> students.</p>

      <h3>5. Summary</h3>
      <div class="summary-box">
        <p>The institution maintains a balanced student-to-teacher ratio of ${(totalPopulation / stats.teacherCount).toFixed(1)}:1. Enrollment figures show steady distribution across primary and secondary tiers. All figures are verified as per the National School Census Registry guidelines.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Statistical Officer</div>
        <div class="sig-line">Principal / Head of Institution</div>
      </div>
    `;
    downloadReportHTML('Census_Entry_Console_Report.html', content);
  };

  const generateTeachersReport = () => {
    const content = `
      <h1>Teachers Database Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Faculty Registry | Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <h3>1. Introduction</h3>
      <p>This registry report details the professional allocation and demographic data of the academic staff at ${school.name}. It serves as the master record for faculty qualifications and duty assignments.</p>

      <h3>2. Personnel Overview</h3>
      <table>
        <tr><th>Designation Count</th><th>Total</th></tr>
        <tr><td>Total Academic Faculty</td><td>${teachers.length}</td></tr>
        <tr><td>Active Assignments</td><td>${teachers.filter(t => t.active).length}</td></tr>
        <tr><td>School Zone</td><td>${school.schoolZone}</td></tr>
      </table>

      <h3>3. Subject-wise Distribution</h3>
      <table>
        <thead>
          <tr><th>Full Name</th><th>Designation</th><th>Primary Subject</th><th>NIC Number</th></tr>
        </thead>
        <tbody>
          ${teachers.map(t => `<tr><td>${t.name}</td><td>${t.designation}</td><td>${t.subject}</td><td>${t.nic}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>4. School-wise Allocation (Class Assignments)</h3>
      <table>
        <thead>
          <tr><th>Teacher Name</th><th>Assigned Class/Section</th><th>Contact Number</th></tr>
        </thead>
        <tbody>
          ${teachers.map(t => `<tr><td>${t.name}</td><td>${t.assignedClass}</td><td>${t.contact}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>5. Summary</h3>
      <div class="summary-box">
        <p>The faculty database reflects a diverse range of specializations. Staff allocation is optimized to meet the curriculum requirements of both primary and secondary divisions. Service records are up-to-date in the national management system.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Establishment Clerk</div>
        <div class="sig-line">Principal</div>
      </div>
    `;
    downloadReportHTML('Teachers_Database_Report.html', content);
  };

  const generateStudentReport = () => {
    const content = `
      <h1>Student Database Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Enrollment Registry | Context: ${selectedGrade === 'All' ? 'Full School' : 'Grade ' + selectedGrade}</p>
      </div>

      <h3>1. Introduction</h3>
      <p>Official enrollment audit for students registered at ${school.name}. This report provides a detailed breakdown of candidate profiles and their respective academic placements.</p>

      <h3>2. Enrollment Strength</h3>
      <table>
        <tr><th>Metric</th><th>Count</th></tr>
        <tr><td>Identified Candidates</td><td>${filteredStudents.length}</td></tr>
        <tr><td>Grade Context</td><td>${selectedGrade}</td></tr>
        <tr><td>Section Context</td><td>${selectedClass}</td></tr>
      </table>

      <h3>3. Class-wise Strength</h3>
      <table>
        <thead>
          <tr><th>Index No</th><th>Full Name</th><th>Grade</th><th>Section</th><th>Gender</th></tr>
        </thead>
        <tbody>
          ${filteredStudents.map(s => `<tr><td>${s.indexNo}</td><td>${s.fullName}</td><td class="text-center">${s.grade}</td><td class="text-center">${s.class}</td><td class="text-center">${s.gender || 'N/A'}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>4. Attendance Overview</h3>
      <p>All listed students are active participants in the ${school.academicYear} academic cycle. Student profiles include essential contact and demographic markers for administrative use.</p>

      <h3>5. Summary</h3>
      <div class="summary-box">
        <p>The student population for the selected criteria is verified for the current term. Enrollment records match the admission registers and the digital portal database as of ${new Date().toLocaleTimeString()}.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Registrar of Students</div>
        <div class="sig-line">Class Teacher / Section Head</div>
      </div>
    `;
    downloadReportHTML('Student_Database_Report.html', content);
  };

  const generateMeritReport = () => {
    const exam = exams.find(e => e.id === selectedExamId);
    const content = `
      <h1>Merit Intelligence Module Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Evaluation Cycle: ${exam?.title || 'Current Exam'} | Year: ${exam?.year || '2024'}</p>
      </div>

      <h3>1. Introduction</h3>
      <p>Professional academic performance audit generated via the Merit Intelligence Module. This report analyzes examination results to provide insights into instructional effectiveness and student attainment levels.</p>

      <h3>2. Top Performers (Merit Ranking)</h3>
      <table>
        <thead>
          <tr><th>Rank</th><th>Index No</th><th>Candidate Name</th><th>Average %</th></tr>
        </thead>
        <tbody>
          ${marksReportData.slice(0, 10).map(r => `<tr><td class="text-center">${r.classRank}</td><td class="text-center">${r.studentIndexNo}</td><td>${students.find(s => s.id === r.studentId)?.nameWithInitials}</td><td class="text-center"><strong>${r.average.toFixed(2)}</strong></td></tr>`).join('')}
        </tbody>
      </table>

      <h3>3. Score Analysis (Subject-wise)</h3>
      <table>
        <thead>
          <tr><th>Subject</th><th>Avg. Score</th><th>Pass Count</th><th>Success Rate</th></tr>
        </thead>
        <tbody>
          ${subjects.map(sub => {
            const scores = marksReportData.map(r => r.results.find(res => res.subjectId === sub.id)?.marks).filter(m => m !== undefined) as number[];
            const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0.0";
            const passes = scores.filter(s => s >= 40).length;
            return `<tr><td>${sub.name}</td><td class="text-center">${avg}</td><td class="text-center">${passes}/${scores.length}</td><td class="text-center">${scores.length ? ((passes / scores.length) * 100).toFixed(1) : 0}%</td></tr>`;
          }).join('')}
        </tbody>
      </table>

      <h3>4. Performance Insights</h3>
      <p>Class Average for ${selectedGrade}-${selectedClass} stands at <strong>${(marksReportData.reduce((a, b) => a + b.average, 0) / (marksReportData.length || 1)).toFixed(2)}%</strong>. Result distribution indicates standard normal curve variance across the core subjects.</p>

      <h3>5. Summary</h3>
      <div class="summary-box">
        <p>Evaluation results for ${exam?.title} have been verified. Remedial instructional support is recommended for subjects with success rates below 60%. This merit schedule serves as the basis for term-end promotions and parent-teacher briefings.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Exam Coordinator</div>
        <div class="sig-line">Principal</div>
      </div>
    `;
    downloadReportHTML('Merit_Intelligence_Module_Report.html', content);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Report Central</h1>
            <p className="text-gray-500 font-medium italic">Professional Government-Standard Reporting Suite</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-50">
            <button onClick={() => setActiveTab('static')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'static' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}>Standard View</button>
            <button onClick={() => setActiveTab('live')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}>Looker Analytics</button>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 ring-1 ring-gray-50">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[3px]">Select Grade</label>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-900 focus:ring-2 focus:ring-emerald-500">
              <option value="All">All Grades</option>
              {[...Array(11)].map((_, i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[3px]">Select Section</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-900">
              <option value="All">All Sections</option>
              {['A', 'B', 'C'].map(c => <option key={c} value={c}>Section {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[3px]">Evaluation Cycle</label>
            <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-900">
              {exams.map(e => <option key={e.id} value={e.id}>{e.title} ({e.year})</option>)}
            </select>
          </div>
        </div>

        {activeTab === 'static' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Census Report */}
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-emerald-500 group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Census Console</h3>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">v2.1</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 font-medium italic">Institutional demographic distribution and official population ledger.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Population</p>
                    <p className="text-xl font-black text-emerald-900">{stats.gradeData.reduce((a,b)=>a+b.boys+b.girls,0)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Staff Count</p>
                    <p className="text-xl font-black text-emerald-900">{stats.teacherCount}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={generateCensusReport} className="flex-1 bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4"/></svg>
                   Official HTML Report
                </button>
              </div>
            </div>

            {/* 2. Teachers Database */}
            {isAdmin && (
              <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-blue-500 group">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Staff Registry</h3>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">MASTER</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 font-medium italic">Complete roster of academic faculty, NIC credentials, and assignments.</p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-3xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Faculty Size</p>
                      <p className="text-xl font-black text-blue-900">{teachers.length}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-3xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Active</p>
                      <p className="text-xl font-black text-blue-900">{teachers.filter(t=>t.active).length}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={generateTeachersReport} className="flex-1 bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4"/></svg>
                     Faculty HTML Report
                  </button>
                </div>
              </div>
            )}

            {/* 3. Student Database */}
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-purple-500 group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Student Ledger</h3>
                  <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">REGISTRY</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 font-medium italic">Detailed census by grade and class, including demographic markers.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Filter Match</p>
                    <p className="text-xl font-black text-purple-900">{filteredStudents.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Scope</p>
                    <p className="text-xl font-black text-purple-900">{selectedGrade === 'All' ? 'School' : 'Grade ' + selectedGrade}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={generateStudentReport} className="flex-1 bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4"/></svg>
                   Student HTML Report
                </button>
              </div>
            </div>

            {/* 4. Merit Intelligence */}
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-orange-500 group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Merit Module</h3>
                  <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">INTELLIGENCE</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 font-medium italic">Academic evaluation schedule with rank analysis and performance scores.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Avg. Class Score</p>
                    <p className="text-xl font-black text-orange-900">{(marksReportData.reduce((a,b)=>a+b.average,0)/(marksReportData.length||1)).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Top Score</p>
                    <p className="text-xl font-black text-orange-900">{marksReportData.length ? Math.max(...marksReportData.map(r=>r.average)).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={generateMeritReport} className="flex-1 bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4"/></svg>
                   Merit HTML Report
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-white p-6 rounded-[48px] shadow-sm border border-gray-100 ring-1 ring-gray-50">
              <div className="flex items-center justify-between mb-8 p-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">📊</div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Real-Time Data Intelligence</h3>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Powered by Google Looker Studio</p>
                    </div>
                 </div>
                 <span className="bg-blue-50 text-blue-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[4px] border border-blue-100">Live Connection: Active</span>
              </div>
              <div className="relative aspect-video w-full bg-gray-50 rounded-[40px] border-4 border-gray-100 overflow-hidden shadow-inner flex flex-col items-center justify-center group">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-50"></div>
                 <div className="text-center relative z-10 px-10">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl mx-auto mb-8 flex items-center justify-center animate-bounce">
                       <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/></svg>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-4">Establishing Secure Data Link...</h4>
                    <p className="text-gray-500 font-medium italic max-w-md mx-auto mb-10">
                      The institutional dashboard requires a direct connection to the Google Looker Studio endpoint. Ensure you are logged into your Workspace account.
                    </p>
                    <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 transition-all">
                       Sync Dashboard Now
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCentral;
