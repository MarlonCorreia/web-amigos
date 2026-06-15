package router

import (
	"courses/internal/handler"
	customMiddleware "courses/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func CourseRoutes(h *handler.CourseHandler, enrollHandler *handler.EnrollmentHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()
	r.Use(customMiddleware.JWTAuth(jwtSecret))

	r.Get("/{courseID}/reviews", h.GetReviews)

	r.Post("/", h.Create)
	r.Get("/", h.List)

	r.Put("/{courseID}", h.UpdateCourse)
	r.Get("/{courseID}", h.GetCourse)

	r.Delete("/{courseID}", h.DeleteCourse)

	r.Patch("/{courseID}/publish", h.PublishCourse)

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Post("/{courseID}/enroll", enrollHandler.Enroll)
		r.Get("/{courseID}/enroll", enrollHandler.GetEnrollmentStatus)
		r.Get("/{courseID}/content", h.GetCourseContent)
	})

	return r
}
