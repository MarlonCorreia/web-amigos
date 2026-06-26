package main

import (
	"courses/internal/config"
	"courses/internal/models"
	"log"
	"time"

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

	// -------------------------------------------------------------------------
	// Usuários
	// -------------------------------------------------------------------------
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
	creator2 := models.User{
		Email:        "creator2@test.com",
		PasswordHash: hashPassword("password123"),
		FullName:     "Eduardo Creator",
		Role:         "creator",
	}
	student2 := models.User{
		Email:        "student2@test.com",
		PasswordHash: hashPassword("password123"),
		FullName:     "Maria Student",
		Role:         "student",
	}
	student3 := models.User{
		Email:        "student3@test.com",
		PasswordHash: hashPassword("password123"),
		FullName:     "Pedro Student",
		Role:         "student",
	}

	for _, u := range []*models.User{&creator, &student, &admin, &creator2, &student2, &student3} {
		if err := db.Where(models.User{Email: u.Email}).FirstOrCreate(u).Error; err != nil {
			log.Fatalf("erro ao criar usuário %s: %v", u.Email, err)
		}
	}

	// -------------------------------------------------------------------------
	// Cursos
	// -------------------------------------------------------------------------
	durationDays365 := 365
	durationDays180 := 180
	durationDays90 := 90

	course1 := models.Course{
		CreatorID:          creator.ID,
		Title:              "Go do Zero ao Avançado",
		Description:        "Aprenda Go do básico ao avançado com projetos reais.",
		Price:              199.90,
		AccessDurationDays: &durationDays365,
		IsPublished:        true,
		ThumbnailURL:       "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
		GatewayProductID:   "prod_go_zero",
	}
	course2 := models.Course{
		CreatorID:          creator2.ID,
		Title:              "React com Next.js",
		Description:        "Construa aplicações modernas com React e Next.js.",
		Price:              149.90,
		AccessDurationDays: &durationDays365,
		IsPublished:        true,
		ThumbnailURL:       "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
		GatewayProductID:   "prod_react_next",
	}
	course3 := models.Course{
		CreatorID:          creator.ID,
		Title:              "Concorrência em Go",
		Description:        "Domine goroutines, channels e sincronização em Go.",
		Price:              149.90,
		AccessDurationDays: &durationDays180,
		IsPublished:        true,
		ThumbnailURL:       "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
		GatewayProductID:   "prod_concorrencia_go",
	}
	course4 := models.Course{
		CreatorID:          creator2.ID,
		Title:              "TypeScript na Prática",
		Description:        "Aprenda TypeScript com exemplos práticos e projetos reais.",
		Price:              99.90,
		AccessDurationDays: &durationDays90,
		IsPublished:        true,
		ThumbnailURL:       "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
		GatewayProductID:   "prod_typescript",
	}

	for _, c := range []*models.Course{&course1, &course2, &course3, &course4} {
		if err := db.Where(models.Course{Title: c.Title}).FirstOrCreate(c).Error; err != nil {
			log.Fatalf("erro ao criar curso %s: %v", c.Title, err)
		}
	}

	// Update ThumbnailURL and GatewayProductID for existing courses (idempotent)
	if err := db.Model(&course1).Updates(models.Course{
		ThumbnailURL:     "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
		GatewayProductID: "prod_go_zero",
	}).Error; err != nil {
		log.Printf("warn: failed to update course1: %v", err)
	}
	if err := db.Model(&course2).Updates(models.Course{
		ThumbnailURL:     "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
		GatewayProductID: "prod_react_next",
	}).Error; err != nil {
		log.Printf("warn: failed to update course2: %v", err)
	}

	// -------------------------------------------------------------------------
	// Módulos
	// -------------------------------------------------------------------------
	modules := []models.Module{
		{CourseID: course1.ID, Title: "Fundamentos do Go", Position: 1},
		{CourseID: course1.ID, Title: "Concorrência", Position: 2},
		{CourseID: course2.ID, Title: "Fundamentos do React", Position: 1},
		{CourseID: course2.ID, Title: "Server Components", Position: 2},
		{CourseID: course3.ID, Title: "Goroutines e Channels", Position: 1},
		{CourseID: course3.ID, Title: "Sync e Select", Position: 2},
		{CourseID: course4.ID, Title: "Tipos Básicos", Position: 1},
		{CourseID: course4.ID, Title: "Generics e Utilitários", Position: 2},
	}

	for i := range modules {
		if err := db.Where(models.Module{CourseID: modules[i].CourseID, Title: modules[i].Title}).FirstOrCreate(&modules[i]).Error; err != nil {
			log.Fatalf("erro ao criar módulo: %v", err)
		}
	}

	// Aliases for readability
	modFundGo := modules[0]      // Fundamentos do Go (course1)
	modConcGo := modules[1]      // Concorrência (course1)
	modFundReact := modules[2]   // Fundamentos do React (course2)
	modServerComp := modules[3]  // Server Components (course2)
	modGoroutines := modules[4]  // Goroutines e Channels (course3)
	modSync := modules[5]        // Sync e Select (course3)
	modTipos := modules[6]       // Tipos Básicos (course4)
	modGenerics := modules[7]    // Generics e Utilitários (course4)

	// -------------------------------------------------------------------------
	// Aulas
	// -------------------------------------------------------------------------
	lessons := []models.Lesson{
		// course1 / Fundamentos do Go
		{ModuleID: modFundGo.ID, CourseID: course1.ID, Title: "Instalação e configuração", Position: 1, YoutubeID: "un6ZyFkqFKo", DurationMinutes: 10, IsFree: true},
		{ModuleID: modFundGo.ID, CourseID: course1.ID, Title: "Tipos e variáveis", Position: 2, DurationMinutes: 20},
		// course1 / Concorrência
		{ModuleID: modConcGo.ID, CourseID: course1.ID, Title: "Goroutines", Position: 1, DurationMinutes: 30},
		// course2 / Fundamentos do React
		{ModuleID: modFundReact.ID, CourseID: course2.ID, Title: "Componentes e Props", Position: 1, DurationMinutes: 15, IsFree: true},
		// course2 / Server Components
		{ModuleID: modServerComp.ID, CourseID: course2.ID, Title: "use server e use client", Position: 1, DurationMinutes: 25},
		// course3 / Goroutines e Channels
		{ModuleID: modGoroutines.ID, CourseID: course3.ID, Title: "Introdução a Goroutines", Position: 1, YoutubeID: "f6kdp27TYZs", DurationMinutes: 12, IsFree: true},
		{ModuleID: modGoroutines.ID, CourseID: course3.ID, Title: "Channels Básicos", Position: 2, YoutubeID: "LvgVSSpwND8", DurationMinutes: 18, IsFree: false},
		// course3 / Sync e Select
		{ModuleID: modSync.ID, CourseID: course3.ID, Title: "WaitGroup e Mutex", Position: 1, YoutubeID: "oV9rvDllKEg", DurationMinutes: 22, IsFree: true},
		{ModuleID: modSync.ID, CourseID: course3.ID, Title: "Select Statement", Position: 2, YoutubeID: "B9uR2gLM80E", DurationMinutes: 16, IsFree: false},
		// course4 / Tipos Básicos
		{ModuleID: modTipos.ID, CourseID: course4.ID, Title: "Introdução ao TypeScript", Position: 1, YoutubeID: "sTX0UEplF54", DurationMinutes: 20, IsFree: true},
		{ModuleID: modTipos.ID, CourseID: course4.ID, Title: "Interfaces e Types", Position: 2, YoutubeID: "ahCwqrYpIuM", DurationMinutes: 25, IsFree: false},
		// course4 / Generics e Utilitários
		{ModuleID: modGenerics.ID, CourseID: course4.ID, Title: "Generics na Prática", Position: 1, YoutubeID: "nVAaxZ34khk", DurationMinutes: 30, IsFree: true},
	}

	for i := range lessons {
		if err := db.Where(models.Lesson{ModuleID: lessons[i].ModuleID, Title: lessons[i].Title}).FirstOrCreate(&lessons[i]).Error; err != nil {
			log.Fatalf("erro ao criar aula: %v", err)
		}
	}

	// Update YoutubeID and DurationMinutes on existing lessons
	// course1 / Fundamentos do Go: pos 1 = "Instalação e configuração"
	if err := db.Model(&lessons[0]).Updates(models.Lesson{YoutubeID: "un6ZyFkqFKo", DurationMinutes: 10}).Error; err != nil {
		log.Printf("warn: failed to update lesson[0]: %v", err)
	}
	// course1 / Fundamentos do Go: pos 2 = "Tipos e variáveis" → "Variáveis e Tipos" brief mapping
	if err := db.Model(&lessons[1]).Updates(models.Lesson{YoutubeID: "MzKEFWNDmtI", DurationMinutes: 15}).Error; err != nil {
		log.Printf("warn: failed to update lesson[1]: %v", err)
	}
	// course1 / Concorrência: pos 1 = "Goroutines"
	if err := db.Model(&lessons[2]).Updates(models.Lesson{YoutubeID: "f6kdp27TYZs", DurationMinutes: 18}).Error; err != nil {
		log.Printf("warn: failed to update lesson[2]: %v", err)
	}
	// course2 / Fundamentos do React: pos 1 = "Componentes e Props"
	isFreeTrue := true
	if err := db.Model(&lessons[3]).Updates(map[string]interface{}{
		"youtube_id":       "Ke90Tje7VS0",
		"duration_minutes": 22,
		"is_free":          isFreeTrue,
	}).Error; err != nil {
		log.Printf("warn: failed to update lesson[3]: %v", err)
	}
	// course2 / Server Components: pos 1 = "use server e use client" → brief maps "useState e useEffect"
	if err := db.Model(&lessons[4]).Updates(models.Lesson{YoutubeID: "O6P86uwfdR0", DurationMinutes: 28}).Error; err != nil {
		log.Printf("warn: failed to update lesson[4]: %v", err)
	}

	// -------------------------------------------------------------------------
	// Matrículas
	// -------------------------------------------------------------------------

	// Existing: student → course1 (active)
	expiresAt := time.Now().AddDate(1, 0, 0) // 1 year from now
	enrollment := models.Enrollment{
		UserID:    student.ID,
		CourseID:  course1.ID,
		Status:    "active",
		ExpiresAt: &expiresAt,
	}
	if err := db.Where(models.Enrollment{UserID: student.ID, CourseID: course1.ID}).FirstOrCreate(&enrollment).Error; err != nil {
		log.Fatalf("erro ao criar matrícula: %v", err)
	}

	// student2 → course2 (expired, 30 days ago)
	expiredAt := time.Now().AddDate(0, 0, -30)
	enrollment2 := models.Enrollment{
		UserID:    student2.ID,
		CourseID:  course2.ID,
		Status:    "expired",
		ExpiresAt: &expiredAt,
	}
	if err := db.Where(models.Enrollment{UserID: student2.ID, CourseID: course2.ID}).FirstOrCreate(&enrollment2).Error; err != nil {
		log.Fatalf("erro ao criar matrícula student2/course2: %v", err)
	}

	// student3 → course4 (pending)
	enrollment3 := models.Enrollment{
		UserID:   student3.ID,
		CourseID: course4.ID,
		Status:   "pending",
	}
	if err := db.Where(models.Enrollment{UserID: student3.ID, CourseID: course4.ID}).FirstOrCreate(&enrollment3).Error; err != nil {
		log.Fatalf("erro ao criar matrícula student3/course4: %v", err)
	}

	// student → course3 (refunded)
	enrollment4 := models.Enrollment{
		UserID:   student.ID,
		CourseID: course3.ID,
		Status:   "refunded",
	}
	if err := db.Where(models.Enrollment{UserID: student.ID, CourseID: course3.ID}).FirstOrCreate(&enrollment4).Error; err != nil {
		log.Fatalf("erro ao criar matrícula student/course3: %v", err)
	}

	// -------------------------------------------------------------------------
	// Reviews
	// -------------------------------------------------------------------------
	// student has active enrollment in course1 → review on course1 (existing)
	// student has active enrollment in course1 → review on course2 (existing, no enrollment needed per original seed)
	// student2 has expired enrollment in course2 → review on course2 (allowed — was enrolled)
	// student2 → review on course4 (has pending enrollment, but brief explicitly adds this review)
	// student3 has pending enrollment → NO review (business rule)

	reviews := []models.CourseReview{
		// Existing reviews
		{CourseID: course1.ID, UserID: student.ID, Rating: 5, Comment: "Excelente curso!"},
		// New reviews (student on course2 replaces old rating-4 review with rating-2)
		{CourseID: course2.ID, UserID: student.ID, Rating: 2, Comment: "Poderia ser mais detalhado nos exemplos práticos"},
		{CourseID: course2.ID, UserID: student2.ID, Rating: 4, Comment: "Muito bom conteúdo, mas faltou aprofundar em Server Components"},
		{CourseID: course4.ID, UserID: student2.ID, Rating: 3, Comment: "Curso mediano, esperava mais exemplos do mundo real"},
	}
	for i := range reviews {
		if err := db.Where(models.CourseReview{CourseID: reviews[i].CourseID, UserID: reviews[i].UserID}).FirstOrCreate(&reviews[i]).Error; err != nil {
			log.Fatalf("erro ao criar review: %v", err)
		}
	}

	log.Println("✅ Seed concluído!")
	log.Println("   admin@test.com    / password123")
	log.Println("   creator@test.com  / password123")
	log.Println("   creator2@test.com / password123")
	log.Println("   student@test.com  / password123")
	log.Println("   student2@test.com / password123")
	log.Println("   student3@test.com / password123")
}
