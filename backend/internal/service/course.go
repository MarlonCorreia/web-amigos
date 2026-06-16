package service

import (
	"context"
	"courses/internal/models"
	"courses/internal/repository"
	"errors"
)

type CourseService struct {
	reviewRepo     repository.ReviewRepository
	courseRepo     repository.CourseRepository
	enrollmentRepo repository.EnrollmentRepository
}

func NewCourseService(reviewRepo repository.ReviewRepository, courseRepo repository.CourseRepository, enrollmentRepo repository.EnrollmentRepository) *CourseService {
	return &CourseService{
		reviewRepo:     reviewRepo,
		courseRepo:     courseRepo,
		enrollmentRepo: enrollmentRepo,
	}
}

func (s *CourseService) GetCourseReviews(ctx context.Context, courseID string) ([]*models.CourseReview, error) {
	return s.reviewRepo.CourseReviews(ctx, courseID)
}

func (s *CourseService) GetCourseContent(ctx context.Context, courseID string) (*models.Course, error) {
	return s.courseRepo.GetCourseWithContent(ctx, courseID)
}

func (s *CourseService) GetCourse(ctx context.Context, courseID string) (*models.CourseResponse, error) {
	course, err := s.courseRepo.GetCourseWithContent(ctx, courseID)
	if err != nil {
		return nil, err
	}

	response := &models.CourseResponse{
		ID:                 course.ID,
		Title:              course.Title,
		Description:        course.Description,
		CreatedAt:          course.CreatedAt,
		ThumbnailURL:       course.ThumbnailURL,
		AccessDurationDays: *course.AccessDurationDays,
		Price:              course.Price,
		GatewayProductID:   course.GatewayProductID,
		IsPublished:        course.IsPublished,
	}

	return response, nil
}

func (s *CourseService) List(ctx context.Context, IsPublished bool) ([]*models.CourseSimpleResponse, error) {
	courses, err := s.courseRepo.List(ctx, IsPublished)
	if err != nil {
		return nil, err
	}

	var coursesReponse []*models.CourseSimpleResponse

	for _, c := range courses {
		coursesReponse = append(coursesReponse, &models.CourseSimpleResponse{
			ID:                 c.ID,
			Title:              c.Title,
			Description:        c.Description,
			ThumbnailURL:       c.ThumbnailURL,
			Price:              c.Price,
			AccessDurationDays: *c.AccessDurationDays,
			IsPublished:        c.IsPublished,
		})
	}

	return coursesReponse, nil
}

func (s *CourseService) Create(ctx context.Context, req *models.CreateCourseRequest) (*models.CourseSimpleResponse, error) {

	course := &models.Course{
		Title:              req.Title,
		ThumbnailURL:       req.ThumbnailURL,
		Price:              *req.Price,
		IsPublished:        false,
		GatewayProductID:   req.GatewayProductID,
		Description:        req.Description,
		CreatorID:          req.CreatorID,
		AccessDurationDays: req.AccessDurationDays,
	}

	err := s.courseRepo.Create(ctx, course)
	if err != nil {
		return nil, err
	}

	response := &models.CourseSimpleResponse{
		ID:                 course.ID,
		Title:              course.Title,
		Description:        course.Description,
		ThumbnailURL:       course.ThumbnailURL,
		Price:              course.Price,
		AccessDurationDays: *course.AccessDurationDays,
		IsPublished:        course.IsPublished,
	}

	return response, nil
}

func (s *CourseService) Update(ctx context.Context, req *models.UpdateCourseRequest, courseID string) error {
	course, err := s.courseRepo.GetCourse(ctx, courseID)
	if err != nil {
		return err
	}

	if req.Title != "" {
		course.Title = req.Title
	}
	if req.Description != "" {
		course.Description = req.Description
	}
	if req.ThumbnailURL != "" {
		course.ThumbnailURL = req.ThumbnailURL
	}
	if req.CreatorID != nil {
		course.CreatorID = *req.CreatorID
	}
	if req.AccessDurationDays != nil {
		course.AccessDurationDays = req.AccessDurationDays
	}
	if req.Price != nil {
		course.Price = *req.Price
	}

	err = s.courseRepo.Update(ctx, course)
	if err != nil {
		return err
	}
	return nil

}

func (s *CourseService) Publish(ctx context.Context, courseID string) error {
	course, err := s.courseRepo.GetCourse(ctx, courseID)
	if err != nil {
		return err
	}

	if course.IsPublished {
		return nil
	}

	course.IsPublished = true
	err = s.courseRepo.Update(ctx, course)
	if err != nil {
		return err
	}

	return nil

}

func (s *CourseService) DeleteCourse(ctx context.Context, courseID string) error {
	count, err := s.enrollmentRepo.GetEnrollmentCountByCourse(ctx, courseID)
	if err != nil {
		return err
	}

	if count > 0 {
		return errors.New("Can't delete course with enrollment")
	}

	return s.courseRepo.Delete(ctx, courseID)
}
