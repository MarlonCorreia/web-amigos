package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type LessonCommentRepository interface {
	Create(ctx context.Context, comment *models.LessonComment) error
	GetByID(ctx context.Context, id string) (*models.LessonComment, error)
	Delete(ctx context.Context, id string) error
	ListByLessonID(ctx context.Context, lessonID string) ([]*models.LessonComment, error)
}

type lessonCommentRepository struct {
	db *gorm.DB
}

func NewLessonCommentRepository(db *gorm.DB) LessonCommentRepository {
	return &lessonCommentRepository{db: db}
}

func (r *lessonCommentRepository) Create(ctx context.Context, comment *models.LessonComment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *lessonCommentRepository) GetByID(ctx context.Context, id string) (*models.LessonComment, error) {
	var comment models.LessonComment
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&comment).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *lessonCommentRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&models.LessonComment{}).Error
}

func (r *lessonCommentRepository) ListByLessonID(ctx context.Context, lessonID string) ([]*models.LessonComment, error) {
	var comments []*models.LessonComment
	err := r.db.WithContext(ctx).Preload("User").Where("lesson_id = ?", lessonID).Order("created_at DESC").Find(&comments).Error
	if err != nil {
		return nil, err
	}
	return comments, nil
}
