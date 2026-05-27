package repository

import (
	"context"
	"courses/internal/models"
	"time"

	"gorm.io/gorm"
)

type EnrollmentRepository interface {
	StatusCourseEnrollment(userID, courseID string) (string, error)
	CreateEnrollment(ctx context.Context, enrollment *models.Enrollment) error
	GetEnrollmentByUserAndCourse(ctx context.Context, userID, courseID string) (*models.Enrollment, error)
	ActivateEnrollmentByTransaction(ctx context.Context, transactionID string, expiresAt time.Time) error
}

type enrollmentRepository struct {
	db *gorm.DB
}

func NewEnrollmentRepository(db *gorm.DB) EnrollmentRepository {
	return &enrollmentRepository{db: db}
}

func (r *enrollmentRepository) StatusCourseEnrollment(userID, courseID string) (string, error) {
	var enrollment struct {
		Status string
	}
	err := r.db.WithContext(context.Background()).
		Table("enrollments").
		Select("status").
		Where("user_id = ? AND course_id = ?", userID, courseID).
		First(&enrollment).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "not enrolled", nil
		}
		return "", err
	}
	return enrollment.Status, nil
}

func (r *enrollmentRepository) CreateEnrollment(ctx context.Context, enrollment *models.Enrollment) error {
	return r.db.WithContext(ctx).Create(enrollment).Error
}

func (r *enrollmentRepository) GetEnrollmentByUserAndCourse(ctx context.Context, userID, courseID string) (*models.Enrollment, error) {
	var enrollment models.Enrollment
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Order("created_at DESC").
		First(&enrollment).Error
	if err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *enrollmentRepository) ActivateEnrollmentByTransaction(ctx context.Context, transactionID string, expiresAt time.Time) error {
	return r.db.WithContext(ctx).
		Model(&models.Enrollment{}).
		Where("gateway_transaction_id = ?", transactionID).
		Updates(map[string]any{
			"status":     "active",
			"expires_at": expiresAt,
		}).Error
}
