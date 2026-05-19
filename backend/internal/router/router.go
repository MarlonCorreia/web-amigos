package router

import (
	"courses/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	customMiddleware "courses/internal/middleware"
)

func SetupRouter(userHandler *handler.UserHandler, authHandler *handler.AuthHandler, reviewHandler *handler.ReviewHandler, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/auth", AuthRoutes(authHandler))
	r.Mount("/users", UserRoutes(userHandler, jwtSecret))

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.JWTAuth(jwtSecret))

		r.Mount("/reviews", ReviewRoutes(reviewHandler))
	})

	return r
}
