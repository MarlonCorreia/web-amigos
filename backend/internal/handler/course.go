package handler

import (
	"courses/internal/middleware"
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type CourseHandler struct {
	s       *service.CourseService
	enrollS *service.EnrollmentService
}

func NewCourseHandler(s *service.CourseService, enrollS *service.EnrollmentService) *CourseHandler {
	return &CourseHandler{s: s, enrollS: enrollS}
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
