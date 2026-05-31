package handler

import (
	"courses/internal/middleware"
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type EnrollmentHandler struct {
	s *service.EnrollmentService
}

func NewEnrollmentHandler(s *service.EnrollmentService) *EnrollmentHandler {
	return &EnrollmentHandler{s: s}
}

func (h *EnrollmentHandler) Enroll(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	courseID := chi.URLParam(r, "courseID")

	resp, err := h.s.Enroll(r.Context(), userID, courseID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *EnrollmentHandler) GetEnrollmentStatus(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	courseID := chi.URLParam(r, "courseID")

	enrollment, err := h.s.GetEnrollmentStatus(r.Context(), userID, courseID)
	if err != nil {
		http.Error(w, "enrollment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrollment)
}

func (h *EnrollmentHandler) GetUserEnrollments(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	enrollments, err := h.s.GetUserEnrollments(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to fetch enrollments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrollments)
}

func (h *EnrollmentHandler) WebhookGateway(w http.ResponseWriter, r *http.Request) {
	var body struct {
		TransactionID string `json:"transaction_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.TransactionID == "" {
		http.Error(w, "transaction_id is required", http.StatusBadRequest)
		return
	}

	if err := h.s.ActivateByTransaction(r.Context(), body.TransactionID); err != nil {
		http.Error(w, "failed to activate enrollment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "approved"})
}
