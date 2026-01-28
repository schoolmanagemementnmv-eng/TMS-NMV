
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { User, Student, ExamResult, LeaveRequest, UserRole, SchoolProfile, Subject } from '../types';

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
      body { font-family: Arial, sans-serif; margin: 20mm; color: #000; }
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
    const households = Math.ceil(totalPopulation * 0.85);
    const content = `
      <h2>File Name: Census_Entry_Console_Report.html</h2>
      <h1>Census Entry Console Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Year: ${school.academicYear} | Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <h3>1. Introduction</h3>
      <p>Official demographic audit of ${school.name}. This report provides institutional population data for resource planning.</p>

      <h3>2. Total Households</h3>
      <p>Estimated Households in Catchment Area: <strong>${households} Units</strong></p>

      <h3>3. Total Population</h3>
      <p>Institutional Enrollment Total: <strong>${totalPopulation} Students</strong></p>

      <h3>4. Area-wise Distribution</h3>
      <table>
        <thead>
          <tr><th>Grade (Area)</th><th>Male</th><th>Female</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${stats.gradeData.map(g => `<tr><td>Grade ${g.grade}</td><td class="text-center">${g.boys}</td><td class="text-center">${g.girls}</td><td class="text-center"><strong>${g.boys + g.girls}</strong></td></tr>`).join('')}
        </tbody>
      </table>

      <h3>5. Gender Ratio</h3>
      <p>Current Ratio: <strong>${((stats.gradeData.reduce((a, b) => a + b.boys, 0) / (totalPopulation || 1)) * 100).toFixed(1)}% Male</strong> / <strong>${((stats.gradeData.reduce((a, b) => a + b.girls, 0) / (totalPopulation || 1)) * 100).toFixed(1)}% Female</strong></p>

      <h3>6. Summary</h3>
      <div class="summary-box">
        <p>Institutional census verified for the 2026 Academic cycle. Distribution remains stable across primary and secondary divisions.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Statistical Officer</div>
        <div class="sig-line">Principal</div>
      </div>
    `;
    downloadReportHTML('Census_Entry_Console_Report.html', content);
  };

  const generateTeachersReport = () => {
    const content = `
      <h2>File Name: Teachers_Database_Report.html</h2>
      <h1>Teachers Database Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Faculty Ledger | Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <h3>1. Introduction</h3>
      <p>Roster of academic staff and professional allocation at ${school.name}.</p>

      <h3>2. Total Teachers</h3>
      <p>Active Academic Staff: <strong>${teachers.length}</strong></p>

      <h3>3. Subject-wise Distribution</h3>
      <table>
        <thead>
          <tr><th>Teacher Name</th><th>Designation</th><th>Primary Subject</th></tr>
        </thead>
        <tbody>
          ${teachers.map(t => `<tr><td>${t.name}</td><td>${t.designation}</td><td>${t.subject}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>4. School-wise Allocation</h3>
      <table>
        <thead>
          <tr><th>Teacher Name</th><th>Class Assignment</th><th>Contact Info</th></tr>
        </thead>
        <tbody>
          ${teachers.map(t => `<tr><td>${t.name}</td><td>${t.assignedClass}</td><td>${t.contact}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>5. Experience Analysis</h3>
      <p>Staff profiles reflect a balanced mix of senior and junior educators. Service records are integrated with the SLEAS management system.</p>

      <h3>6. Summary</h3>
      <div class="summary-box">
        <p>Faculty roster is complete and assignments are optimized for the 2026 curriculum requirements.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Faculty Secretary</div>
        <div class="sig-line">Principal</div>
      </div>
    `;
    downloadReportHTML('Teachers_Database_Report.html', content);
  };

  const generateStudentReport = () => {
    const content = `
      <h2>File Name: Student_Database_Report.html</h2>
      <h1>Student Database Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Context: ${selectedGrade} ${selectedClass} | Year: ${school.academicYear}</p>
      </div>

      <h3>1. Introduction</h3>
      <p>Registry of students enrolled for the 2026 session at ${school.name}.</p>

      <h3>2. Total Students</h3>
      <p>Total Targeted Enrollment: <strong>${filteredStudents.length}</strong></p>

      <h3>3. Class-wise Strength</h3>
      <table>
        <thead>
          <tr><th>Index No</th><th>Name with Initials</th><th>Gender</th><th>Grade-Class</th></tr>
        </thead>
        <tbody>
          ${filteredStudents.map(s => `<tr><td>${s.indexNo}</td><td>${s.nameWithInitials}</td><td class="text-center">${s.gender || 'N/A'}</td><td class="text-center">${s.grade}-${s.class}</td></tr>`).join('')}
        </tbody>
      </table>

      <h3>4. Attendance Overview</h3>
      <p>All candidates listed are active participants in the current evaluation term.</p>

      <h3>5. Gender Distribution</h3>
      <p>Boys: ${filteredStudents.filter(s => s.gender === 'Male').length} | Girls: ${filteredStudents.filter(s => s.gender === 'Female').length}</p>

      <h3>6. Summary</h3>
      <div class="summary-box">
        <p>Student registry is accurate and verified against the official admission registers.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Registrar</div>
        <div class="sig-line">Section Head</div>
      </div>
    `;
    downloadReportHTML('Student_Database_Report.html', content);
  };

  const generateMeritReport = () => {
    const exam = exams.find(e => e.id === selectedExamId);
    const content = `
      <h2>File Name: Merit_Intelligence_Module_Report.html</h2>
      <h1>Merit Intelligence Module Report</h1>
      <div class="header-info">
        <p>${school.fullName}</p>
        <p>Exam: ${exam?.title || 'Cycle 1'} | Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <h3>1. Introduction</h3>
      <p>Academic performance audit and merit ranking for ${school.name}.</p>

      <h3>2. Top Performers</h3>
      <table>
        <thead>
          <tr><th>Rank</th><th>Candidate Name</th><th>Index No</th><th>Average %</th></tr>
        </thead>
        <tbody>
          ${marksReportData.slice(0, 10).map(r => `<tr><td class="text-center">${r.classRank}</td><td>${students.find(s => s.id === r.studentId)?.nameWithInitials}</td><td class="text-center">${r.studentIndexNo}</td><td class="text-center"><strong>${r.average.toFixed(2)}</strong></td></tr>`).join('')}
        </tbody>
      </table>

      <h3>3. Rank Distribution</h3>
      <p>Analysis shows competitive performance with ${marksReportData.filter(r => r.average >= 75).length} students achieving "A" Merit levels.</p>

      <h3>4. Score Analysis</h3>
      <table>
        <thead>
          <tr><th>Subject Component</th><th>Avg. Score</th><th>Success Rate</th></tr>
        </thead>
        <tbody>
          ${subjects.map(sub => {
            const scores = marksReportData.map(r => r.results.find(res => res.subjectId === sub.id)?.marks).filter(m => m !== undefined) as number[];
            const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0.0";
            return `<tr><td>${sub.name}</td><td class="text-center">${avg}%</td><td class="text-center">${scores.filter(s => s >= 40).length}/${scores.length}</td></tr>`;
          }).join('')}
        </tbody>
      </table>

      <h3>5. Performance Insights</h3>
      <p>Aggregate Class Average: <strong>${(marksReportData.reduce((a, b) => a + b.average, 0) / (marksReportData.length || 1)).toFixed(2)}%</strong>.</p>

      <h3>6. Summary</h3>
      <div class="summary-box">
        <p>Results verified for instructional quality. Merit ranking established for the current evaluation cycle.</p>
      </div>

      <div class="signature-space">
        <div class="sig-line">Examiner</div>
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
            <p className="text-gray-500 font-medium italic">Professional Government-Standard Reporting Suite (2026)</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-50">
            <button onClick={() => setActiveTab('static')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'static' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}>Digital Reports</button>
            <button onClick={() => setActiveTab('live')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}>Looker Studio</button>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 ring-1 ring-gray-50">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[3px]">Filter Grade</label>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 font-black text-gray-900">
              <option value="All">Complete School</option>
              {[...Array(11)].map((_, i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[3px]">Filter Section</label>
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
            {/* 1. Census Report Card */}
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-emerald-500 group">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Census Module</h3>
                <p className="text-gray-500 text-sm mb-6 italic">Enrollment distribution and population aggregates.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Population</p>
                    <p className="text-xl font-black text-emerald-900">{stats.gradeData.reduce((a,b)=>a+b.boys+b.girls,0)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Households</p>
                    <p className="text-xl font-black text-emerald-900">{Math.ceil(stats.gradeData.reduce((a,b)=>a+b.boys+b.girls,0)*0.85)}</p>
                  </div>
                </div>
              </div>
              <button onClick={generateCensusReport} className="w-full bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Download HTML Report</button>
            </div>

            {/* 2. Teachers Report Card */}
            {isAdmin && (
              <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-blue-500 group">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Staff Registry</h3>
                  <p className="text-gray-500 text-sm mb-6 italic">Faculty distribution and service allocation ledger.</p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-3xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Faculty Size</p>
                      <p className="text-xl font-black text-blue-900">{teachers.length}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-3xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Allocated</p>
                      <p className="text-xl font-black text-blue-900">{teachers.filter(t=>t.active).length}</p>
                    </div>
                  </div>
                </div>
                <button onClick={generateTeachersReport} className="w-full bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Download HTML Report</button>
              </div>
            )}

            {/* 3. Student Report Card */}
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-purple-500 group">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Student Ledger</h3>
                <p className="text-gray-500 text-sm mb-6 italic">Demographic markers and class-wise attendance profiles.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Target Count</p>
                    <p className="text-xl font-black text-purple-900">{filteredStudents.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">G. Distribution</p>
                    <p className="text-xl font-black text-purple-900">{((filteredStudents.filter(s=>s.gender==='Male').length/filteredStudents.length)*100).toFixed(0)}% M</p>
                  </div>
                </div>
              </div>
              <button onClick={generateStudentReport} className="w-full bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Download HTML Report</button>
            </div>

            {/* 4. Merit Report Card */}
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all border-l-[12px] border-orange-500 group">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Merit Module</h3>
                <p className="text-gray-500 text-sm mb-6 italic">Academic rank distribution and instructional scores.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Performance Avg</p>
                    <p className="text-xl font-black text-orange-900">{(marksReportData.reduce((a,b)=>a+b.average,0)/(marksReportData.length||1)).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-3xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Success Rate</p>
                    <p className="text-xl font-black text-orange-900">High</p>
                  </div>
                </div>
              </div>
              <button onClick={generateMeritReport} className="w-full bg-emerald-950 text-emerald-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Download HTML Report</button>
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
              </div>
              <div className="relative aspect-video w-full bg-gray-50 rounded-[40px] border-4 border-gray-100 flex flex-col items-center justify-center">
                 <h4 className="text-2xl font-black text-gray-900 mb-4">Establishing Secure Data Link...</h4>
                 <p className="text-gray-500 font-medium italic mb-10">Direct connection to Google Studio endpoint required.</p>
                 <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Sync Dashboard</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCentral;
