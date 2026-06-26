package service

import (
	"context"
	"courses/internal/middleware"
	"courses/internal/models"
	"courses/internal/repository"
	"errors"

	"github.com/google/uuid"
)

type LessonCommentService struct {
	r  repository.LessonCommentRepository
	er repository.EnrollmentRepository
	lr repository.LessonRepository
}

func NewLessonCommentService(r repository.LessonCommentRepository, er repository.EnrollmentRepository, lr repository.LessonRepository) *LessonCommentService {
	return &LessonCommentService{r: r, er: er, lr: lr}
}

func (s *LessonCommentService) checkAccess(ctx context.Context, lessonID string) error {
	userRole, _ := ctx.Value(middleware.UserRoleKey).(string)
	if userRole == "admin" || userRole == "creator" {
		return nil
	}

	lesson, err := s.lr.GetByID(ctx, lessonID)
	if err != nil {
		return err
	}

	userID, _ := ctx.Value(middleware.UserIDKey).(string)
	hasEnrollment, err := s.er.HasActiveEnrollment(ctx, userID, lesson.CourseID.String())
	if err != nil {
		return err
	}
	if !hasEnrollment {
		return errors.New("access denied")
	}

	return nil
}

func (s *LessonCommentService) CreateComment(ctx context.Context, lessonID string, req *models.CreateCommentRequest) error {
	if req.Content == "" {
		return errors.New("content is required")
	}

	if err := s.checkAccess(ctx, lessonID); err != nil {
		return err
	}

	userID, _ := ctx.Value(middleware.UserIDKey).(string)

	lessonUUID, err := uuid.Parse(lessonID)
	if err != nil {
		return errors.New("invalid lesson id format")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user id format")
	}

	comment := &models.LessonComment{
		LessonID: lessonUUID,
		UserID:   userUUID,
		Content:  req.Content,
	}

	return s.r.Create(ctx, comment)
}

func (s *LessonCommentService) ListComments(ctx context.Context, lessonID string) ([]*models.LessonComment, error) {
	if err := s.checkAccess(ctx, lessonID); err != nil {
		return nil, err
	}
	return s.r.ListByLessonID(ctx, lessonID)
}

func (s *LessonCommentService) DeleteComment(ctx context.Context, commentID string) error {
	comment, err := s.r.GetByID(ctx, commentID)
	if err != nil {
		return err
	}

	userID, _ := ctx.Value(middleware.UserIDKey).(string)
	userRole, _ := ctx.Value(middleware.UserRoleKey).(string)

	if userRole == "admin" {
		return s.r.Delete(ctx, commentID)
	}
	if userID == comment.UserID.String() {
		return s.r.Delete(ctx, commentID)
	}
	if userRole == "creator" {
		return s.r.Delete(ctx, commentID)
	}

	return errors.New("forbidden")
}
