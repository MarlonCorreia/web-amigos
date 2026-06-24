package service

import (
	"context"
	"courses/internal/models"
	"courses/internal/repository"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var ErrEmailAlreadyExists = errors.New("email is already in use")

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Create(ctx context.Context, req *models.CreateUserRequest) error {

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	user := &models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Role:         req.Role,
	}

	err = s.repo.Create(ctx, user)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value") || strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return ErrEmailAlreadyExists
		}
		return err
	}

	return nil
}

func (s *UserService) GetByEmail(ctx context.Context, email string) (*models.UserResponse, error) {
	if email == "" {
		return nil, errors.New("email is required")
	}
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	response := &models.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     user.Role,
	}

	return response, nil
}

func (s *UserService) GetByID(ctx context.Context, id string) (*models.UserResponse, error) {
	if id == "" {
		return nil, errors.New("id is required")
	}
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	response := &models.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     user.Role,
	}

	return response, nil
}

func (s *UserService) List(ctx context.Context) ([]*models.UserResponse, error) {
	users, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}

	var response []*models.UserResponse
	for _, u := range users {
		response = append(response, &models.UserResponse{
			ID:       u.ID,
			Email:    u.Email,
			FullName: u.FullName,
			Role:     u.Role,
		})
	}
	return response, nil
}

func (s *UserService) UpdateRole(ctx context.Context, userID, newRole string) error {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return err
	}

	user.Role = newRole
	return s.repo.Update(ctx, user)
}

func (s *UserService) Delete(ctx context.Context, userID string) error {
	// Check if creator has active courses to prevent orphaning them
	hasCourses, err := s.repo.IsCreatorWithCourses(ctx, userID)
	if err != nil {
		return err
	}
	if hasCourses {
		return errors.New("não é possível excluir este usuário: este criador possui cursos ativos cadastrados. Exclua ou reatribua seus cursos primeiro")
	}

	// Safe transactional delete
	return s.repo.DeleteTransaction(ctx, userID)
}

func (s *UserService) UpdateProfile(ctx context.Context, userID string, req *models.UpdateProfileRequest) error {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return err
	}

	user.FullName = req.FullName

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return errors.New("failed to hash password")
		}
		user.PasswordHash = string(hashedPassword)
	}

	return s.repo.Update(ctx, user)
}
