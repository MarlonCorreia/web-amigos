export interface LessonComment {
  id: string
  lesson_id: string
  user_id: string
  user?: {
    id: string
    full_name: string
    email: string
  }
  content: string
  created_at: string
}
