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

		r.Route("/modules", func(r chi.Router) {
			r.Get("/{moduleID}", moduleHandler.GetModule)
			r.Put("/{moduleID}", moduleHandler.UpdateModule)
			r.Delete("/{moduleID}", moduleHandler.DeleteModule)
			r.Post("/{moduleID}/lessons", lessonHandler.CreateLessonHandler)
			r.Get("/{moduleID}/lessons", lessonHandler.ListLessonsByModuleIDHandler)

			r.Route("/lessons", func(r chi.Router) {
				r.Put("/{lessonID}", lessonHandler.UpdateLessonHandler)
				r.Delete("/{lessonID}", lessonHandler.DeleteLessonHandler)
			})
		})

	})

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Post("/{courseID}/enroll", enrollHandler.Enroll)
		r.Get("/{courseID}/enroll", enrollHandler.GetEnrollmentStatus)
		r.Get("/{courseID}/content", h.GetCourseContent)
	})

	return r
}
