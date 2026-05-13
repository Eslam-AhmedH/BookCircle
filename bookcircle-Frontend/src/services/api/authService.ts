import axiosInstance from './axiosInstance'
import type { IAuthService, LoginCredentials, RegisterData, AuthResponse } from '../interfaces/IAuthService'
import type { UserProfile } from '../../entities/user'

const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.response?.data?.errors) {
    const firstError = Object.values(error.response.data.errors)[0] as string[];
    throw new Error(firstError[0] || 'Validation failed');
  } else if (error.response?.status === 401) {
    throw new Error('Invalid email or password.');
  }
  throw new Error('An unexpected error occurred. Please try again.');
};

export const authService: IAuthService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const data = response.data

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return {
        token: data.token,
        user: data.user,
        needsApproval: data.needsApproval ?? false,
      }
    } catch (error) {
      handleApiError(error);
      throw error; // unreachable due to handleApiError
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      })

      const result = response.data

      // Save token only if not needing approval
      if (result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return {
        token: result.token ?? '',
        user: result.user,
        needsApproval: result.needsApproval ?? false,
      }
    } catch (error) {
      handleApiError(error);
      throw error; // unreachable
    }
  },

  async getMe(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get('/api/auth/me')
      return response.data
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
}
