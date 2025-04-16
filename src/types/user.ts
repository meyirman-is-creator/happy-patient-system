export enum UserRole {
    PATIENT = 'patient',
    DOCTOR = 'doctor',
    ADMIN = 'admin',
  }
  
  export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Doctor extends User {
    role: UserRole.DOCTOR;
    specialization: string;
    description?: string;
  }
  
  export interface Patient extends User {
    role: UserRole.PATIENT;
  }
  
  export interface Admin extends User {
    role: UserRole.ADMIN;
  }
  
  // Auth related types
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    phoneNumber: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }