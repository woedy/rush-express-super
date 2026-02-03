@echo off
REM Rush Express Deployment Script for Windows
REM This script helps deploy Rush Express to different environments

setlocal enabledelayedexpansion

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

if "%1"=="local" goto deploy_local
if "%1"=="production" goto deploy_production
if "%1"=="stop-local" goto stop_local
if "%1"=="stop-prod" goto stop_prod
if "%1"=="logs-local" goto logs_local
if "%1"=="logs-prod" goto logs_prod
if "%1"=="help" goto show_help
if "%1"=="" goto show_help

echo [ERROR] Unknown command: %1
echo.
goto show_help

:deploy_local
echo [INFO] Deploying Rush Express for local development...

if not exist ".env.local" (
    echo [ERROR] Environment file .env.local not found!
    echo [INFO] Please copy from the example file and update with your values:
    echo [INFO] copy .env.local.example .env.local
    exit /b 1
)

echo [INFO] Building and starting services...
docker-compose -f docker-compose.local.yml --env-file .env.local up -d --build

echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo [INFO] Running database migrations...
docker-compose -f docker-compose.local.yml exec -T backend python manage.py migrate

echo [INFO] Local deployment complete!
echo [INFO] Services available at:
echo [INFO]   - Backend API: http://localhost:8000
echo [INFO]   - Admin Portal: http://localhost:3000
echo [INFO]   - Customer Portal: http://localhost:3001
echo [INFO]   - Merchant Portal: http://localhost:3002
echo [INFO]   - Rider Portal: http://localhost:3003
goto end

:deploy_production
echo [INFO] Deploying Rush Express for production...

if not exist ".env" (
    echo [ERROR] Environment file .env not found!
    echo [INFO] Please copy from the example file and update with your values:
    echo [INFO] copy .env.production.example .env
    exit /b 1
)

echo [INFO] Building and starting services...
docker-compose up -d --build

echo [INFO] Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo [INFO] Running database migrations...
docker-compose exec -T backend python manage.py migrate

echo [INFO] Collecting static files...
docker-compose exec -T backend python manage.py collectstatic --noinput

echo [INFO] Production deployment complete!
echo [INFO] Check Coolify dashboard for service URLs
goto end

:stop_local
echo [INFO] Stopping local development services...
docker-compose -f docker-compose.local.yml down
echo [INFO] Services stopped.
goto end

:stop_prod
echo [INFO] Stopping production services...
docker-compose down
echo [INFO] Services stopped.
goto end

:logs_local
if "%2"=="" (
    docker-compose -f docker-compose.local.yml logs -f
) else (
    docker-compose -f docker-compose.local.yml logs -f %2
)
goto end

:logs_prod
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:show_help
echo Rush Express Deployment Script
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   local         Deploy for local development
echo   production    Deploy for production
echo   stop-local    Stop local development services
echo   stop-prod     Stop production services
echo   logs-local    Show local development logs
echo   logs-prod     Show production logs
echo   help          Show this help message
echo.
echo Examples:
echo   %0 local                    # Deploy locally
echo   %0 production              # Deploy to production
echo   %0 logs-local backend      # Show backend logs (local)
echo   %0 stop-local              # Stop local services
goto end

:end
endlocal