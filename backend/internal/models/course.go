package models

import (
	"time"

	"github.com/google/uuid"
)

type Course struct {
	ID                 uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CreatorID          uuid.UUID `gorm:"type:uuid;not null"`
	Creator            User      `gorm:"foreignKey:CreatorID"`
	Title              string    `gorm:"type:varchar(255);not null"`
	Description        string    `gorm:"type:text"`
	ThumbnailURL       string    `gorm:"type:varchar(255)"`
	GatewayProductID   string    `gorm:"type:varchar(255)"`
	Price              float64   `gorm:"type:decimal(10,2)"`
	AccessDurationDays *int
	IsPublished        bool      `gorm:"default:false"`
	CreatedAt          time.Time `gorm:"autoCreateTime"`

	Modules     []Module
	Lessons     []Lesson
	Enrollments []Enrollment
	Reviews     []CourseReview
}

type CreateCourseRequest struct {
	CreatorID          uuid.UUID `json:"creator" binding:"required,uui"`
	Title              string    `json:"title" binding:"required"`
	Description        string    `json:"description" binding:"required"`
	ThumbnailURL       string    `json:"thumbnail_url" binding:"required"`
	GatewayProductID   string    `json:"gateway_product_id" binding:"required"`
	Price              *float64  `json:"price" binding:"required"`
	AccessDurationDays *int      `json:"access_duration_days" binding:"required,min=1"`
}

type CourseResponse struct {
	ID                 uuid.UUID `json:"id"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	ThumbnailURL       string    `json:"thumbnail_url"`
	GatewayProductID   string    `json:"gateway_product_id"`
	CreatedAt          time.Time `json:"created_at"`
	Price              float64   `json:"price"`
	AccessDurationDays int       `json:"access_duration_days"`
	IsPublished        bool      `json:"is_published"`
}

type CourseSimpleResponse struct {
	ID                 uuid.UUID `json:"id"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	ThumbnailURL       string    `json:"thumbnail_url"`
	Price              float64   `json:"price"`
	AccessDurationDays int       `json:"access_duration_days"`
	IsPublished        bool      `json:"is_published"`
}

type UpdateCourseRequest struct {
	Title              string     `json:"title" binding:"omitempty"`
	CreatorID          *uuid.UUID `json:"creator_id" binding:"omitempty"`
	Description        string     `json:"description" binding:"omitempty"`
	ThumbnailURL       string     `json:"thumbnail_url" binding:"omitempty"`
	GatewayProductID   string     `json:"gateway_product_id"`
	Price              *float64   `json:"price,omitempty"`
	AccessDurationDays *int       `json:"access_duration_days,omitempty"`
}
