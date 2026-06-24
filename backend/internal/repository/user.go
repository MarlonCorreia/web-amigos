package repository

import (
	"context"
	"courses/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByID(ctx context.Context, id string) (*models.User, error)
	List(ctx context.Context) ([]*models.User, error)
	Update(ctx context.Context, user *models.User) error
	IsCreatorWithCourses(ctx context.Context, userID string) (bool, error)
	DeleteTransaction(ctx context.Context, userID string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByID(ctx context.Context, userID string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("id = ?", userID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) List(ctx context.Context) ([]*models.User, error) {
	var users []*models.User
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&users).Error
	return users, err
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) IsCreatorWithCourses(ctx context.Context, userID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Table("courses").Where("creator_id = ?", userID).Count(&count).Error
	return count > 0, err
}

func (r *userRepository) DeleteTransaction(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete reviews
		if err := tx.Where("user_id = ?", userID).Delete(&models.CourseReview{}).Error; err != nil {
			return err
		}

		// Delete enrollments
		if err := tx.Where("user_id = ?", userID).Delete(&models.Enrollment{}).Error; err != nil {
			return err
		}

		// Delete user
		if err := tx.Where("id = ?", userID).Delete(&models.User{}).Error; err != nil {
			return err
		}

		return nil
	})
}
