export interface Course {
  id: string
  creator_id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  access_duration_days: number | null
  is_published: boolean
  created_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  position: number
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  description: string
  youtube_id: string
  duration_minutes: number
  position: number
  is_free: boolean
  created_at: string
}
