/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserProfile } from '../../entities/user'
import { socketService } from '../../services'

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: UserProfile) => void
  logout: () => void
  updateUser: (updates: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('bc_user')
      return stored ? (JSON.parse(stored) as UserProfile) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bc_token')
  })

  const login = useCallback((newToken: string, newUser: UserProfile) => {
    localStorage.setItem('bc_token', newToken)
    localStorage.setItem('bc_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    socketService.connect(newToken)
    socketService.on('notification_new', (data) => {
      console.log('🔔 New notification received:', data)
      // Show toast or update UI
    })

    socketService.on('borrow_request_new', (data) => {
      console.log('🔔 New borrow request:', data)
      // You can use a toast here
      alert(`New borrow request for: ${data.bookTitle} from ${data.readerName}`)
    })

    socketService.on('borrow_request_accepted', (data) => {
      alert(`✅ Your request for "${data.bookTitle}" was ACCEPTED!`)
    })

    socketService.on('borrow_request_rejected', (data) => {
      alert(`❌ Your request for "${data.bookTitle}" was REJECTED`)
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bc_token')
    localStorage.removeItem('bc_user')
    setToken(null)
    setUser(null)
    socketService.disconnect()
  }, [])

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('bc_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      updateUser,
    }),
    [user, token, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
