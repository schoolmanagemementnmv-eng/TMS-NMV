
import { User, UserRole, LeaveRequest, LeaveStatus, LeaveType, SchoolProfile, NewsItem, Student } from '../types';

/**
 * In a real Google Apps Script app, this service would use `google.script.run` 
 * to communicate with the Spreadsheet. Here we simulate it with localStorage.
 */

const STORAGE_KEYS = {
  USERS: 'tms_users',
  LEAVES: 'tms_leaves',
  SCHOOL: 'tms_school',
  NEWS: 'tms_news',
  STUDENTS: 'tms_students'
};

const INITIAL_DATA = {
  USERS: [
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
    },
    {
      id: 'teacher1',
      email: 'ahmed@nikawewa.edu',
      password: 'password123',
      name: 'Ahmed Fawaz',
      role: UserRole.TEACHER,
      nic: '199023456789',
      designation: 'Graduate Teacher',
      subject: 'Mathematics',
      assignedClass: 'Grade 10-A',
      contact: '0771234567',
      serviceType: 'SLTS Class II-II',
      active: true
    }
  ],
  SCHOOL: {
    name: "A/Nikawewa Muslim Vidyalaya",
    address: "Nikawewa, Anuradhapura, Sri Lanka",
    academicYear: "2024",
    termDates: {
      term1: "2024-01-10 to 2024-04-05",
      term2: "2024-04-20 to 2024-08-15",
      term3: "2024-09-01 to 2024-12-05"
    },
    logoUrl: "https://picsum.photos/200"
  },
  NEWS: [
    {
      id: '1',
      title: 'Monthly Staff Meeting',
      content: 'All teachers are requested to attend the monthly progress meeting on Monday.',
      date: '2024-03-20',
      category: 'Notice'
    }
  ],
  LEAVES: [],
  STUDENTS: [
    { id: 's1', name: 'Zaid Mohamed', grade: '10', class: 'A', teacherId: 'teacher1' },
    { id: 's2', name: 'Sara Ibrahim', grade: '10', class: 'A', teacherId: 'teacher1' }
  ]
};

export const storageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.USERS));
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(INITIAL_DATA.SCHOOL));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_DATA.NEWS));
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_DATA.LEAVES));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_DATA.STUDENTS));
    }
  },

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  saveUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getLeaves(): LeaveRequest[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
  },

  addLeave(leave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) {
    const leaves = this.getLeaves();
    const newLeave: LeaveRequest = {
      ...leave,
      id: Math.random().toString(36).substr(2, 9),
      appliedDate: new Date().toISOString().split('T')[0],
      status: LeaveStatus.PENDING
    };
    leaves.push(newLeave);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    return newLeave;
  },

  updateLeaveStatus(leaveId: string, status: LeaveStatus) {
    const leaves = this.getLeaves();
    const index = leaves.findIndex(l => l.id === leaveId);
    if (index > -1) {
      leaves[index].status = status;
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    }
  },

  getSchoolProfile(): SchoolProfile {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOL) || '{}');
  },

  updateSchoolProfile(profile: SchoolProfile) {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(profile));
  },

  getNews(): NewsItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]');
  },

  addNews(news: Omit<NewsItem, 'id' | 'date'>) {
    const newsItems = this.getNews();
    const newItem: NewsItem = {
      ...news,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0]
    };
    newsItems.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(newsItems));
  },

  getStudents(teacherId?: string): Student[] {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    return teacherId ? students.filter((s: Student) => s.teacherId === teacherId) : students;
  },

  saveStudent(student: Student) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index > -1) {
      students[index] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }
};
