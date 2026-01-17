export type School = {
  id: string;
  name: string;
  address?: string;
  code: string;
  status: 'active' | 'disabled';
  subscription: {
    maxStudent: number;
    maxTeacher: number;
    expiry: { seconds: number; nanoseconds: number; } | Date;
  };
};

export type Student = {
  id: string;
  schoolId: string;
  name: string;
  shift: 'Morning' | 'Day';
  session: string; // e.g., "2024"
  class: string; // e.g., "Class 10"
  roll: number;
  loginCode: string;
};

export type Teacher = {
  id: string;
  schoolId: string;
  name: string;
  assignedClass: string;
  assignedSubjects: string[];
  loginCode: string;
};

export type ResultSubject = {
  name: string;
  mark: number;
};

export type Result = {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  examName: string;
  subjects: ResultSubject[];
  gpa: number;
  published: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
};

export type Payment = {
  id: string;
  studentId: string;
  studentName: string;
  schoolId:string;
  amount: number;
  method: string;
  trx: string; // Transaction ID
  status: 'pending' | 'approved' | 'rejected';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  approvedAt?: {
    seconds: number;
    nanoseconds: number;
  } | Date;
};

export type Notice = {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  publishTo: 'all' | 'teacher' | 'student' | 'class';
  published: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
};

export type UserRole = 'master' | 'admin' | 'teacher' | 'student';

export interface UserClaims {
  role: UserRole;
  schoolId: string;
  subscriptionActive: boolean;
}
