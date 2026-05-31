package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type CourseRepository interface {
	GetCourseWithContent(ctx context.Context, courseID string) (*models.Course, error)
}

type courseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) GetCourseWithContent(ctx context.Context, courseID string) (*models.Course, error) {
	var course models.Course
	err := r.db.WithContext(ctx).
		Preload("Modules", func(db *gorm.DB) *gorm.DB {
			return db.Order("position ASC")
		}).
		Preload("Modules.Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("position ASC")
		}).
		Where("id = ?", courseID).
		First(&course).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}
