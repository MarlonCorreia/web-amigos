package main

import (
	"courses/internal/config"
	"courses/internal/models"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("erro ao gerar hash: %v", err)
	}
	return string(hash)
}

func main() {
	env := config.LoadEnv()

	db, err := config.InitDB(env.DatabaseURL)
	if err != nil {
		log.Fatalf("erro ao conectar no banco: %v", err)
	}

	// Usuários
	creator := models.User{
		Email:        "creator@test.com",
		PasswordHash: hashPassword("password123"),
		FullName:     "Creator",
		Role:         "creator",
	}
	student := models.User{
		Email:        "student@test.com",
		PasswordHash: hashPassword("password123"),
		FullName:     "Student",
		Role:         "student",
	}
	admin := models.User{
		Email:        "admin@test.com",
		PasswordHash: hashPassword("password123"),
		FullName:     "Admin",
		Role:         "admin",
	}

	for _, u := range []*models.User{&creator, &student, &admin} {
		if err := db.Where(models.User{Email: u.Email}).FirstOrCreate(u).Error; err != nil {
			log.Fatalf("erro ao criar usuário %s: %v", u.Email, err)
		}
	}

	// Cursos
	durationDays := 365
	course1 := models.Course{
		CreatorID:          creator.ID,
		Title:              "Go do Zero ao Avançado",
		Description:        "Aprenda Go do básico ao avançado com projetos reais.",
		Price:              199.90,
		AccessDurationDays: &durationDays,
		IsPublished:        true,
	}
	course2 := models.Course{
		CreatorID:          creator.ID,
		Title:              "React com Next.js",
		Description:        "Construa aplicações modernas com React e Next.js.",
		Price:              149.90,
		AccessDurationDays: &durationDays,
		IsPublished:        true,
	}

	for _, c := range []*models.Course{&course1, &course2} {
		if err := db.Where(models.Course{Title: c.Title}).FirstOrCreate(c).Error; err != nil {
			log.Fatalf("erro ao criar curso %s: %v", c.Title, err)
		}
	}

	// Módulos
	modules := []models.Module{
		{CourseID: course1.ID, Title: "Fundamentos do Go", Position: 1},
		{CourseID: course1.ID, Title: "Concorrência", Position: 2},
		{CourseID: course2.ID, Title: "Fundamentos do React", Position: 1},
		{CourseID: course2.ID, Title: "Server Components", Position: 2},
	}

	for i := range modules {
		if err := db.Where(models.Module{CourseID: modules[i].CourseID, Position: modules[i].Position}).FirstOrCreate(&modules[i]).Error; err != nil {
			log.Fatalf("erro ao criar módulo: %v", err)
		}
	}

	// Aulas
	lessons := []models.Lesson{
		{ModuleID: modules[0].ID, CourseID: course1.ID, Title: "Instalação e configuração", Position: 1, DurationMinutes: 10, IsFree: true},
		{ModuleID: modules[0].ID, CourseID: course1.ID, Title: "Tipos e variáveis", Position: 2, DurationMinutes: 20},
		{ModuleID: modules[1].ID, CourseID: course1.ID, Title: "Goroutines", Position: 1, DurationMinutes: 30},
		{ModuleID: modules[2].ID, CourseID: course2.ID, Title: "Componentes e Props", Position: 1, DurationMinutes: 15, IsFree: true},
		{ModuleID: modules[3].ID, CourseID: course2.ID, Title: "use server e use client", Position: 1, DurationMinutes: 25},
	}

	for i := range lessons {
		if err := db.Where(models.Lesson{ModuleID: lessons[i].ModuleID, Position: lessons[i].Position}).FirstOrCreate(&lessons[i]).Error; err != nil {
			log.Fatalf("erro ao criar aula: %v", err)
		}
	}

	// Matrículas
	enrollment := models.Enrollment{
		UserID:   student.ID,
		CourseID: course1.ID,
		Status:   "active",
	}
	if err := db.Where(models.Enrollment{UserID: student.ID, CourseID: course1.ID}).FirstOrCreate(&enrollment).Error; err != nil {
		log.Fatalf("erro ao criar matrícula: %v", err)
	}

	// Reviews
	reviews := []models.CourseReview{
		{CourseID: course1.ID, UserID: student.ID, Rating: 5, Comment: "Excelente curso!"},
		{CourseID: course2.ID, UserID: student.ID, Rating: 4, Comment: "Muito bom, recomendo."},
	}
	for i := range reviews {
		if err := db.Where(models.CourseReview{CourseID: reviews[i].CourseID, UserID: reviews[i].UserID}).FirstOrCreate(&reviews[i]).Error; err != nil {
			log.Fatalf("erro ao criar review: %v", err)
		}
	}

	log.Println("✅ Seed concluído!")
	log.Println("   admin@test.com   / password123")
	log.Println("   creator@test.com / password123")
	log.Println("   student@test.com / password123")
}
