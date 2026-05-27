export interface CourseReview {
  id: string
  course_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface CreateReviewPayload {
  course_id: string
  rating: number
  comment?: string
}

export interface UpdateReviewPayload {
  rating: number
  comment?: string
}
