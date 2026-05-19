package router

import (
	"courses/internal/handler"
	customMiddleware "courses/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func CourseRoutes(h *handler.CourseHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/{courseID}/reviews", h.GetReviews)

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

	})

	return r
}
