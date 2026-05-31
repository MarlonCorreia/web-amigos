package router

import (
	"courses/internal/handler"
	customMiddleware "courses/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func UserRoutes(h *handler.UserHandler, enrollHandler *handler.EnrollmentHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	r.Post("/", h.Create)

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Get("/me", h.Me)
		r.Get("/me/enrollments", enrollHandler.GetUserEnrollments)
		r.Get("/", h.FindByEmail)
		r.Get("/{id}", h.FindByID)
	})

	return r
}
