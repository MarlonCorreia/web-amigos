package handler

import (
	"courses/internal/models"
	"courses/internal/service"
	"encoding/json"
	"net/http"
)

type ReviewHandler struct {
	s *service.ReviewService
}

func NewReviewHandler(s *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{s: s}
}

func (h *ReviewHandler) Create(w http.ResponseWriter, r *http.Request) {
	var payload models.CourseReviewPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if payload.CourseID == "" {
		http.Error(w, "course_id is required", http.StatusBadRequest)
		return
	}
	if payload.Rating < 1 || payload.Rating > 5 {
		http.Error(w, "rating must be between 1 and 5", http.StatusBadRequest)
		return
	}
	if err := h.s.CreateReview(r.Context(), &payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}
