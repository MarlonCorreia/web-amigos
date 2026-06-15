package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type CourseRepository interface {
	GetCourseWithContent(ctx context.Context, courseID string) (*models.Course, error)
	List(ctx context.Context, isPublished bool) ([]*models.Course, error)
	Create(ctx context.Context, course *models.Course) error
	GetCourse(ctx context.Context, courseID string) (*models.Course, error)
	Update(ctx context.Context, course *models.Course) error
	Delete(ctx context.Context, courseID string) error
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

func (r *courseRepository) GetCourse(ctx context.Context, courseID string) (*models.Course, error) {
	var course models.Course

	err := r.db.WithContext(ctx).Where("id = ?", courseID).First(&course).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *courseRepository) List(ctx context.Context, isPublished bool) ([]*models.Course, error) {
	var courses []*models.Course

	if isPublished == true {
		err := r.db.WithContext(ctx).Where("is_published = ?", isPublished).Find(&courses).Error
		if err != nil {
			return nil, err
		}
	} else {
		err := r.db.WithContext(ctx).Find(&courses).Error
		if err != nil {
			return nil, err
		}
	}

	return courses, nil
}

func (r *courseRepository) Create(ctx context.Context, course *models.Course) error {
	return r.db.WithContext(ctx).Create(course).Error
}

func (r *courseRepository) Update(ctx context.Context, course *models.Course) error {
	return r.db.WithContext(ctx).Save(course).Error
}

func (r *courseRepository) Delete(ctx context.Context, courseID string) error {
	return r.db.WithContext(ctx).Where("id = ?", courseID).Delete(&models.Course{}).Error
}
