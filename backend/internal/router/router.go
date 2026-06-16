package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	customMiddleware "courses/internal/middleware"
)

func SetupRouter(userHandler *handler.UserHandler, authHandler *handler.AuthHandler, reviewHandler *handler.ReviewHandler, courseHandler *handler.CourseHandler, moduleHandler *handler.ModuleHandler, enrollHandler *handler.EnrollmentHandler, jwtSecret string, allowedOrigins string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{allowedOrigins},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	}))
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/auth", AuthRoutes(authHandler))
	r.Mount("/users", UserRoutes(userHandler, enrollHandler, jwtSecret))
	r.Mount("/courses", CourseRoutes(courseHandler, moduleHandler, enrollHandler, jwtSecret))

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Mount("/reviews", ReviewRoutes(reviewHandler))
	})

	r.Post("/webhooks/gateway", enrollHandler.WebhookGateway)

	return r
}
