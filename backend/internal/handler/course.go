package handler

import (
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type CourseHandler struct {
	s *service.CourseService
}

func NewCourseHandler(s *service.CourseService) *CourseHandler {
	return &CourseHandler{s: s}
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
