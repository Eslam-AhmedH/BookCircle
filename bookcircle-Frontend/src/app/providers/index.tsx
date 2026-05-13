import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { ToastProvider } from './ToastContext'

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <ToastProvider>{children}</ToastProvider>
  </AuthProvider>
)
