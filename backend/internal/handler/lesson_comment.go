package handler

import (
	"courses/internal/models"
	"courses/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type LessonCommentHandler struct {
	s *service.LessonCommentService
}

func NewLessonCommentHandler(s *service.LessonCommentService) *LessonCommentHandler {
	return &LessonCommentHandler{s: s}
}

func (h *LessonCommentHandler) List(w http.ResponseWriter, r *http.Request) {
	lessonID := chi.URLParam(r, "lessonID")
	comments, err := h.s.ListComments(r.Context(), lessonID)
	if err != nil {
		status := http.StatusInternalServerError
		msg := err.Error()
		if msg == "access denied" || msg == "forbidden" {
			status = http.StatusForbidden
		}
		http.Error(w, msg, status)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (h *LessonCommentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.Content == "" {
		http.Error(w, "content is required", http.StatusBadRequest)
		return
	}
	lessonID := chi.URLParam(r, "lessonID")
	if err := h.s.CreateComment(r.Context(), lessonID, &req); err != nil {
		status := http.StatusInternalServerError
		msg := err.Error()
		if msg == "access denied" || msg == "forbidden" {
			status = http.StatusForbidden
		}
		http.Error(w, msg, status)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *LessonCommentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	commentID := chi.URLParam(r, "commentID")
	if err := h.s.DeleteComment(r.Context(), commentID); err != nil {
		status := http.StatusInternalServerError
		msg := err.Error()
		if msg == "access denied" || msg == "forbidden" {
			status = http.StatusForbidden
		}
		http.Error(w, msg, status)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
