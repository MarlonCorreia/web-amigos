export interface EnrollmentCourse {
  ID: string
  Title: string
  Description: string
  ThumbnailURL: string
  Price: number
  IsPublished: boolean
}

export interface Enrollment {
  ID: string
  UserID: string
  CourseID: string
  Course: EnrollmentCourse
  GatewayTransactionID: string
  Status: string
  ExpiresAt: string | null
  CreatedAt: string
}
