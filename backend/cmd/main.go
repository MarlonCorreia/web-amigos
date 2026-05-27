package main

import (
	"courses/internal/handler"
	"courses/internal/router"
	"courses/internal/service"
	"fmt"
	"log"
	"net/http"

	"courses/internal/config"
	"courses/internal/repository"

	"github.com/go-playground/validator/v10"
)

func main() {
	env := config.LoadEnv()

	db, err := config.InitDB(env.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Falha crítica ao conectar no banco: %v", err)
	}

	validate := validator.New()

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService, validate)

	authService := service.NewAuthService(userRepo, env.JWTSecret)
	authHandler := handler.NewAuthHandler(authService)

	enrollRepo := repository.NewEnrollmentRepository(db)

	reviewRepo := repository.NewReviewRepository(db)
	reviewService := service.NewReviewService(reviewRepo, enrollRepo)
	reviewHandler := handler.NewReviewHandler(reviewService)

	courseRepo := repository.NewCourseRepository(db)
	courseService := service.NewCourseService(reviewRepo, courseRepo)
	courseHandler := handler.NewCourseHandler(courseService)

	r := router.SetupRouter(userHandler, authHandler, reviewHandler, courseHandler, env.JWTSecret, env.AllowedOrigins)

	port := fmt.Sprintf(":%s", env.APIPort)
	fmt.Printf("🚀 Servidor iniciado na porta %s\n", port)

	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatalf("❌ Erro ao iniciar servidor: %v", err)
	}
}
