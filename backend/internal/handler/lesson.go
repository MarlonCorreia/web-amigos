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

type LessonHandler struct {
	s *service.LessonService
	v *validator.Validate
}

func NewLessonHandler(s *service.LessonService, v *validator.Validate) *LessonHandler {
	return &LessonHandler{s: s, v: v}
}

func (h *LessonHandler) CreateLessonHandler(w http.ResponseWriter, r *http.Request) {
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

	var payload models.CreateLessonRequest
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
	if payload.Description == "" {
		http.Error(w, "description field is required and can't be empty", http.StatusBadRequest)
		return
	}
	if payload.YoutubeID == "" {
		http.Error(w, "youtube_id field is required and can't be empty", http.StatusBadRequest)
		return
	}
	if payload.DurationMinutes == nil {
		http.Error(w, "duration_minutes field is required and can't be empty", http.StatusBadRequest)
		return

	}

	if payload.Position == nil {
		http.Error(w, "position field is requuired and can't be empty", http.StatusBadRequest)
		return
	}

	payload.ModuleID = moduleID

	if err := h.s.CreateLesson(r.Context(), &payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "lesson created"})
}

func (h *LessonHandler) ListLessonsByModuleIDHandler(w http.ResponseWriter, r *http.Request) {
	moduleID := chi.URLParam(r, "moduleID")
	if err := uuid.Validate(moduleID); err != nil {
		http.Error(w, "invalid module ID", http.StatusBadRequest)
		return
	}

	lessons, err := h.s.ListLessonsByModuleID(r.Context(), moduleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(lessons)
}

func (h *LessonHandler) UpdateLessonHandler(w http.ResponseWriter, r *http.Request) {
	userRole := RetrieveUserRole(r.Context())

	if userRole != "admin" && userRole != "creator" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	lessonID := chi.URLParam(r, "lessonID")
	if err := uuid.Validate(lessonID); err != nil {
		http.Error(w, "invalid lesson ID", http.StatusBadRequest)
		return
	}

	var payload models.UpdateLessonRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.s.UpdateLesson(r.Context(), &payload, lessonID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "lesson not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "lesson updated"})
}

func (h *LessonHandler) DeleteLessonHandler(w http.ResponseWriter, r *http.Request) {
	userRole := RetrieveUserRole(r.Context())

	if userRole != "admin" && userRole != "creator" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	lessonID := chi.URLParam(r, "lessonID")
	if err := uuid.Validate(lessonID); err != nil {
		http.Error(w, "invalid lesson ID", http.StatusBadRequest)
		return
	}

	if err := h.s.DeleteLesson(r.Context(), lessonID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "lesson not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "lesson deleted"})
}
