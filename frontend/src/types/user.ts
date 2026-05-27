export interface UserResponse {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'creator' | 'student'
}

export interface UserResponseAuth extends UserResponse {
  token: string
}

export interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'creator' | 'student'
}
