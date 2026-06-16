package handler

import (
	"courses/internal/middleware"
	"courses/internal/models"
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseHandler struct {
	s       *service.CourseService
	enrollS *service.EnrollmentService
	v       *validator.Validate
}

func NewCourseHandler(s *service.CourseService, enrollS *service.EnrollmentService, v *validator.Validate) *CourseHandler {
	return &CourseHandler{s: s, enrollS: enrollS, v: v}
}

func (h *CourseHandler) GetReviews(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseID")
	reviews, err := h.s.GetCourseReviews(r.Context(), courseID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(reviews)
}

func (h *CourseHandler) GetCourseContent(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	courseID := chi.URLParam(r, "courseID")

	active, err := h.enrollS.HasActiveEnrollment(r.Context(), userID, courseID)
	if err != nil {
		http.Error(w, "failed to verify enrollment", http.StatusInternalServerError)
		return
	}
	if !active {
		http.Error(w, "access denied: no active enrollment for this course", http.StatusForbidden)
		return
	}

	course, err := h.s.GetCourseContent(r.Context(), courseID)
	if err != nil {
		http.Error(w, "course not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseID")

	course, err := h.s.GetCourse(r.Context(), courseID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "course not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) List(w http.ResponseWriter, r *http.Request) {
	var isPublished bool
	if r.URL.Query().Get("published") == "true" {
		isPublished = true
	}

	courses, err := h.s.List(r.Context(), isPublished)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(courses)
}

func (h *CourseHandler) Create(w http.ResponseWriter, r *http.Request) {
	userRole := RetrieveUserRole(r.Context())

	if userRole != "admin" && userRole != "creator" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var payload models.CreateCourseRequest
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
	if payload.ThumbnailURL == "" {
		http.Error(w, "thumbnail_url field is requuired and can't be empty", http.StatusBadRequest)
		return
	}
	if payload.Price == nil {
		http.Error(w, "price field is required", http.StatusBadRequest)
		return
	}
	if payload.AccessDurationDays == nil {
		http.Error(w, "acess_duration_days field required", http.StatusBadRequest)
		return
	}

	course, err := h.s.Create(r.Context(), &payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseID")
	var payload models.UpdateCourseRequest

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.v.Struct(payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.s.Update(r.Context(), &payload, courseID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "course not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "course updated"})
}

func (h *CourseHandler) PublishCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseID")

	err := uuid.Validate(courseID)
	if err != nil {
		http.Error(w, "invalid course ID", http.StatusBadRequest)
		return
	}

	if err := h.s.Publish(r.Context(), courseID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "course not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "course published"})
}

func (h *CourseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseID")
	err := uuid.Validate(courseID)
	if err != nil {
		http.Error(w, "invalid course ID", http.StatusBadRequest)
		return
	}

	if err := h.s.DeleteCourse(r.Context(), courseID); err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "course not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "course deleted"})
}
