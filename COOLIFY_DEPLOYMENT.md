# Coolify Deployment Guide

## Overview
This guide explains how to deploy Rush Express on Coolify.

## Prerequisites
- Coolify instance running
- Git repository connected to Coolify
- Environment variables configured

## Deployment Steps

### 1. Coolify Project Configuration
- **Docker Compose File**: Use `docker-compose.yml` (default)
- **Build Pack**: Docker Compose
- **Port Configuration**: Coolify will auto-detect ports from EXPOSE directives

### 2. Service Port Configuration
Each service runs on its internal port:
- **Backend**: Port 8000 (Django/Daphne)
- **Web Apps**: Port 8080 (Express server)
- **PostgreSQL**: Port 5432 (internal)
- **Redis**: Port 6379 (internal)

### 3. Environment Variables
Copy all variables from `coolify-env-variables.txt` to your Coolify project environment variables.

Key variables:
```bash
# Database
POSTGRES_DB=rush_express
POSTGRES_USER=rush_express
POSTGRES_PASSWORD=RushExpress2026SecureDbPass4Coolify

# Backend
DEBUG=0
SECRET_KEY=vQMGOnQzS6f6otv3MboGemHiZldi9eXopkMdHUUynMAwea9TFy
ALLOWED_HOSTS=rush-express-api.mawuvision.com

# Redis
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
CHANNEL_REDIS_URL=redis://redis:6379/2
REDIS_URL=redis://redis:6379/1

# Frontend
VITE_API_URL=https://rush-express-api.mawuvision.com
VITE_WS_URL=wss://rush-express-api.mawuvision.com

# CORS
CORS_ALLOWED_ORIGINS=https://rush-express-admin.mawuvision.com,https://rush-express-customer.mawuvision.com,https://rush-express-merchant.mawuvision.com,https://rush-express-rider.mawuvision.com
```

### 4. Service Routing
Coolify will automatically create routes for each service:
- Backend API: `https://rush-express-api.mawuvision.com`
- Admin Portal: `https://rush-express-admin.mawuvision.com`
- Customer Portal: `https://rush-express-customer.mawuvision.com`
- Merchant Portal: `https://rush-express-merchant.mawuvision.com`
- Rider Portal: `https://rush-express-rider.mawuvision.com`

### 5. Health Checks
Each service has health checks configured:
- **Backend**: `GET /health/` endpoint
- **Web Apps**: HTTP check on port 8080

### 6. Deployment Process
1. Push changes to your Git repository
2. Coolify will automatically detect changes and start deployment
3. Services will be built and started in dependency order
4. Health checks will verify service availability

## Troubleshooting

### Port Conflicts
- **Issue**: "port is already allocated"
- **Solution**: Remove port mappings from docker-compose.yml (Coolify handles routing)

### Backend Not Available
- **Issue**: "no available server"
- **Solution**: Check health endpoint and environment variables

### Build Failures
- **Issue**: Docker build fails
- **Solution**: Check Dockerfile and build context

## Monitoring
- Use Coolify's built-in logs to monitor each service
- Check health check status in Coolify dashboard
- Monitor resource usage and scaling needs