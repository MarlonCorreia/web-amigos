import { apiRequest } from './client'
import type { CourseReview, CreateReviewPayload, UpdateReviewPayload } from '../types/review'

export function createReview(data: CreateReviewPayload): Promise<CourseReview> {
  return apiRequest<CourseReview>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getReviewById(id: string): Promise<CourseReview> {
  return apiRequest<CourseReview>(`/reviews/${id}`)
}

export function updateReview(id: string, data: UpdateReviewPayload): Promise<CourseReview> {
  return apiRequest<CourseReview>(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteReview(id: string): Promise<void> {
  return apiRequest<void>(`/reviews/${id}`, {
    method: 'DELETE',
  })
}
