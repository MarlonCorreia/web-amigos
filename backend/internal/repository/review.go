package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type ReviewRepository interface {
	Create(ctx context.Context, review *models.CourseReview) error
	GetByID(ctx context.Context, id string) (*models.CourseReview, error)
	Update(ctx context.Context, review *models.CourseReview) error
	Delete(ctx context.Context, id string) error
	CourseReviews(ctx context.Context, courseID string) ([]*models.CourseReview, error)
}

type reviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) ReviewRepository {
	return &reviewRepository{db: db}
}

func (r *reviewRepository) Create(ctx context.Context, review *models.CourseReview) error {
	return r.db.WithContext(ctx).Create(review).Error
}

func (r *reviewRepository) GetByID(ctx context.Context, id string) (*models.CourseReview, error) {
	var review models.CourseReview
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) Update(ctx context.Context, review *models.CourseReview) error {
	return r.db.WithContext(ctx).Save(review).Error
}

func (r *reviewRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&models.CourseReview{}).Error
}

func (r *reviewRepository) CourseReviews(ctx context.Context, courseID string) ([]*models.CourseReview, error) {
	var reviews []*models.CourseReview
	err := r.db.WithContext(ctx).Preload("User").Where("course_id = ?", courseID).Find(&reviews).Error
	if err != nil {
		return nil, err
	}
	return reviews, nil
}
