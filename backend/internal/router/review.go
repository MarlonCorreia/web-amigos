package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
)

func ReviewRoutes(h *handler.ReviewHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Group(func(r chi.Router) {

		r.Post("/", h.Create)
	})

	return r
}
