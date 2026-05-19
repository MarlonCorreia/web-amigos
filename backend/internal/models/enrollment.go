package models

import (
	"time"

	"github.com/google/uuid"
)

type Enrollment struct {
	ID                   uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID               uuid.UUID `gorm:"type:uuid;not null"`
	User                 User      `gorm:"foreignKey:UserID"`
	CourseID             uuid.UUID `gorm:"type:uuid;not null"`
	Course               Course    `gorm:"foreignKey:CourseID"`
	GatewayTransactionID string    `gorm:"type:varchar(255)"`
	Status               string    `gorm:"type:varchar(50);not null"` // Ex: active, desactive, expired, refunded, pending
	ExpiresAt            *time.Time
	CreatedAt            time.Time `gorm:"autoCreateTime"`
}
