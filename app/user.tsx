// types/user.ts
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'data_clerk' | 'viewer';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  token: string;
}