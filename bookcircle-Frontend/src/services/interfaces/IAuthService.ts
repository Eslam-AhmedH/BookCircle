import type { UserProfile, UserRole } from '../../entities/user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: UserProfile
  needsApproval?: boolean
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>
  register(data: RegisterData): Promise<AuthResponse>
  getMe(): Promise<UserProfile>
}
