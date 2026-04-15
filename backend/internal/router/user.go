package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
)

func UserRoutes(h *handler.UserHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Post("/", h.Create)
	r.Get("/", h.FindByEmail)
	r.Get("/{id}", h.FindByID)

	return r
}
