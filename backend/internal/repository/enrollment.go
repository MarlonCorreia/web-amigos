package repository

import (
	"context"

	"gorm.io/gorm"
)

type EnrollmentRepository interface {
	StatusCourseEnrollment(userID, courseID string) (string, error)
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
