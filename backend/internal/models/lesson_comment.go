package models

import (
	"time"

	"github.com/google/uuid"
)

type LessonComment struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	LessonID  uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

type CreateCommentRequest struct {
	Content string `json:"content"`
}
