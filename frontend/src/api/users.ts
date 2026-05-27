import { apiRequest } from './client'
import type { UserResponse, CreateUserRequest } from '../types/user'

export function createUser(data: CreateUserRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getUserByEmail(email: string): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/users?email=${encodeURIComponent(email)}`)
}

export function getUserById(id: string): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/users/${id}`)
}
