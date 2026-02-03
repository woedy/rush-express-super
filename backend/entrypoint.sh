#!/usr/bin/env bash
set -e

echo "Starting Rush Express Backend..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
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
