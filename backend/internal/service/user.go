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

func (s *UserService) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	if email == "" {
		return nil, errors.New("email is required")
	}
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) GetByID(ctx context.Context, id string) (*models.User, error) {
	if id == "" {
		return nil, errors.New("id is required")
	}
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}
