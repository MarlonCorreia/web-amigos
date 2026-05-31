package service

import (
	"context"
	"courses/internal/models"
	"courses/internal/repository"
)

type CourseService struct {
	reviewRepo repository.ReviewRepository
	courseRepo repository.CourseRepository
}

func NewCourseService(reviewRepo repository.ReviewRepository, courseRepo repository.CourseRepository) *CourseService {
	return &CourseService{
		reviewRepo: reviewRepo,
		courseRepo: courseRepo,
	}
}

func (s *CourseService) GetCourseReviews(ctx context.Context, courseID string) ([]*models.CourseReview, error) {
	return s.reviewRepo.CourseReviews(ctx, courseID)
}

func (s *CourseService) GetCourseContent(ctx context.Context, courseID string) (*models.Course, error) {
	return s.courseRepo.GetCourseWithContent(ctx, courseID)
}
