package router

import (
	"courses/internal/handler"
	customMiddleware "courses/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func CourseRoutes(h *handler.CourseHandler, enrollHandler *handler.EnrollmentHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/{courseID}/reviews", h.GetReviews)

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Post("/{courseID}/enroll", enrollHandler.Enroll)
		r.Get("/{courseID}/enroll", enrollHandler.GetEnrollmentStatus)
	})

	return r
}
