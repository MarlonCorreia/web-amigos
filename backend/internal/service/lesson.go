package service

import (
	"context"
	"courses/internal/models"
	"courses/internal/repository"
)

type LessonService struct {
	r          repository.LessonRepository
	moduleRepo repository.ModuleRepository
}

func NewLessonService(r repository.LessonRepository, moduleRepo repository.ModuleRepository) *LessonService {
	return &LessonService{r: r, moduleRepo: moduleRepo}
}

func (s *LessonService) CreateLesson(ctx context.Context, req *models.CreateLessonRequest) error {
	module, err := s.moduleRepo.GetModuleByID(ctx, req.ModuleID)
	if err != nil {
		return err
	}

	lesson := &models.Lesson{
		CourseID:        module.CourseID,
		ModuleID:        module.ID,
		Title:           req.Title,
		Description:     req.Description,
		YoutubeID:       req.YoutubeID,
		DurationMinutes: *req.DurationMinutes,
		Position:        *req.Position,
		IsFree:          req.IsFree,
	}
	return s.r.Create(ctx, lesson)
}

func (s *LessonService) GetLesson(ctx context.Context, lessonID string) (*models.LessonResponse, error) {
	lesson, err := s.r.GetByID(ctx, lessonID)
	if err != nil {
		return nil, err
	}

	response := &models.LessonResponse{
		ID:              lesson.ID,
		ModuleID:        lesson.ModuleID,
		CourseID:        lesson.CourseID,
		Title:           lesson.Title,
		Description:     lesson.Description,
		YoutubeID:       lesson.YoutubeID,
		DurationMinutes: lesson.DurationMinutes,
		Position:        lesson.Position,
		IsFree:          lesson.IsFree,
		CreatedAt:       lesson.CreatedAt,
	}
	return response, nil
}

func (s *LessonService) ListLessonsByModuleID(ctx context.Context, moduleID string) ([]*models.LessonResponse, error) {
	lessons, err := s.r.ListByModuleID(ctx, moduleID)
	if err != nil {
		return nil, err
	}

	var lessonResponses []*models.LessonResponse
	for _, l := range lessons {
		lessonResponses = append(lessonResponses, &models.LessonResponse{
			ID:              l.ID,
			ModuleID:        l.ModuleID,
			CourseID:        l.CourseID,
			Title:           l.Title,
			Description:     l.Description,
			YoutubeID:       l.YoutubeID,
			DurationMinutes: l.DurationMinutes,
			Position:        l.Position,
			IsFree:          l.IsFree,
			CreatedAt:       l.CreatedAt,
		})
	}
	return lessonResponses, nil
}

func (s *LessonService) UpdateLesson(ctx context.Context, req *models.UpdateLessonRequest, lessonID string) error {
	lesson, err := s.r.GetByID(ctx, lessonID)
	if err != nil {
		return err
	}

	if req.Title != "" {
		lesson.Title = req.Title
	}
	if req.Description != "" {
		lesson.Description = req.Description
	}
	if req.YoutubeID != "" {
		lesson.YoutubeID = req.YoutubeID
	}
	if req.DurationMinutes != nil {
		lesson.DurationMinutes = *req.DurationMinutes
	}
	if req.Position != nil {
		lesson.Position = *req.Position
	}
	if req.IsFree != nil {
		lesson.IsFree = *req.IsFree
	}

	return s.r.Update(ctx, lesson)
}

func (s *LessonService) DeleteLesson(ctx context.Context, lessonID string) error {
	return s.r.Delete(ctx, lessonID)
}
