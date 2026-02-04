# Technology Stack & Build System

## Backend (Django)

**Framework**: Django 5.0.6 with Django REST Framework
**Database**: PostgreSQL with psycopg2-binary
**Authentication**: JWT with djangorestframework-simplejwt
**Real-time**: Django Channels with Redis backend
**Task Queue**: Celery with Redis broker
**Caching**: Redis with django-redis

### Key Dependencies
- `channels==4.1.0` - WebSocket support
- `celery==5.4.0` - Background task processing
- `django-cors-headers==4.3.1` - CORS handling
- `django-filter==24.2` - API filtering

### Common Commands
```bash
# Backend development
cd backend
python manage.py runserver
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic

# Celery worker
celery -A rush_express worker -l info

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py shell
```

## Web Applications (React + Vite)

**Framework**: React 18.3.1 with TypeScript
**Build Tool**: Vite 5.4.19 with SWC plugin
**UI Library**: Radix UI components with Tailwind CSS
**State Management**: Zustand 4.5.2
**Data Fetching**: TanStack Query 5.83.0
**Routing**: React Router DOM 6.30.1
**Forms**: React Hook Form with Zod validation

### Key Dependencies
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library
- `recharts` - Chart components
- `sonner` - Toast notifications

### Common Commands
```bash
# Development (any web-* folder)
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Jest unit tests
npm run test:e2e     # Playwright e2e tests
npm run preview      # Preview production build
npm start            # Start production server
```

## Mobile Applications (Flutter)

**Framework**: Flutter 3.3.0+
**Language**: Dart
**Platform**: Android/iOS with Firebase integration

### Key Dependencies
- `http: ^1.2.2` - HTTP client
- `shared_preferences: ^2.2.3` - Local storage
- `firebase_core: ^2.30.0` - Firebase SDK
- `firebase_messaging: ^14.9.3` - Push notifications
- `intl: ^0.19.0` - Internationalization

### Common Commands
```bash
# Mobile development (any mobile-* folder)
flutter pub get      # Install dependencies
flutter run          # Run on connected device
flutter build apk    # Build Android APK
flutter build ios    # Build iOS app
flutter test         # Run tests
flutter clean        # Clean build cache
```

## Development Environment

**Package Managers**: 
- Python: pip (requirements.txt)
- Web: npm/bun (package.json)
- Mobile: Flutter pub (pubspec.yaml)

**Code Quality**:
- ESLint for JavaScript/TypeScript
- Flutter lints for Dart
- Django's built-in validation

**Testing**:
- Jest + Testing Library (web)
- Playwright (e2e)
- Flutter test framework (mobile)
- Django test framework (backend)