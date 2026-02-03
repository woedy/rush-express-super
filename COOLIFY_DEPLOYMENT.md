# Rush Express - Coolify Deployment Guide

This guide will walk you through deploying the Rush Express project on Coolify, a self-hosted Platform-as-a-Service.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables Setup](#environment-variables-setup)
- [Deployment Steps](#deployment-steps)
- [Domain Configuration](#domain-configuration)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Coolify Instance**: A running Coolify installation (v4.0+)
2. **Git Repository**: Your Rush Express code pushed to a Git repository (GitHub, GitLab, Bitbucket, etc.)
3. **Domain Names**: At least one domain pointed to your Coolify server
4. **SSL Certificates**: Coolify will automatically provision Let's Encrypt certificates

## Environment Variables Setup

Coolify injects environment variables directly into containers. You'll need to configure these in the Coolify UI.

### Required Environment Variables

Copy the values from [`.env.example`](file:///.env.example) and configure the following **required** variables:

#### Security (CRITICAL)

```bash
# Generate a secure Django secret key
DJANGO_SECRET_KEY=your-super-secret-random-key-here

# Generate with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

```bash
# Set a strong database password
POSTGRES_PASSWORD=your-secure-database-password
```

#### Production Settings

```bash
# IMPORTANT: Set to false in production
DJANGO_DEBUG=false

# IMPORTANT: Set to false in production
CORS_ALLOW_ALL_ORIGINS=false

# Your domain(s) - comma-separated
DJANGO_ALLOWED_HOSTS=yourdomain.com,admin.yourdomain.com,rider.yourdomain.com,merchant.yourdomain.com
```

#### Frontend URLs

```bash
# Your main domain (with https://)
VITE_API_URL=https://yourdomain.com

# WebSocket URL (with wss://)
VITE_WS_URL=wss://yourdomain.com
```

### Optional Environment Variables

These have sensible defaults but can be customized:

```bash
# Database Configuration
POSTGRES_DB=rush_express
POSTGRES_USER=rush_express
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis URLs
REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
CHANNEL_REDIS_URL=redis://redis:6379/2

# Logging
DJANGO_LOG_LEVEL=INFO
```

## Deployment Steps

### Step 1: Create a New Project in Coolify

1. Log in to your Coolify dashboard
2. Click **"New Project"**
3. Give it a name (e.g., "Rush Express")
4. Click **"Create"**

### Step 2: Add a Docker Compose Resource

1. Inside your project, click **"New Resource"**
2. Select **"Docker Compose"**
3. Choose your deployment method:
   - **Option A**: Connect your Git repository
   - **Option B**: Use "Raw Compose" and paste the contents of `docker-compose.prod.yml`

### Step 3: Configure Git Repository (if using Option A)

1. Select your Git provider (GitHub, GitLab, etc.)
2. Choose your repository
3. Select the branch (e.g., `main` or `production`)
4. Set the **Docker Compose file path**: `docker-compose.prod.yml`
5. Click **"Continue"**

### Step 4: Configure Environment Variables

1. In the resource settings, go to **"Environment Variables"**
2. Add all the required environment variables listed above
3. **Important**: Make sure to set:
   - `DJANGO_SECRET_KEY` (generate a new one)
   - `POSTGRES_PASSWORD` (use a strong password)
   - `DJANGO_DEBUG=false`
   - `CORS_ALLOW_ALL_ORIGINS=false`
   - `DJANGO_ALLOWED_HOSTS` (your actual domains)
   - `VITE_API_URL` (your domain with https://)
   - `VITE_WS_URL` (your domain with wss://)

### Step 5: Configure Domains

Coolify supports multiple domains for a single Docker Compose deployment. Configure the following:

1. Go to the **nginx** service in your Docker Compose resource
2. Add your domains:
   - **Primary domain**: `yourdomain.com` (Customer web app)
   - **Admin subdomain**: `admin.yourdomain.com` (Admin web app)
   - **Rider subdomain**: `rider.yourdomain.com` (Rider web app)
   - **Merchant subdomain**: `merchant.yourdomain.com` (Merchant web app)

3. Enable **"Generate SSL Certificate"** for each domain
4. Coolify will automatically provision Let's Encrypt certificates

### Step 6: Deploy

1. Click **"Deploy"** button
2. Coolify will:
   - Pull your code from Git (if using Git)
   - Build all Docker images
   - Start all services
   - Provision SSL certificates
   - Set up health checks

3. Monitor the deployment logs for any errors

## Domain Configuration

### DNS Setup

Before deploying, ensure your DNS records are configured:

```
A Record:     yourdomain.com          → Your Coolify Server IP
A Record:     admin.yourdomain.com    → Your Coolify Server IP
A Record:     rider.yourdomain.com    → Your Coolify Server IP
A Record:     merchant.yourdomain.com → Your Coolify Server IP
```

Or use a wildcard:

```
A Record:     yourdomain.com          → Your Coolify Server IP
A Record:     *.yourdomain.com        → Your Coolify Server IP
```

### Nginx Routing

The nginx service handles routing based on the `Host` header:

- `yourdomain.com` → Customer web app
- `admin.yourdomain.com` → Admin web app
- `rider.yourdomain.com` → Rider web app
- `merchant.yourdomain.com` → Merchant web app

All domains share the same backend API at:
- `/api/*` → Backend API
- `/auth/*` → Authentication endpoints
- `/ws/*` → WebSocket connections
- `/static/*` → Static files
- `/media/*` → Media files

## Post-Deployment

### 1. Run Database Migrations

After the first deployment, you need to run Django migrations:

1. Go to your Coolify resource
2. Find the **backend** service
3. Click **"Execute Command"**
4. Run:
   ```bash
   python manage.py migrate
   ```

### 2. Create a Superuser (Optional)

To access the Django admin panel:

1. Execute command in the **backend** service:
   ```bash
   python manage.py createsuperuser
   ```
2. Follow the prompts to create an admin user

### 3. Collect Static Files

Ensure static files are collected:

1. Execute command in the **backend** service:
   ```bash
   python manage.py collectstatic --noinput
   ```

### 4. Verify Deployment

Test each application:

- ✅ Customer App: `https://yourdomain.com`
- ✅ Admin App: `https://admin.yourdomain.com`
- ✅ Rider App: `https://rider.yourdomain.com`
- ✅ Merchant App: `https://merchant.yourdomain.com`
- ✅ API Health: `https://yourdomain.com/health/`
- ✅ API Docs: `https://yourdomain.com/api/` (if enabled)

### 5. Test Admin Registration

1. Navigate to `https://admin.yourdomain.com/register`
2. Create a test admin account
3. Verify you can log in
4. Verify you can access the admin dashboard

## Troubleshooting

### Issue: Services Won't Start

**Solution**: Check the logs in Coolify for each service. Common issues:
- Missing environment variables
- Database connection errors
- Build failures

### Issue: Frontend Shows "Cannot connect to API"

**Solution**: 
1. Verify `VITE_API_URL` is set correctly (with `https://`)
2. Verify `DJANGO_ALLOWED_HOSTS` includes your domain
3. Check nginx logs for routing issues

### Issue: WebSocket Connections Fail

**Solution**:
1. Verify `VITE_WS_URL` is set correctly (with `wss://`)
2. Ensure nginx is properly configured for WebSocket upgrades
3. Check that the backend service is healthy

### Issue: Static Files Not Loading

**Solution**:
1. Run `python manage.py collectstatic --noinput` in the backend service
2. Verify the `static_data` volume is mounted correctly
3. Check nginx logs for 404 errors

### Issue: Database Connection Errors

**Solution**:
1. Verify `POSTGRES_PASSWORD` matches in all services
2. Check that the postgres service is healthy
3. Verify `POSTGRES_HOST=postgres` (the service name)

### Issue: SSL Certificate Not Provisioning

**Solution**:
1. Verify DNS records are pointing to your Coolify server
2. Ensure ports 80 and 443 are open
3. Check Coolify logs for Let's Encrypt errors
4. Wait a few minutes - certificate provisioning can take time

### Issue: Admin Registration Fails

**Solution**:
1. Check backend logs for errors
2. Verify the backend service is healthy
3. Ensure database migrations have been run
4. Check that `DJANGO_SECRET_KEY` is set

## Updating Your Deployment

To update your deployment:

1. Push changes to your Git repository
2. In Coolify, click **"Redeploy"** on your resource
3. Coolify will pull the latest code and rebuild

Or enable **"Auto Deploy"** in Coolify to automatically deploy on Git push.

## Monitoring

Coolify provides built-in monitoring:

- **Service Health**: View health check status for each service
- **Logs**: Real-time logs for all services
- **Resource Usage**: CPU, memory, and disk usage

## Backup

### Database Backups

Set up automated PostgreSQL backups:

1. In Coolify, go to your postgres service
2. Enable **"Automated Backups"**
3. Configure backup schedule and retention

Or manually backup:

```bash
# Execute in postgres service
pg_dump -U rush_express rush_express > backup.sql
```

### Volume Backups

Important volumes to backup:
- `postgres_data` - Database data
- `static_data` - Static files
- `media_data` - User-uploaded media

## Support

For issues specific to:
- **Coolify**: Check [Coolify Documentation](https://coolify.io/docs)
- **Rush Express**: Check your project's issue tracker
- **Docker Compose**: Check [Docker Documentation](https://docs.docker.com/compose/)

---

**Congratulations!** 🎉 Your Rush Express application is now deployed on Coolify!
