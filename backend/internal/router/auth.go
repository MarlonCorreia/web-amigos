package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
)

func AuthRoutes(h *handler.AuthHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Post("/", h.Login)

	return r
}
