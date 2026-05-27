import { apiRequest } from './client'
import type { UserResponseAuth } from '../types/user'

export function login(email: string, password: string): Promise<UserResponseAuth> {
  return apiRequest<UserResponseAuth>('/auth', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
