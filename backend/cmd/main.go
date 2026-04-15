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
)

func main() {
	env := config.LoadEnv()

	db, err := config.InitDB(env.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Falha crítica ao conectar no banco: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	r := router.SetupRouter(userHandler)

	port := fmt.Sprintf(":%s", env.APIPort)
	fmt.Printf("🚀 Servidor iniciado na porta %s\n", port)

	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatalf("❌ Erro ao iniciar servidor: %v", err)
	}
}
