import { useState } from 'react'
import { login as loginApi } from '../api/auth'
import { createUser } from '../api/users'
import type { UserResponse, CreateUserRequest } from '../types/user'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<UserResponse | null>(null)

  const isAuthenticated = !!token

  async function login(email: string, password: string) {
    const { token: authToken, ...userData } = await loginApi(email, password)
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(userData)
  }

  async function register(payload: CreateUserRequest) {
    return createUser(payload)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return { token, user, isAuthenticated, login, register, logout }
}
