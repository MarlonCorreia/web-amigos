import { apiRequest } from './client'
import type { CourseReview } from '../types/review'

export function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  return apiRequest<CourseReview[]>(`/courses/${courseId}/reviews`)
}
