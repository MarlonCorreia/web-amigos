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
	BaseURL        string
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

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	return &EnvConfig{
		APIPort:        port,
		DatabaseURL:    dbURL,
		JWTSecret:      jwtSecret,
		AllowedOrigins: allowedOrigins,
		BaseURL:        baseURL,
	}
}
