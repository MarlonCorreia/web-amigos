package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
)

func LessonCommentRoutes(h *handler.LessonCommentHandler) *chi.Mux {
	r := chi.NewRouter()
	r.Get("/", h.List)
	r.Post("/", h.Create)
	return r
}
