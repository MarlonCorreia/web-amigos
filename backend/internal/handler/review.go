package handler

import (
	"courses/internal/models"
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
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

func (h *ReviewHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	review, err := h.s.GetReviewByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(review)
}

func (h *ReviewHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.s.DeleteReview(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ReviewHandler) Update(w http.ResponseWriter, r *http.Request) {
	var payload models.CourseReviewUpdatePayload

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	idStr := chi.URLParam(r, "id")

	if payload.Rating < 1 || payload.Rating > 5 {
		http.Error(w, "rating must be between 1 and 5", http.StatusBadRequest)
		return
	}

	if err := h.s.UpdateReview(r.Context(), &payload, idStr); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
