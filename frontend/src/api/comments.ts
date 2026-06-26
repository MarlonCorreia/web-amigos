import { apiRequest } from './client'
import type { LessonComment } from '../types/comment'

export function getComments(lessonID: string): Promise<LessonComment[]> {
  return apiRequest<LessonComment[]>(`/courses/modules/lessons/${lessonID}/comments`)
}

export function createComment(lessonID: string, content: string): Promise<void> {
  return apiRequest<void>(`/courses/modules/lessons/${lessonID}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function deleteComment(commentID: string): Promise<void> {
  return apiRequest<void>(`/courses/comments/${commentID}`, {
    method: 'DELETE',
  })
}
