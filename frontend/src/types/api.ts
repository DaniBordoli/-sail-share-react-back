
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dniOrLicense?: string;
  experienceDeclaration?: string;
}

export interface User extends Omit<UserData, 'password'> {
  _id: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegistrationStep2Data {
  dniOrLicense?: string;
  experienceDeclaration?: string;
}
