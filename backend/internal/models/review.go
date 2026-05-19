package models

import (
	"time"

	"github.com/google/uuid"
)

type CourseReview struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID  uuid.UUID `gorm:"type:uuid;not null"`
	Course    Course    `gorm:"foreignKey:CourseID"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	User      User      `gorm:"foreignKey:UserID"`
	Rating    int       `gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Comment   string    `gorm:"type:text"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type CourseReviewPayload struct {
	CourseID string `json:"course_id" binding:"required,uuid"`
	Rating   int    `json:"rating" binding:"required,min=1,max=5"`
	Comment  string `json:"comment"`
}
