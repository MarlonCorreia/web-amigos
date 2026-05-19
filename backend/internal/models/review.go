package models

import (
	"time"

	"github.com/google/uuid"
)

type CourseReview struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID  uuid.UUID `json:"course_id" gorm:"type:uuid;not null"`
	Course    *Course   `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	User      *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Rating    int       `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Comment   string    `json:"comment" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type CourseReviewPayload struct {
	CourseID string `json:"course_id" binding:"required,uuid"`
	Rating   int    `json:"rating" binding:"required,min=1,max=5"`
	Comment  string `json:"comment"`
}

type CourseReviewUpdatePayload struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}
