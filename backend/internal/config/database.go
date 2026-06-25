package config

import (
	"log"

	"courses/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	log.Println("✅ Conexão com o PostgreSQL estabelecida com sucesso!")

	err = db.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Module{},
		&models.Lesson{},
		&models.Enrollment{},
		&models.CourseReview{},
		&models.LessonComment{},
	)
	if err != nil {
		return nil, err
	}

	log.Println("✅ Tabelas sincronizadas e construídas com sucesso!")

	return db, nil
}
