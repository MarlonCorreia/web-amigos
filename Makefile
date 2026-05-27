db:
	docker compose up postgres_db

api:
	cd backend && go mod tidy && go run cmd/main.go

docs:
	docker compose up swagger

seed:
	cd backend && go run cmd/seed/main.go
