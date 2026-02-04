# Rush Express - Docker Deployment Guide

This guide covers deploying Rush Express using Docker for both local development and production environments.

## Quick Start

### Local Development

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Start all services:**
   ```bash
   docker-compose -f docker-compose.local.yml --env-file .env.local up -d
   ```

3. **Access the applications:**
   - Backend API: http://localhost:8000
   - Admin Portal: http://localhost:3000
   - Customer Portal: http://localhost:3001
   - Merchant Portal: http://localhost:3002
   - Rider Portal: http://localhost:3003

### Production (Coolify)

1. **Copy environment file:**
   ```bash
   cp .env.production.example .env
   ```

2. **Update environment variables** in `.env` with your production values

3. **Deploy to Coolify:**
   - Import your repository in Coolify
   - Coolify will automatically detect `docker-compose.yml`
   - Set environment variables in Coolify dashboard
   - Deploy the stack

## Architecture

### Services

- **postgres**: PostgreSQL 15 database
- **redis**: Redis 7 for caching and message broker
- **backend**: Django REST API with WebSocket support
- **celery**: Background task processor
- **web-admin**: React admin dashboard
- **web-customer**: React customer portal
- **web-merchant**: React merchant portal
- **web-rider**: React rider portal

### Networking

- **Local**: All services communicate via Docker network
- **Production**: Coolify handles service discovery and load balancing

## Environment Variables

### Required for Production

```bash
# Database
POSTGRES_DB=rush_express_prod
POSTGRES_USER=rush_express_user
POSTGRES_PASSWORD=secure-password

# Backend
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://admin.yourdomain.com,https://customer.yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Optional

```bash
DEBUG=0  # Set to 1 for debug mode
```

## Commands

### Local Development

```bash
# Start all services
docker-compose -f docker-compose.local.yml --env-file .env.local up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f [service-name]

# Stop all services
docker-compose -f docker-compose.local.yml down

# Rebuild and restart
docker-compose -f docker-compose.local.yml up -d --build

# Run Django commands
docker-compose -f docker-compose.local.yml exec backend python manage.py migrate
docker-compose -f docker-compose.local.yml exec backend python manage.py createsuperuser
```

### Production

```bash
# Deploy
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Scale services (if needed)
docker-compose up -d --scale web-customer=2
```

## Health Checks

All services include health checks:

- **Backend**: `GET /health/`
- **Web Apps**: `GET /` (checks if static files are served)
- **Database**: `pg_isready`
- **Redis**: `redis-cli ping`

## Volumes

### Persistent Data

- `postgres_data`: Database files
- `redis_data`: Redis persistence

### Development Volumes

Local development mounts source code for hot reloading:
- Backend: `./backend:/app`
- Web apps: `./web-{role}/src:/app/src`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.local.yml`
2. **Permission issues**: Ensure Docker has access to project directory
3. **Build failures**: Clear Docker cache with `docker system prune`

### Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend

# Follow logs
docker-compose logs -f backend
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d rush_express

# Redis CLI
docker-compose exec redis redis-cli
```

## Coolify Specific Notes

### Auto Port Assignment

Coolify automatically assigns ports, so production compose file doesn't expose ports explicitly.

### Environment Variables

Set these in Coolify dashboard:
- Database credentials
- Django secret key
- Domain configurations
- API URLs for frontend apps

### Domains

Coolify will provide domains for each service:
- Backend: `https://backend-xyz.coolify.app`
- Admin: `https://admin-xyz.coolify.app`
- Customer: `https://customer-xyz.coolify.app`
- Merchant: `https://merchant-xyz.coolify.app`
- Rider: `https://rider-xyz.coolify.app`

Update `VITE_API_URL` and `CORS_ALLOWED_ORIGINS` accordingly.

## Security Considerations

### Production

- Use strong passwords for database
- Set secure Django secret key
- Configure proper CORS origins
- Use HTTPS for all communications
- Regular security updates for base images

### Development

- Default credentials are for development only
- Don't use development settings in production
- Keep `.env.local` out of version control