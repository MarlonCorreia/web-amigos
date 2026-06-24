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

func (h *EnrollmentHandler) WebhookGatewayGET(w http.ResponseWriter, r *http.Request) {
	transactionID := r.URL.Query().Get("transaction_id")
	if transactionID == "" {
		http.Error(w, "transaction_id is required", http.StatusBadRequest)
		return
	}

	if err := h.s.ActivateByTransaction(r.Context(), transactionID); err != nil {
		http.Error(w, "failed to activate enrollment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`
		<!DOCTYPE html>
		<html lang="pt-BR">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Pagamento Confirmado</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
					background-color: #f3f4f6;
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100vh;
					margin: 0;
				}
				.card {
					background-color: white;
					padding: 2.5rem;
					border-radius: 16px;
					box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
					text-align: center;
					max-width: 400px;
					width: 100%;
					border: 1px solid #e5e7eb;
				}
				.icon {
					color: #10b981;
					font-size: 5rem;
					margin-bottom: 1.5rem;
					line-height: 1;
				}
				h1 {
					color: #111827;
					margin-bottom: 0.75rem;
					font-size: 1.6rem;
					font-weight: 800;
				}
				p {
					color: #4b5563;
					font-size: 0.975rem;
					line-height: 1.6;
					margin: 0;
				}
			</style>
		</head>
		<body>
			<div class="card">
				<div class="icon">✓</div>
				<h1>Pagamento Aprovado!</h1>
				<p>Parabéns! O acesso ao curso já foi liberado no seu computador. Você já pode voltar para a tela anterior e começar a aprender!</p>
			</div>
		</body>
		</html>
	`))
}

func (h *EnrollmentHandler) GetStatusByTransaction(w http.ResponseWriter, r *http.Request) {
	transactionID := r.URL.Query().Get("transaction_id")
	if transactionID == "" {
		http.Error(w, "transaction_id query parameter is required", http.StatusBadRequest)
		return
	}

	enrollment, err := h.s.GetByTransaction(r.Context(), transactionID)
	if err != nil {
		http.Error(w, "enrollment not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"transaction_id": enrollment.GatewayTransactionID,
		"status":         enrollment.Status,
		"course_id":      enrollment.CourseID.String(),
	})
}

