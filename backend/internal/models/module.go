package models

import (
	"time"

	"github.com/google/uuid"
)

type Module struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID  uuid.UUID `gorm:"type:uuid;not null"`
	Course    Course    `gorm:"foreignKey:CourseID"`
	Title     string    `gorm:"type:varchar(255);not null"`
	Position  int       `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	Lessons []Lesson
}

type CreateModuleRequest struct {
	CourseID string `json:"course_id"`
	Title    string `json:"title" validate:"required"`
	Position *int   `json:"position" validate:"required"`
}

type UpdateModuleRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Position    *int   `json:"position"`
}

type ModuleResponse struct {
	ID        uuid.UUID `json:"id"`
	CourseID  uuid.UUID `json:"course_id"`
	Title     string    `json:"title"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}
