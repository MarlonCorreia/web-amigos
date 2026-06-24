package handler

import (
	"courses/internal/middleware"
	"courses/internal/models"
	"courses/internal/service"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	s *service.UserService
	v *validator.Validate
}

func NewUserHandler(s *service.UserService, v *validator.Validate) *UserHandler {
	return &UserHandler{s: s, v: v}
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var payload models.CreateUserRequest

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.s.Create(r.Context(), &payload); err != nil {
		if errors.Is(err, service.ErrEmailAlreadyExists) {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "user created"})
}

func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	user, err := h.s.GetByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) FindByEmail(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")

	if email == "" {
		role := RetrieveUserRole(r.Context())
		if role != "admin" {
			http.Error(w, "permission denied: admin role required", http.StatusForbidden)
			return
		}
		users, err := h.s.List(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
		return
	}

	user, err := h.s.GetByEmail(r.Context(), email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user, err := h.s.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

type UpdateRolePayload struct {
	Role string `json:"role" validate:"required,oneof=student creator admin"`
}

func (h *UserHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	role := RetrieveUserRole(r.Context())
	if role != "admin" {
		http.Error(w, "permission denied: admin role required", http.StatusForbidden)
		return
	}

	targetID := chi.URLParam(r, "id")
	currentUserID := RetrieveUserID(r.Context())

	if targetID == currentUserID {
		http.Error(w, "não é possível alterar seu próprio papel", http.StatusBadRequest)
		return
	}

	var payload UpdateRolePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.s.UpdateRole(r.Context(), targetID, payload.Role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "user role updated successfully"})
}

func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	// Only admin can delete users
	role := RetrieveUserRole(r.Context())
	if role != "admin" {
		http.Error(w, "permission denied: admin role required", http.StatusForbidden)
		return
	}

	targetID := chi.URLParam(r, "id")
	currentUserID := RetrieveUserID(r.Context())

	if targetID == currentUserID {
		http.Error(w, "não é possível excluir sua própria conta", http.StatusBadRequest)
		return
	}

	if err := h.s.Delete(r.Context(), targetID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "user deleted successfully"})
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := RetrieveUserID(r.Context())

	var payload models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.s.UpdateProfile(r.Context(), userID, &payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "profile updated successfully"})
}

func (h *UserHandler) DeleteMe(w http.ResponseWriter, r *http.Request) {
	userID := RetrieveUserID(r.Context())

	if err := h.s.Delete(r.Context(), userID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "account deleted successfully"})
}
