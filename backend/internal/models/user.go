package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email        string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	FullName     string    `gorm:"type:varchar(255);not null" json:"full_name"`
	Role         string    `gorm:"type:varchar(50);not null" json:"role"` // Ex: admin, creator, student
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`

	Courses     []Course       `gorm:"foreignKey:CreatorID" json:"courses,omitempty"`
	Enrollments []Enrollment   `gorm:"foreignKey:UserID" json:"enrollments,omitempty"`
	Reviews     []CourseReview `gorm:"foreignKey:UserID" json:"reviews,omitempty"`
}

type CreateUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	FullName string `json:"full_name" validate:"required"`
	Role     string `json:"role" validate:"required,oneof=admin creator student"`
}

type UpdateProfileRequest struct {
	FullName string `json:"full_name" validate:"required"`
	Password string `json:"password" validate:"omitempty,min=6"`
}

type UserLoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UserResponse struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
}

type UserResponseAuth struct {
	UserResponse
	Token string `json:"token"`
}
