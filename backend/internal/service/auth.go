package service

import (
	"context"
	"errors"
	"time"

	"courses/internal/models"
	"courses/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	r         repository.UserRepository
	jwtSecret []byte
}

func NewAuthService(r repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{r: r, jwtSecret: []byte(jwtSecret)}
}

func (s *AuthService) Authenticate(ctx context.Context, payload *models.UserLoginRequest) (*models.UserResponseAuth, error) {
	user, err := s.r.FindByEmail(ctx, payload.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(payload.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	claims := jwt.MapClaims{
		"sub":  user.ID.String(),
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 3).Unix(),
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &models.UserResponseAuth{
		UserResponse: models.UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			FullName: user.FullName,
			Role:     user.Role,
		},
		Token: tokenString,
	}, nil
}
