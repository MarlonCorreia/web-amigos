import { apiRequest } from './client'
import type { UserResponse, CreateUserRequest } from '../types/user'
import type { Enrollment } from '../types/enrollment'

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

export function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/users/me')
}

export function getUserEnrollments(): Promise<Enrollment[]> {
  return apiRequest<Enrollment[]>('/users/me/enrollments')
}

export function listUsers(): Promise<UserResponse[]> {
  return apiRequest<UserResponse[]>('/users')
}

export function updateUserRole(userId: string, role: 'admin' | 'creator' | 'student'): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export function deleteUser(userId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/users/${userId}`, {
    method: 'DELETE',
  })
}

export function updateProfile(data: { full_name: string; password?: string }): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteMe(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/users/me', {
    method: 'DELETE',
  })
}

