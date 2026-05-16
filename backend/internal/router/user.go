package router

import (
	"courses/internal/handler"
	customMiddleware "courses/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func UserRoutes(h *handler.UserHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	r.Post("/", h.Create)

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Get("/", h.FindByEmail)
		r.Get("/{id}", h.FindByID)
	})

	return r
}
