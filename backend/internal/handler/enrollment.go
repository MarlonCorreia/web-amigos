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

func (h *EnrollmentHandler) PaymentPage(w http.ResponseWriter, r *http.Request) {
	transactionID := chi.URLParam(r, "transactionID")

	html := `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Pagamento</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); text-align: center; max-width: 400px; }
    button { background: #22c55e; color: white; border: none; padding: .75rem 2rem; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 1.5rem; }
    button:disabled { background: #aaa; cursor: not-allowed; }
    #msg { margin-top: 1rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Confirmar Pagamento</h2>
    <p>Clique abaixo para aprovar o pagamento e liberar o acesso ao curso.</p>
    <p><small>Transação: ` + transactionID + `</small></p>
    <button id="btn" onclick="approve()">Aprovar Pagamento</button>
    <div id="msg"></div>
  </div>
  <script>
    async function approve() {
      const btn = document.getElementById('btn');
      const msg = document.getElementById('msg');
      btn.disabled = true;
      btn.textContent = 'Processando...';
      try {
        const res = await fetch('/webhooks/gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_id: '` + transactionID + `' })
        });
        if (res.ok) {
          msg.style.color = '#22c55e';
          msg.textContent = 'Pagamento aprovado! Acesso liberado.';
          btn.textContent = 'Pago';
        } else {
          throw new Error('Falha no pagamento');
        }
      } catch (e) {
        msg.style.color = '#ef4444';
        msg.textContent = 'Erro ao processar pagamento. Tente novamente.';
        btn.disabled = false;
        btn.textContent = 'Aprovar Pagamento';
      }
    }
  </script>
</body>
</html>`

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(html))
}
