import { apiRequest } from './client'
import type { CourseReview } from '../types/review'

export interface CourseResponse {
  id: string
  creator_id: string
  title: string
  description: string
  thumbnail_url: string
  gateway_product_id?: string
  price: number
  access_duration_days: number
  is_published: boolean
}

export interface CourseSimpleResponse {
  id: string
  creator_id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  access_duration_days: number
  is_published: boolean
}

export interface ModuleResponse {
  id: string
  course_id: string
  title: string
  position: number
}

export interface LessonResponse {
  id: string
  module_id: string
  course_id: string
  title: string
  description: string
  youtube_id: string
  duration_minutes: number
  position: number
  is_free: boolean
}

// Course details including preloaded content (for enrolled users)
export interface CourseContentResponse {
  ID: string
  Title: string
  Description: string
  ThumbnailURL: string
  Price: number
  Modules: Array<{
    ID: string
    Title: string
    Position: number
    Lessons: Array<{
      ID: string
      Title: string
      Description: string
      YoutubeID: string
      DurationMinutes: number
      Position: number
      IsFree: boolean
    }>
  }>
}

export interface EnrollmentStatus {
  ID: string
  UserID: string
  CourseID: string
  Status: string // "active", "pending", etc.
}

export interface EnrollResponse {
  transaction_id: string
  status: string
  payment_url: string
  qr_code_url: string
}

export function listCourses(publishedOnly = true): Promise<CourseSimpleResponse[]> {
  // Fetch only published courses by default, or all courses if false
  const url = publishedOnly ? '/courses?published=true' : '/courses'
  return apiRequest<CourseSimpleResponse[]>(url)
}

export function getCourseDetails(courseId: string): Promise<CourseResponse> {
  return apiRequest<CourseResponse>(`/courses/${courseId}`)
}

export function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  return apiRequest<CourseReview[]>(`/courses/${courseId}/reviews`)
}

export function getCourseModules(courseId: string): Promise<ModuleResponse[]> {
  return apiRequest<ModuleResponse[]>(`/courses/${courseId}/modules`)
}

export function getModuleLessons(moduleId: string): Promise<LessonResponse[]> {
  return apiRequest<LessonResponse[]>(`/courses/modules/${moduleId}/lessons`)
}

export function getCourseContent(courseId: string): Promise<CourseContentResponse> {
  return apiRequest<CourseContentResponse>(`/courses/${courseId}/content`)
}

export function getEnrollmentStatus(courseId: string): Promise<EnrollmentStatus> {
  return apiRequest<EnrollmentStatus>(`/courses/${courseId}/enroll`)
}

export function enrollInCourse(courseId: string): Promise<EnrollResponse> {
  return apiRequest<EnrollResponse>(`/courses/${courseId}/enroll`, {
    method: 'POST',
  })
}

export interface CreateCourseRequest {
  creator: string
  title: string
  description: string
  thumbnail_url: string
  gateway_product_id: string
  price: number
  access_duration_days: number
}

export function createCourse(data: CreateCourseRequest): Promise<CourseSimpleResponse> {
  return apiRequest<CourseSimpleResponse>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export interface UpdateCourseRequest {
  title?: string
  creator_id?: string
  description?: string
  thumbnail_url?: string
  gateway_product_id?: string
  price?: number
  access_duration_days?: number
}

export function updateCourse(courseId: string, data: UpdateCourseRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteCourse(courseId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/${courseId}`, {
    method: 'DELETE',
  })
}

export function publishCourse(courseId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/${courseId}/publish`, {
    method: 'PATCH',
  })
}

export interface CreateModuleRequest {
  title: string
  position: number
}

export interface UpdateModuleRequest {
  title?: string
  position?: number
}

export function createModule(courseId: string, data: CreateModuleRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateModule(moduleId: string, data: UpdateModuleRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/modules/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteModule(moduleId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/modules/${moduleId}`, {
    method: 'DELETE',
  })
}

export interface CreateLessonRequest {
  title: string
  description: string
  youtube_id: string
  duration_minutes: number
  position: number
  is_free: boolean
}

export interface UpdateLessonRequest {
  title?: string
  description?: string
  youtube_id?: string
  duration_minutes?: number
  position?: number
  is_free?: boolean
}

export function createLesson(moduleId: string, data: CreateLessonRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/modules/${moduleId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateLesson(lessonId: string, data: UpdateLessonRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/modules/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteLesson(lessonId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/modules/lessons/${lessonId}`, {
    method: 'DELETE',
  })
}

