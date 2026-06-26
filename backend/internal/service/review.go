package service

import (
	"context"
	"courses/internal/middleware"
	"courses/internal/models"
	"courses/internal/repository"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

type ReviewService struct {
	r  repository.ReviewRepository
	er repository.EnrollmentRepository
}

func NewReviewService(r repository.ReviewRepository, er repository.EnrollmentRepository) *ReviewService {
	return &ReviewService{r: r, er: er}
}

func (s *ReviewService) CreateReview(ctx context.Context, payload *models.CourseReviewPayload) error {
	userIDStr, ok := ctx.Value(middleware.UserIDKey).(string)
	if !ok || userIDStr == "" {
		return errors.New("user ID not found in context")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		err = fmt.Errorf("invalid user id format: %w", err)
		return errors.New(err.Error())
	}

	courseID, err := uuid.Parse(payload.CourseID)
	if err != nil {
		err = fmt.Errorf("invalid course id format: %w", err)
		return errors.New(err.Error())
	}

	statusEnrollment, err := s.er.StatusCourseEnrollment(userIDStr, payload.CourseID)
	if err != nil {
		return err
	}
	if statusEnrollment != "active" {
		return errors.New("user is not enrolled in this course")
	}

	existingReviews, err := s.r.CourseReviews(ctx, payload.CourseID)
	if err == nil {
		for _, r := range existingReviews {
			if r.UserID == userID {
				return errors.New("user has already reviewed this course")
			}
		}
	}

	courseReview := &models.CourseReview{
		UserID:   userID,
		CourseID: courseID,
		Rating:   payload.Rating,
		Comment:  payload.Comment,
	}

	return s.r.Create(ctx, courseReview)
}

func (s *ReviewService) GetReviewByID(ctx context.Context, id string) (*models.CourseReview, error) {
	return s.r.GetByID(ctx, id)
}

func (s *ReviewService) UpdateReview(ctx context.Context, review *models.CourseReviewUpdatePayload, id string) error {
	existingReview, err := s.r.GetByID(ctx, id)
	if err != nil {
		return err
	}
	existingReview.Rating = review.Rating
	existingReview.Comment = review.Comment
	return s.r.Update(ctx, existingReview)
}

func (s *ReviewService) DeleteReview(ctx context.Context, id string) error {
	return s.r.Delete(ctx, id)
}
