package handler

import (
	"courses/internal/models"
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ModuleHandler struct {
	s *service.ModuleService
	v *validator.Validate
}

func NewModuleHandler(s *service.ModuleService, v *validator.Validate) *ModuleHandler {
	return &ModuleHandler{s: s, v: v}
}

func (h *ModuleHandler) CreateModule(w http.ResponseWriter, r *http.Request) {
	userRole := RetrieveUserRole(r.Context())

	if userRole != "admin" && userRole != "creator" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	courseID := chi.URLParam(r, "courseID")
	if err := uuid.Validate(courseID); err != nil {
		http.Error(w, "invalid course ID", http.StatusBadRequest)
		return
	}

	var payload models.CreateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if payload.Title == "" {
		http.Error(w, "title field is required and can't be empty", http.StatusBadRequest)
		return
	}
	if payload.Position == nil {
		http.Error(w, "position field is requuired and can't be empty", http.StatusBadRequest)
		return
	}

	payload.CourseID = courseID

	if err := h.s.CreateModule(r.Context(), &payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "module created"})
}

func (h *ModuleHandler) GetModule(w http.ResponseWriter, r *http.Request) {
	moduleID := chi.URLParam(r, "moduleID")
	if err := uuid.Validate(moduleID); err != nil {
		http.Error(w, "invalid module ID", http.StatusBadRequest)
		return
	}

	module, err := h.s.GetModule(r.Context(), moduleID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "module not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(module)
}

func (h *ModuleHandler) ListModules(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseID")
	if err := uuid.Validate(courseID); err != nil {
		http.Error(w, "invalid course ID", http.StatusBadRequest)
		return
	}

	modules, err := h.s.ListModules(r.Context(), courseID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(modules)
}

func (h *ModuleHandler) UpdateModule(w http.ResponseWriter, r *http.Request) {
	userRole := RetrieveUserRole(r.Context())

	if userRole != "admin" && userRole != "creator" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	moduleID := chi.URLParam(r, "moduleID")
	if err := uuid.Validate(moduleID); err != nil {
		http.Error(w, "invalid module ID", http.StatusBadRequest)
		return
	}

	var payload models.UpdateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.s.UpdateModule(r.Context(), &payload, moduleID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "module not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "module updated"})
}

func (h *ModuleHandler) DeleteModule(w http.ResponseWriter, r *http.Request) {
	userRole := RetrieveUserRole(r.Context())

	if userRole != "admin" && userRole != "creator" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	moduleID := chi.URLParam(r, "moduleID")
	if err := uuid.Validate(moduleID); err != nil {
		http.Error(w, "invalid module ID", http.StatusBadRequest)
		return
	}

	if err := h.s.DeleteModule(r.Context(), moduleID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "module not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "module deleted"})
}
