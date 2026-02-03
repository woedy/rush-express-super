# Rush Express - Setup Guide

This guide will help you set up Rush Express for both local development and production deployment.

## Prerequisites

### Required Software

- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
- **Git**: [Download here](https://git-scm.com/downloads)
- **Node.js 18+** (for local development): [Download here](https://nodejs.org/)
- **Python 3.11+** (for local development): [Download here](https://www.python.org/)

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd rush-express
```

### 2. Local Development Setup

#### Option A: Using Docker (Recommended)

```bash
# Copy environment file
copy .env.local.example .env.local    # Windows
cp .env.local.example .env.local      # macOS/Linux

# Edit .env.local with your settings (optional for development)

# Deploy using batch file (Windows)
deploy.bat local

# Deploy using shell script (macOS/Linux)
./deploy.sh local

# Or using Docker Compose directly
docker-compose -f docker-compose.local.yml --env-file .env.local up -d
```

#### Option B: Using Makefile

```bash
# Setup and deploy
make setup-local
make local-up

# View logs
make local-logs

# Stop services
make local-down
```

### 3. Access Your Applications

After deployment, access your applications at:

- **Backend API**: http://localhost:8000
- **Admin Portal**: http://localhost:3000
- **Customer Portal**: http://localhost:3001
- **Merchant Portal**: http://localhost:3002
- **Rider Portal**: http://localhost:3003
- **Database**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379

## Production Deployment (Coolify)

### 1. Prepare Environment

```bash
# Copy production environment file
copy .env.production.example .env    # Windows
cp .env.production.example .env      # macOS/Linux
```

### 2. Configure Environment Variables

Edit `.env` with your production values:

```bash
# Database Configuration
POSTGRES_DB=rush_express_prod
POSTGRES_USER=rush_express_user
POSTGRES_PASSWORD=your-secure-password

# Backend Configuration
SECRET_KEY=your-very-secure-secret-key
ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://admin.yourdomain.com,https://customer.yourdomain.com

# Frontend Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### 3. Deploy to Coolify

1. **Import Repository**: Add your Git repository to Coolify
2. **Configure Project**: Coolify will detect `docker-compose.yml`
3. **Set Environment Variables**: Add all variables from your `.env` file
4. **Deploy**: Coolify will build and deploy all services

### 4. Post-Deployment

After deployment, Coolify will provide URLs for each service. Update your environment variables accordingly.

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `rush_express` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `secure_password` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `ALLOWED_HOSTS` | Django allowed hosts | `localhost,api.domain.com` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `https://app.domain.com` |
| `VITE_API_URL` | Frontend API URL | `https://api.domain.com` |
| `VITE_WS_URL` | WebSocket URL | `wss://api.domain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Django debug mode | `0` |

## Development Workflow

### Starting Development

```bash
# Start all services
make local-up
# or
deploy.bat local

# View logs
make local-logs
# or
deploy.bat logs-local

# Access specific service logs
make local-logs backend
# or
deploy.bat logs-local backend
```

### Making Changes

1. **Backend Changes**: 
   - Edit files in `backend/`
   - Container will auto-reload with volume mounts

2. **Frontend Changes**:
   - Edit files in `web-*/src/`
   - Vite will hot-reload changes

3. **Database Changes**:
   ```bash
   # Run migrations
   docker-compose -f docker-compose.local.yml exec backend python manage.py makemigrations
   docker-compose -f docker-compose.local.yml exec backend python manage.py migrate
   ```

### Stopping Development

```bash
# Stop all services
make local-down
# or
deploy.bat stop-local
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :8000    # Windows
   lsof -i :8000                   # macOS/Linux
   
   # Kill the process or change ports in docker-compose.local.yml
   ```

2. **Docker Build Fails**
   ```bash
   # Clear Docker cache
   docker system prune -f
   docker builder prune -f
   
   # Rebuild without cache
   docker-compose -f docker-compose.local.yml build --no-cache
   ```

3. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker-compose -f docker-compose.local.yml ps postgres
   
   # View database logs
   docker-compose -f docker-compose.local.yml logs postgres
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear node_modules and rebuild
   docker-compose -f docker-compose.local.yml exec web-admin rm -rf node_modules
   docker-compose -f docker-compose.local.yml build web-admin --no-cache
   ```

### Useful Commands

```bash
# Access backend shell
docker-compose -f docker-compose.local.yml exec backend bash

# Access database
docker-compose -f docker-compose.local.yml exec postgres psql -U postgres -d rush_express

# View all containers
docker-compose -f docker-compose.local.yml ps

# Restart specific service
docker-compose -f docker-compose.local.yml restart backend

# View resource usage
docker stats
```

## Mobile Development

Mobile apps are not containerized but can connect to your Docker backend:

### Flutter Setup

1. **Install Flutter**: [Flutter Installation Guide](https://docs.flutter.dev/get-started/install)

2. **Configure API URL**:
   ```dart
   // In mobile-*/lib/src/api_client.dart
   static const String baseUrl = 'http://10.0.2.2:8000'; // Android emulator
   static const String baseUrl = 'http://localhost:8000'; // iOS simulator
   ```

3. **Run Mobile App**:
   ```bash
   cd mobile-customer  # or mobile-merchant, mobile-rider
   flutter pub get
   flutter run
   ```

## Production Considerations

### Security

- Use strong passwords for database
- Generate secure Django secret key
- Configure proper CORS origins
- Use HTTPS for all communications
- Regular security updates

### Performance

- Monitor resource usage
- Scale services as needed
- Use Redis for caching
- Optimize database queries
- CDN for static assets

### Monitoring

- Set up logging aggregation
- Monitor service health
- Database performance monitoring
- Error tracking
- Uptime monitoring

## Support

For issues and questions:

1. Check this documentation
2. Review Docker logs
3. Check Coolify documentation
4. Create an issue in the repository

## Next Steps

After successful setup:

1. Create admin user: `docker-compose -f docker-compose.local.yml exec backend python manage.py createsuperuser`
2. Access admin panel: http://localhost:8000/admin/
3. Configure your delivery settings
4. Test the complete workflow
5. Deploy to production when ready