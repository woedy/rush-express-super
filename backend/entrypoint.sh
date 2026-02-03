#!/usr/bin/env bash
# Enable command tracing for better debugging
set -x
set -e

echo "--- Rush Express Backend Diagnostic Start ---"
echo "Current Directory: $(pwd)"
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
# Removed 2>/dev/null to see the actual error in Coolify logs
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

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput || {
  echo "ERROR: Database migrations failed"
  exit 1
}

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput || {
  echo "ERROR: Static file collection failed"
  exit 1
}

echo "Starting Daphne server..."
exec daphne -b 0.0.0.0 -p 8000 rush_express.asgi:application
