package service

import (
	"context"
	"courses/internal/models"
	"courses/internal/repository"
	"fmt"
	"net/url"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EnrollmentService struct {
	enrollRepo repository.EnrollmentRepository
	baseURL    string
}

func NewEnrollmentService(enrollRepo repository.EnrollmentRepository, baseURL string) *EnrollmentService {
	return &EnrollmentService{enrollRepo: enrollRepo, baseURL: baseURL}
}

type EnrollResponse struct {
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	PaymentURL    string `json:"payment_url"`
	QRCodeURL     string `json:"qr_code_url"`
}

func (s *EnrollmentService) Enroll(ctx context.Context, userID, courseID string) (*EnrollResponse, error) {
	existing, err := s.enrollRepo.GetEnrollmentByUserAndCourse(ctx, userID, courseID)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	if existing != nil {
		if existing.Status == "active" && existing.ExpiresAt != nil && existing.ExpiresAt.After(time.Now()) {
			return nil, fmt.Errorf("user already has an active enrollment for this course")
		}
		if existing.Status == "pending" {
			return s.buildEnrollResponse(existing.GatewayTransactionID, "pending"), nil
		}
	}

	transactionID := uuid.New().String()

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user id")
	}
	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		return nil, fmt.Errorf("invalid course id")
	}

	enrollment := &models.Enrollment{
		UserID:               userUUID,
		CourseID:             courseUUID,
		GatewayTransactionID: transactionID,
		Status:               "pending",
	}

	if err := s.enrollRepo.CreateEnrollment(ctx, enrollment); err != nil {
		return nil, err
	}

	return s.buildEnrollResponse(transactionID, "pending"), nil
}

func (s *EnrollmentService) GetEnrollmentStatus(ctx context.Context, userID, courseID string) (*models.Enrollment, error) {
	enrollment, err := s.enrollRepo.GetEnrollmentByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		return nil, fmt.Errorf("enrollment not found")
	}
	return enrollment, nil
}

func (s *EnrollmentService) ActivateByTransaction(ctx context.Context, transactionID string) error {
	expiresAt := time.Now().AddDate(1, 0, 0)
	return s.enrollRepo.ActivateEnrollmentByTransaction(ctx, transactionID, expiresAt)
}

func (s *EnrollmentService) buildEnrollResponse(transactionID, status string) *EnrollResponse {
	paymentURL := fmt.Sprintf("%s/pay/%s", s.baseURL, transactionID)
	qrCodeURL := "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + url.QueryEscape(paymentURL)
	return &EnrollResponse{
		TransactionID: transactionID,
		Status:        status,
		PaymentURL:    paymentURL,
		QRCodeURL:     qrCodeURL,
	}
}
