
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export enum LeaveType {
  CASUAL = 'Casual Leave',
  MEDICAL = 'Medical Leave',
  DUTY = 'Duty Leave',
  NO_PAY = 'No Pay Leave'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  nic: string;
  designation: string;
  subject: string;
  assignedClass: string;
  contact: string;
  serviceType: string;
  active: boolean;
  address?: string;
  dob?: string;
  firstAppointmentDate?: string;
  currentSchoolJoinDate?: string;
  qualifications?: string;
  profilePic?: string;

  // --- NEW TEACHER DATA FIELDS ---
  empNo?: string;
  title?: string; // REV/MR/MRS/MISS
  initials?: string;
  surname?: string;
  fullName?: string;
  gender?: string; // MALE/FEMALE
  mobileNo?: string;
  fixedLineNo?: string;
  service?: string;
  grade?: string;
  zone?: string;
  ethnic?: string; // S/T/M
  trainedStatus?: string; // TRAINED/UNTRAINED
  appointmentType?: string;
  appointmentCategory?: string; // SLPS/SLTS/OTHER
  appointmentSubject?: string;
  trainingSubject?: string;
  mainSubject1?: string;
  mainSubject2?: string;
  mainSubject3?: string;
  teachingGrades?: string;
  totalPeriodsPerWeek?: string;
  medium?: string; // S/T/E
  presentSchoolJoinDate?: string;
  alStream?: string;
  alSubject1?: string;
  alSubject2?: string;
  alSubject3?: string;
  alSubject4?: string;
  degreeTitle?: string;
  degreeSubject1?: string;
  degreeSubject2?: string;
  degreeSubject3?: string;
  otherProfessionalQual?: string;
  releasedPlace?: string;
  releasedDesignation?: string;
  releasedFromDate?: string;
  releasedToDate?: string;
  residentialProvince?: string;
  residentialZone?: string;
  residentialDivision?: string;
  residentialDsDivision?: string;
  residentialGnDivision?: string;
  privateAddress?: string;
  zoneAppointmentDate?: string;
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
}

export interface SchoolProfile {
  name: string;
  fullName: string;
  address: string;
  academicYear: string;
  contactNo: string;
  email: string;
  logoUrl?: string;
  establishmentDate: string;
  censusNo: string;
  principalName: string;
  educationalDistrict: string;
  schoolZone: string;
  nearestSchool: string;
  district: string;
  province: string;
  divisionalSecretariat: string;
  gnDivision: string;
  electoralDistrict: string;
  policeStation: string;
  postOffice: string;
  telegraphicOffice: string;
  hospital: string;
  bank: string;
  coordinates: string;
  termDates: {
    term1: string;
    term2: string;
    term3: string;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Notice' | 'Event' | 'Circular';
  imageUrls?: string[];
}

export interface Student {
  id: string;
  indexNo: string;
  nameWithInitials: string;
  fullName: string;
  dob: string;
  grade: string;
  class: string;
  teacherId: string;
  contactNo?: string;
  gender?: 'Male' | 'Female';
}

export interface Subject {
  id: string;
  name: string;
  grade: string;
}

export interface Exam {
  id: string;
  title: string;
  year: string;
  term: string;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  marks: number;
  grade: 'A' | 'B' | 'C' | 'S' | 'W';
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentIndexNo: string;
  examId: string;
  results: SubjectResult[];
  totalMarks: number;
  average: number;
  classRank?: number;
  gradeRank?: number;
}

// --- NEW STATISTICS MODULE TYPES ---
export interface GradeStats {
  grade: string;
  boys: number;
  girls: number;
}

export interface SchoolStats {
  lastUpdated: string;
  teacherCount: number;
  gradeData: GradeStats[];
}
