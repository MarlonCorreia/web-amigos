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
		r.Put("/me", h.UpdateProfile)
		r.Delete("/me", h.DeleteMe)
		r.Get("/me/enrollments", enrollHandler.GetUserEnrollments)
		r.Get("/", h.FindByEmail)
		r.Get("/{id}", h.FindByID)
		r.Put("/{id}/role", h.UpdateRole)
		r.Delete("/{id}", h.Delete)
	})

	return r
}
