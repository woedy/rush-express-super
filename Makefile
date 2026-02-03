.PHONY: help local-up local-down local-build local-logs prod-up prod-down prod-build prod-logs clean

# Default target
help:
	@echo "Rush Express Docker Commands"
	@echo ""
	@echo "Local Development:"
	@echo "  local-up      Start all services for local development"
	@echo "  local-down    Stop all local services"
	@echo "  local-build   Rebuild all local services"
	@echo "  local-logs    Show logs for local services"
	@echo ""
	@echo "Production:"
	@echo "  prod-up       Start all services for production"
	@echo "  prod-down     Stop all production services"
	@echo "  prod-build    Rebuild all production services"
	@echo "  prod-logs     Show logs for production services"
	@echo ""
	@echo "Utilities:"
	@echo "  clean         Clean up Docker resources"
	@echo "  db-migrate    Run Django migrations"
	@echo "  db-shell      Access PostgreSQL shell"
	@echo "  backend-shell Access backend container shell"

# Local Development
local-up:
	@echo "Starting Rush Express for local development..."
	docker-compose -f docker-compose.local.yml --env-file .env.local up -d

local-down:
	@echo "Stopping local development services..."
	docker-compose -f docker-compose.local.yml down

local-build:
	@echo "Rebuilding local development services..."
	docker-compose -f docker-compose.local.yml build --no-cache
	docker-compose -f docker-compose.local.yml --env-file .env.local up -d

local-logs:
	docker-compose -f docker-compose.local.yml logs -f

# Production
prod-up:
	@echo "Starting Rush Express for production..."
	docker-compose up -d

prod-down:
	@echo "Stopping production services..."
	docker-compose down

prod-build:
	@echo "Rebuilding production services..."
	docker-compose build --no-cache
	docker-compose up -d

prod-logs:
	docker-compose logs -f

# Database operations
db-migrate:
	@echo "Running Django migrations..."
	docker-compose -f docker-compose.local.yml exec backend python manage.py migrate

db-shell:
	@echo "Accessing PostgreSQL shell..."
	docker-compose -f docker-compose.local.yml exec postgres psql -U postgres -d rush_express

backend-shell:
	@echo "Accessing backend container shell..."
	docker-compose -f docker-compose.local.yml exec backend bash

# Utilities
clean:
	@echo "Cleaning up Docker resources..."
	docker system prune -f
	docker volume prune -f

# Setup commands
setup-local:
	@echo "Setting up local development environment..."
	@if [ ! -f .env.local ]; then \
		cp .env.local.example .env.local; \
		echo "Created .env.local from example. Please update with your values."; \
	fi
	$(MAKE) local-build

setup-prod:
	@echo "Setting up production environment..."
	@if [ ! -f .env ]; then \
		cp .env.production.example .env; \
		echo "Created .env from example. Please update with your production values."; \
	fi