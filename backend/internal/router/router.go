package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func SetupRouter(userHandler *handler.UserHandler, authHandler *handler.AuthHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/users", UserRoutes(userHandler))
	r.Mount("/auth", AuthRoutes(authHandler))
	return r
}
