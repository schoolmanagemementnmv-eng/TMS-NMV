
import { User, UserRole, LeaveRequest, LeaveStatus, LeaveType, SchoolProfile, NewsItem, Student, Exam, Subject, ExamResult, SubjectResult } from '../types';

const STORAGE_KEYS = {
  USERS: 'tms_users',
  LEAVES: 'tms_leaves',
  SCHOOL: 'tms_school',
  NEWS: 'tms_news',
  STUDENTS: 'tms_students',
  EXAMS: 'tms_exams',
  SUBJECTS: 'tms_subjects',
  RESULTS: 'tms_results'
};

export const storageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        {
          id: 'admin1',
          email: 'teacher@nikawewa.edu',
          password: 'Admin',
          name: 'School Administrator',
          role: UserRole.ADMIN,
          nic: '198012345678',
          designation: 'Principal',
          subject: 'Administration',
          assignedClass: 'N/A',
          contact: '0112345678',
          serviceType: 'SLEAS Class I',
          active: true
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify({
        name: "A/Nikawewa Muslim Vidyalaya",
        fullName: "NCP/AP/KB/HP/ NIKAWEWA MUSLIM VIDYALAYA",
        address: "Nikawewa, Anuradhapura, Sri Lanka",
        academicYear: "2024",
        contactNo: "0779006871",
        email: "NIKAWEWAMVSCHOOL2@GMAIL.COM",
        logoUrl: "https://via.placeholder.com/150?text=Logo",
        termDates: { term1: "", term2: "", term3: "" }
      }));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([
        { id: 'exam1', title: '1st Term Evaluation', year: '2024', term: '1' }
      ]));
      
      // Initialize Curriculum
      const curriculum: any[] = [
        // Grade 6-9 Subjects (14)
        ...['Tamil', 'Islam', 'English', 'Maths', 'Science', 'History', 'Geography', 'Civics', 'S. Sinhala', 'H. Science', 'PTS', 'Arabic', 'Art', 'ICT']
        .map(name => ({ id: `s69_${name}`, name, grade: '6-9', category: 'Core' })),
        
        // Grade 10-11 Core (6)
        ...['Tamil', 'Islam', 'English', 'Maths', 'Science', 'History']
        .map(name => ({ id: `s1011_${name}`, name, grade: '10-11', category: 'Core' })),
        
        // Category 1
        ...['Business & Accounting Studies', 'Geography', 'Civic Education', 'Entrepreneurship Studies', 'Second Language (Sinhala)']
        .map(name => ({ id: `c1_${name}`, name, grade: '10-11', category: 'Category 1' })),
        
        // Category 2
        ...['Appreciation of Tamil Literary Texts', 'Appreciation of Arabic Literary Texts', 'Art']
        .map(name => ({ id: `c2_${name}`, name, grade: '10-11', category: 'Category 2' })),
        
        // Category 3
        ...['Information & Communication Technology', 'Agriculture & Food Technology', 'Home Economics', 'Health & Physical Education']
        .map(name => ({ id: `c3_${name}`, name, grade: '10-11', category: 'Category 3' })),
      ];
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(curriculum));
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    }
  },

  getUsers(): User[] { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); },
  saveUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user; else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getLeaves(): LeaveRequest[] { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]'); },
  addLeave(leave: any) {
    const leaves = this.getLeaves();
    const nl = { ...leave, id: Math.random().toString(36).substr(2,9), appliedDate: new Date().toISOString().split('T')[0], status: LeaveStatus.PENDING };
    leaves.push(nl);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  },
  updateLeaveStatus(id: string, status: LeaveStatus) {
    const leaves = this.getLeaves();
    const i = leaves.findIndex(l => l.id === id);
    if (i > -1) { leaves[i].status = status; localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves)); }
  },

  getSchoolProfile(): SchoolProfile { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOL) || '{}'); },
  updateSchoolProfile(profile: SchoolProfile) { localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(profile)); },

  getNews(): NewsItem[] { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]'); },
  addNews(news: any) {
    const n = this.getNews();
    const item = { ...news, id: Math.random().toString(36).substr(2,9), date: new Date().toISOString().split('T')[0] };
    n.unshift(item);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(n));
  },

  getStudents(teacherId?: string): Student[] { 
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'); 
    return teacherId ? students.filter((s: Student) => s.teacherId === teacherId) : students;
  },
  saveStudent(student: Student) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index > -1) students[index] = student; else students.push(student);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getExams(): Exam[] { return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]'); },
  saveExam(exam: Exam) {
    const exams = this.getExams();
    const i = exams.findIndex(e => e.id === exam.id);
    if (i > -1) exams[i] = exam; else exams.push(exam);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  getSubjects(grade?: string): Subject[] { 
    const subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
    if (!grade) return subs;
    const gInt = parseInt(grade);
    if (gInt >= 6 && gInt <= 9) return subs.filter((s: any) => s.grade === '6-9');
    if (gInt >= 10 && gInt <= 11) return subs.filter((s: any) => s.grade === '10-11');
    return subs;
  },
  saveSubject(subject: Subject) {
    const subs = this.getSubjects();
    const i = subs.findIndex(s => s.id === subject.id);
    if (i > -1) subs[i] = subject; else subs.push(subject);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subs));
  },

  getResults(examId?: string): ExamResult[] {
    const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
    return examId ? results.filter((r: ExamResult) => r.examId === examId) : results;
  },

  calculateGrade(marks: number): 'A' | 'B' | 'C' | 'S' | 'W' {
    if (marks >= 75) return 'A';
    if (marks >= 65) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 35) return 'S';
    return 'W';
  },

  saveResult(result: ExamResult) {
    const results = this.getResults();
    const index = results.findIndex(r => r.id === result.id || (r.studentId === result.studentId && r.examId === result.examId));
    
    result.results = result.results.map(r => ({
      ...r,
      grade: this.calculateGrade(r.marks)
    }));

    result.totalMarks = result.results.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);
    result.average = result.results.length > 0 ? result.totalMarks / result.results.length : 0;

    if (index > -1) results[index] = result; else results.push(result);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    this.processRanks(result.examId);
  },

  processRanks(examId: string) {
    const results = this.getResults();
    const students = this.getStudents();
    const examResults = results.filter(r => r.examId === examId);

    const grades = [...new Set(students.map(s => s.grade))];
    grades.forEach(grade => {
      const studentIdsInGrade = students.filter(s => s.grade === grade).map(s => s.id);
      const gradeResults = examResults.filter(r => studentIdsInGrade.includes(r.studentId));
      
      gradeResults.sort((a, b) => b.average - a.average);
      gradeResults.forEach((res, idx) => {
        const globalIdx = results.findIndex(r => r.id === res.id);
        if (globalIdx > -1) results[globalIdx].gradeRank = idx + 1;
      });

      const classesInGrade = [...new Set(students.filter(s => s.grade === grade).map(s => s.class))];
      classesInGrade.forEach(cls => {
        const studentIdsInClass = students.filter(s => s.grade === grade && s.class === cls).map(s => s.id);
        const classResults = examResults.filter(r => studentIdsInClass.includes(r.studentId));
        classResults.sort((a, b) => b.average - a.average);
        classResults.forEach((res, idx) => {
          const globalIdx = results.findIndex(r => r.id === res.id);
          if (globalIdx > -1) results[globalIdx].classRank = idx + 1;
        });
      });
    });

    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  }
};
