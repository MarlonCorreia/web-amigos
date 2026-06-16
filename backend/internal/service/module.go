package service

import (
	"context"
	"courses/internal/models"
	"courses/internal/repository"

	"github.com/google/uuid"
)

type ModuleService struct {
	r repository.ModuleRepository
}

func NewModuleService(r repository.ModuleRepository) *ModuleService {
	return &ModuleService{r: r}
}

func (s *ModuleService) CreateModule(ctx context.Context, req *models.CreateModuleRequest) error {
	courseUUID, err := uuid.Parse(req.CourseID)
	if err != nil {
		return err
	}

	module := &models.Module{
		CourseID: courseUUID,
		Title:    req.Title,
		Position: *req.Position,
	}
	return s.r.Create(ctx, module)
}

func (s *ModuleService) GetModule(ctx context.Context, moduleID string) (*models.ModuleResponse, error) {
	module, err := s.r.GetModuleByID(ctx, moduleID)
	if err != nil {
		return nil, err
	}

	response := &models.ModuleResponse{
		ID:        module.ID,
		CourseID:  module.CourseID,
		Title:     module.Title,
		Position:  module.Position,
		CreatedAt: module.CreatedAt,
	}
	return response, nil
}

func (s *ModuleService) ListModules(ctx context.Context, courseID string) ([]*models.ModuleResponse, error) {
	modules, err := s.r.ListModulesByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	var moduleResponses []*models.ModuleResponse
	for _, m := range modules {
		moduleResponses = append(moduleResponses, &models.ModuleResponse{
			ID:        m.ID,
			CourseID:  m.CourseID,
			Title:     m.Title,
			Position:  m.Position,
			CreatedAt: m.CreatedAt,
		})
	}
	return moduleResponses, nil
}

func (s *ModuleService) UpdateModule(ctx context.Context, req *models.UpdateModuleRequest, moduleID string) error {
	module, err := s.r.GetModuleByID(ctx, moduleID)
	if err != nil {
		return err
	}

	if req.Title != "" {
		module.Title = req.Title
	}
	if req.Position != nil {
		module.Position = *req.Position
	}

	return s.r.Update(ctx, module)
}

func (s *ModuleService) DeleteModule(ctx context.Context, moduleID string) error {
	return s.r.Delete(ctx, moduleID)
}
