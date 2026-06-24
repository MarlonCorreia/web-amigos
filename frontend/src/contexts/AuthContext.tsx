import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as loginApi } from '../api/auth'
import { createUser, getMe } from '../api/users'
import type { UserResponse, CreateUserRequest } from '../types/user'

interface AuthContextValue {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: CreateUserRequest) => Promise<unknown>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<UserResponse | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? (JSON.parse(stored) as UserResponse) : null
  })
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem('token'))

  const isAuthenticated = !!token

  useEffect(() => {
    async function validateSession() {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const freshUser = await getMe()
          setUser(freshUser)
          localStorage.setItem('user', JSON.stringify(freshUser))
        } catch (error) {
          console.error('Falha na validação da sessão:', error)
          logout()
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    validateSession()
  }, [])

  async function login(email: string, password: string) {
    const { token: authToken, ...userData } = await loginApi(email, password)
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
  }

  async function register(payload: CreateUserRequest) {
    return createUser(payload)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return ctx
}

