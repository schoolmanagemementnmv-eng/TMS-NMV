
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
  // New details for profile
  address?: string;
  dob?: string;
  firstAppointmentDate?: string;
  currentSchoolJoinDate?: string;
  qualifications?: string;
  profilePic?: string;
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
  address: string;
  academicYear: string;
  termDates: {
    term1: string;
    term2: string;
    term3: string;
  };
  logoUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Notice' | 'Event' | 'Circular';
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
  teacherId: string;
  contactNo?: string;
  gender?: 'Male' | 'Female';
}
