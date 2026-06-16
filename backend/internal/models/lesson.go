package models

import (
	"time"

	"github.com/google/uuid"
)

type Lesson struct {
	ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ModuleID        uuid.UUID `gorm:"type:uuid;not null"`
	Module          Module    `gorm:"foreignKey:ModuleID"`
	CourseID        uuid.UUID `gorm:"type:uuid;not null"`
	Course          Course    `gorm:"foreignKey:CourseID"`
	Title           string    `gorm:"type:varchar(255);not null"`
	Description     string    `gorm:"type:text"`
	YoutubeID       string    `gorm:"type:varchar(255)"`
	DurationMinutes int
	Position        int       `gorm:"not null"`
	IsFree          bool      `gorm:"default:false"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
}

type CreateLessonRequest struct {
	ModuleID        string `json:"module_id"`
	Title           string `json:"title" validate:"required"`
	Description     string `json:"description"`
	YoutubeID       string `json:"youtube_id"`
	DurationMinutes *int   `json:"duration_minutes"`
	Position        *int   `json:"position" validate:"required"`
	IsFree          bool   `json:"is_free"`
}

type UpdateLessonRequest struct {
	Title           string `json:"title"`
	Description     string `json:"description"`
	YoutubeID       string `json:"youtube_id"`
	DurationMinutes *int   `json:"duration_minutes"`
	Position        *int   `json:"position"`
	IsFree          *bool  `json:"is_free"`
}

type LessonResponse struct {
	ID              uuid.UUID `json:"id"`
	ModuleID        uuid.UUID `json:"module_id"`
	CourseID        uuid.UUID `json:"course_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	YoutubeID       string    `json:"youtube_id"`
	DurationMinutes int       `json:"duration_minutes"`
	Position        int       `json:"position"`
	IsFree          bool      `json:"is_free"`
	CreatedAt       time.Time `json:"created_at"`
}
