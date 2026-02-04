#!/bin/bash

# Rush Express Deployment Script
# This script helps deploy Rush Express to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if environment file exists
check_env_file() {
    local env_file=$1
    if [ ! -f "$env_file" ]; then
        log_error "Environment file $env_file not found!"
        log_info "Please copy from the example file and update with your values:"
        if [ "$env_file" = ".env.local" ]; then
            log_info "cp .env.local.example .env.local"
        else
            log_info "cp .env.production.example .env"
        fi
        exit 1
    fi
}

# Deploy local development
deploy_local() {
    log_info "Deploying Rush Express for local development..."
    
    check_docker
    check_env_file ".env.local"
    
    log_info "Building and starting services..."
    docker-compose -f docker-compose.local.yml --env-file .env.local up -d --build
    
    log_info "Waiting for services to be ready..."
    sleep 10
    
    log_info "Running database migrations..."
    docker-compose -f docker-compose.local.yml exec -T backend python manage.py migrate
    
    log_info "Local deployment complete!"
    log_info "Services available at:"
    log_info "  - Backend API: http://localhost:8000"
    log_info "  - Admin Portal: http://localhost:3000"
    log_info "  - Customer Portal: http://localhost:3001"
    log_info "  - Merchant Portal: http://localhost:3002"
    log_info "  - Rider Portal: http://localhost:3003"
}

# Deploy production
deploy_production() {
    log_info "Deploying Rush Express for production..."
    
    check_docker
    check_env_file ".env"
    
    log_info "Building and starting services..."
    docker-compose up -d --build
    
    log_info "Waiting for services to be ready..."
    sleep 15
    
    log_info "Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    
    log_info "Collecting static files..."
    docker-compose exec -T backend python manage.py collectstatic --noinput
    
    log_info "Production deployment complete!"
    log_info "Check Coolify dashboard for service URLs"
}

# Stop services
stop_services() {
    local env=$1
    log_info "Stopping Rush Express services ($env)..."
    
    if [ "$env" = "local" ]; then
        docker-compose -f docker-compose.local.yml down
    else
        docker-compose down
    fi
    
    log_info "Services stopped."
}

# Show logs
show_logs() {
    local env=$1
    local service=$2
    
    if [ "$env" = "local" ]; then
        if [ -n "$service" ]; then
            docker-compose -f docker-compose.local.yml logs -f "$service"
        else
            docker-compose -f docker-compose.local.yml logs -f
        fi
    else
        if [ -n "$service" ]; then
            docker-compose logs -f "$service"
        else
            docker-compose logs -f
        fi
    fi
}

# Show help
show_help() {
    echo "Rush Express Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  local         Deploy for local development"
    echo "  production    Deploy for production"
    echo "  stop-local    Stop local development services"
    echo "  stop-prod     Stop production services"
    echo "  logs-local    Show local development logs"
    echo "  logs-prod     Show production logs"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local                    # Deploy locally"
    echo "  $0 production              # Deploy to production"
    echo "  $0 logs-local backend      # Show backend logs (local)"
    echo "  $0 stop-local              # Stop local services"
}

# Main script logic
case "$1" in
    "local")
        deploy_local
        ;;
    "production")
        deploy_production
        ;;
    "stop-local")
        stop_services "local"
        ;;
    "stop-prod")
        stop_services "production"
        ;;
    "logs-local")
        show_logs "local" "$2"
        ;;
    "logs-prod")
        show_logs "production" "$2"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac