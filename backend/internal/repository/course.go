package repository

import "gorm.io/gorm"

type CourseRepository interface {
	// Crud
}

type courseRepository struct {
	db *gorm.DB
}
