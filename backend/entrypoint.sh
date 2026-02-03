#!/usr/bin/env bash
# Enable command tracing for better debugging
set -x
set -e

# Error handling function
handle_error() {
    echo "ERROR: Failed at line $1"
    exit 1
}

# Trap errors
trap 'handle_error $LINENO' ERR

echo "--- Rush Express Backend Diagnostic Start ---"
echo "Current Directory: $(pwd)"
echo "User: $(whoami)"
echo "Files in Directory:"
ls -F
echo "--- Diagnostic End ---"

if [ ! -f "manage.py" ]; then
    echo "ERROR: manage.py not found in $(pwd)"
    exit 1
fi

# Wait for database to be ready
echo "Waiting for PostgreSQL ($POSTGRES_HOST:$POSTGRES_PORT) to be ready..."
max_attempts=30
attempt=0
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "ERROR: PostgreSQL did not become ready in time"
    exit 1
  fi
  echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 2
done

echo "PostgreSQL is ready!"

# Run migrations (capture output but ensure failure is visible)
echo "Running database migrations..."
if ! python manage.py migrate --noinput; then
    echo "ERROR: Database migrations failed"
    # Try to print some debug info
    python manage.py showmigrations
    exit 1
fi

# Collect static files
echo "Collecting static files..."
if ! python manage.py collectstatic --noinput; then
    echo "ERROR: Static file collection failed"
    exit 1
fi

# Verify Django configuration
echo "Verifying Django configuration..."
if ! python manage.py check; then
    echo "ERROR: Django configuration check failed"
    exit 1
fi

echo "backend-service-ready" # Log marker for easy finding

echo "Starting Daphne server on 0.0.0.0:8000..."
# Using exec to replace the shell process
# Removing --access-log - if it causes issues, but adding simple debug logs
exec daphne -u /tmp/daphne.sock -b 0.0.0.0 -p 8000 --proxy-headers rush_express.asgi:application
