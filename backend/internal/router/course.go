package router

import (
	"courses/internal/handler"
	customMiddleware "courses/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func CourseRoutes(h *handler.CourseHandler, moduleHandler *handler.ModuleHandler, lessonHandler *handler.LessonHandler, enrollHandler *handler.EnrollmentHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()
	r.Use(customMiddleware.JWTAuth(jwtSecret))

	r.Get("/{courseID}/reviews", h.GetReviews)

	r.Post("/", h.Create)
	r.Get("/", h.List)

	r.Put("/{courseID}", h.UpdateCourse)
	r.Get("/{courseID}", h.GetCourse)

	r.Delete("/{courseID}", h.DeleteCourse)

	r.Patch("/{courseID}/publish", h.PublishCourse)

	r.Post("/{courseID}/modules", moduleHandler.CreateModule)
	r.Get("/{courseID}/modules", moduleHandler.ListModules)

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Get("/modules/{moduleID}", moduleHandler.GetModule)
		r.Put("/modules/{moduleID}", moduleHandler.UpdateModule)
		r.Delete("/modules/{moduleID}", moduleHandler.DeleteModule)

		r.Post("/modules/{moduleID}/lessons", lessonHandler.CreateLessonHandler)
		r.Get("/modules/{moduleID}/lessons", lessonHandler.ListLessonsByModuleIDHandler)

		r.Put("/modules/lessons/{lessonID}", lessonHandler.UpdateLessonHandler)
		r.Delete("/modules/lessons/{lessonID}", lessonHandler.DeleteLessonHandler)

	})

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Post("/{courseID}/enroll", enrollHandler.Enroll)
		r.Get("/{courseID}/enroll", enrollHandler.GetEnrollmentStatus)
		r.Get("/{courseID}/content", h.GetCourseContent)
	})

	return r
}
