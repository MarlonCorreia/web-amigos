package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type EnvConfig struct {
	APIPort        string
	DatabaseURL    string
	JWTSecret      string
	AllowedOrigins string
	FrontendURL    string
}

func LoadEnv() *EnvConfig {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("⚠️ Arquivo .env não encontrado. Utilizando variáveis de ambiente do sistema.")
	}

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("❌ A variável DATABASE_URL é obrigatória e não foi encontrada!")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("❌ A variável JWTSecret é obrigatória e não foi encontrada!")
	}

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	return &EnvConfig{
		APIPort:        port,
		DatabaseURL:    dbURL,
		JWTSecret:      jwtSecret,
		AllowedOrigins: allowedOrigins,
		FrontendURL:    frontendURL,
	}
}
