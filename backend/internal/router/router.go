package router

import (
	"courses/internal/handler"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	customMiddleware "courses/internal/middleware"
)

func SetupRouter(userHandler *handler.UserHandler, authHandler *handler.AuthHandler, reviewHandler *handler.ReviewHandler, courseHandler *handler.CourseHandler, moduleHandler *handler.ModuleHandler, lessonHandler *handler.LessonHandler, enrollHandler *handler.EnrollmentHandler, commentHandler *handler.LessonCommentHandler, jwtSecret string, allowedOrigins string) *chi.Mux {
	r := chi.NewRouter()

	origins := strings.Split(allowedOrigins, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	}))
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/auth", AuthRoutes(authHandler))
	r.Mount("/users", UserRoutes(userHandler, enrollHandler, jwtSecret))
	r.Mount("/courses", CourseRoutes(courseHandler, moduleHandler, lessonHandler, enrollHandler, commentHandler, jwtSecret))

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Mount("/reviews", ReviewRoutes(reviewHandler))
	})

	r.Post("/webhooks/gateway", enrollHandler.WebhookGateway)
	r.Get("/webhooks/gateway", enrollHandler.WebhookGatewayGET)
	r.Get("/webhooks/gateway/status", enrollHandler.GetStatusByTransaction)

	return r
}
