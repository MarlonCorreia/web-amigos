package handler

import (
	"context"
	"courses/internal/middleware"
)

func RetrieveUserID(ctx context.Context) string {
	userID, _ := ctx.Value(middleware.UserIDKey).(string)

	return userID
}

func RetrieveUserRole(ctx context.Context) string {
	userRole, _ := ctx.Value(middleware.UserRoleKey).(string)
	return userRole
}
