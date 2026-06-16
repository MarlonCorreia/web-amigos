package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type ModuleRepository interface {
	Create(ctx context.Context, module *models.Module) error
	Update(ctx context.Context, module *models.Module) error
	Delete(ctx context.Context, id string) error
	GetModuleByID(ctx context.Context, id string) (*models.Module, error)
	ListModulesByCourseID(ctx context.Context, courseID string) ([]*models.Module, error)
}

type moduleRepository struct {
	db *gorm.DB
}

func NewModuleRepository(db *gorm.DB) *moduleRepository {
	return &moduleRepository{db: db}
}

func (r *moduleRepository) Create(ctx context.Context, module *models.Module) error {
	return r.db.WithContext(ctx).Create(module).Error
}

func (r *moduleRepository) Update(ctx context.Context, module *models.Module) error {
	return r.db.WithContext(ctx).Save(module).Error
}

func (r *moduleRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&models.Module{}).Error
}

func (r *moduleRepository) GetModuleByID(ctx context.Context, id string) (*models.Module, error) {
	var module models.Module
	err := r.db.WithContext(ctx).Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Order("position ASC")
	}).Where("id = ?", id).First(&module).Error
	if err != nil {
		return nil, err
	}
	return &module, nil
}

func (r *moduleRepository) ListModulesByCourseID(ctx context.Context, courseID string) ([]*models.Module, error) {
	var modules []*models.Module
	query := r.db.WithContext(ctx).Where("course_id = ?", courseID).Order("position ASC")

	err := query.Find(&modules).Error
	if err != nil {
		return nil, err
	}
	return modules, nil
}
