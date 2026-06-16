package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type LessonRepository interface {
	Create(ctx context.Context, lesson *models.Lesson) error
	GetByID(ctx context.Context, lessonID string) (*models.Lesson, error)
	ListByModuleID(ctx context.Context, moduleID string) ([]*models.Lesson, error)
	Update(ctx context.Context, lesson *models.Lesson) error
	Delete(ctx context.Context, lessonID string) error
}

type lessonRepository struct {
	db *gorm.DB
}

func NewLessonRepository(db *gorm.DB) LessonRepository {
	return &lessonRepository{db: db}
}

func (r *lessonRepository) Create(ctx context.Context, lesson *models.Lesson) error {
	return r.db.WithContext(ctx).Create(lesson).Error
}

func (r *lessonRepository) GetByID(ctx context.Context, lessonID string) (*models.Lesson, error) {
	var lesson models.Lesson
	err := r.db.WithContext(ctx).Where("id = ?", lessonID).First(&lesson).Error
	if err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *lessonRepository) ListByModuleID(ctx context.Context, moduleID string) ([]*models.Lesson, error) {
	var lessons []*models.Lesson
	err := r.db.WithContext(ctx).Where("module_id = ?", moduleID).Order("position ASC").Find(&lessons).Error
	if err != nil {
		return nil, err
	}
	return lessons, nil
}

func (r *lessonRepository) Update(ctx context.Context, lesson *models.Lesson) error {
	return r.db.WithContext(ctx).Save(lesson).Error
}

func (r *lessonRepository) Delete(ctx context.Context, lessonID string) error {
	return r.db.WithContext(ctx).Where("id = ?", lessonID).Delete(&models.Lesson{}).Error
}
