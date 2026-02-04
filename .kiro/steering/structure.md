# Project Structure & Organization

## Root Directory Layout

```
├── backend/                 # Django REST API
├── web-admin/              # React admin dashboard
├── web-customer/           # React customer portal
├── web-merchant/           # React merchant portal
├── web-rider/              # React rider portal
├── mobile-customer/        # Flutter customer app
├── mobile-merchant/        # Flutter merchant app
├── mobile-rider/           # Flutter rider app
└── verify_auth.py          # Utility script
```

## Backend Structure (Django)

```
backend/
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
├── rush_express/          # Main Django project
│   ├── settings.py        # Configuration
│   ├── urls.py           # URL routing
│   ├── asgi.py           # ASGI config for WebSockets
│   └── wsgi.py           # WSGI config
├── accounts/              # User management app
├── core/                  # Core functionality
│   ├── models.py         # Shared models
│   ├── middleware.py     # Custom middleware
│   ├── audit.py          # Audit logging
│   ├── channels.py       # WebSocket consumers
│   └── tenancy.py        # Multi-tenancy support
└── delivery/              # Main business logic
    ├── models.py         # Order, Payment, etc.
    ├── views.py          # API endpoints
    ├── serializers.py    # Data serialization
    ├── permissions.py    # Access control
    ├── pricing.py        # Delivery pricing
    ├── tasks.py          # Celery tasks
    └── consumers.py      # WebSocket consumers
```

## Web Applications Structure (React)

All web apps follow the same structure pattern:

```
web-{role}/
├── package.json           # Dependencies & scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS config
├── components.json       # shadcn/ui config
├── src/
│   ├── main.tsx          # App entry point
│   ├── App.tsx           # Root component
│   ├── components/       # Reusable components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Layout.tsx   # App layout
│   │   ├── Navigation.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/           # Route components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── {Role}Dashboard.tsx
│   ├── lib/             # Utilities & services
│   │   ├── api.ts       # API client
│   │   ├── auth.ts      # Authentication
│   │   ├── types.ts     # TypeScript types
│   │   ├── utils.ts     # Helper functions
│   │   └── ws.ts        # WebSocket client
│   ├── hooks/           # Custom React hooks
│   └── __tests__/       # Unit tests
├── tests/               # E2E tests (Playwright)
└── public/              # Static assets
```

## Mobile Applications Structure (Flutter)

All mobile apps follow Flutter conventions:

```
mobile-{role}/
├── pubspec.yaml          # Dependencies & config
├── android/             # Android-specific files
│   └── app/
│       └── build.gradle.kts
├── lib/
│   ├── main.dart        # App entry point
│   └── src/
│       ├── api_client.dart    # HTTP client
│       ├── auth_store.dart    # Authentication state
│       ├── cache_store.dart   # Local storage
│       ├── models.dart        # Data models
│       └── screens/           # UI screens
│           ├── home_screen.dart
│           ├── login_screen.dart
│           └── register_screen.dart
└── README.md
```

## Key Architectural Patterns

### Backend Patterns
- **Django Apps**: Modular organization (accounts, core, delivery)
- **Model-View-Serializer**: Standard DRF pattern
- **Custom Permissions**: Role-based access control
- **WebSocket Consumers**: Real-time communication
- **Celery Tasks**: Background job processing

### Frontend Patterns
- **Component-Based**: Reusable UI components with shadcn/ui
- **Route-Based**: Page components for different routes
- **Service Layer**: API clients and utilities in `lib/`
- **Custom Hooks**: Shared logic extraction
- **Protected Routes**: Authentication-based routing

### Mobile Patterns
- **Screen-Based**: Flutter screen widgets
- **State Management**: Local state with shared preferences
- **Service Classes**: API clients and data stores
- **Model Classes**: Data transfer objects

## Naming Conventions

- **Files**: snake_case for Python, kebab-case for web, snake_case for Dart
- **Components**: PascalCase for React components
- **Variables**: camelCase for JavaScript/TypeScript, snake_case for Python/Dart
- **Constants**: UPPER_SNAKE_CASE across all platforms
- **Database**: snake_case for tables and columns

## Configuration Management

- **Backend**: Environment variables with fallbacks in settings.py
- **Web**: Vite environment variables and build configs
- **Mobile**: Flutter configuration in pubspec.yaml and build files
- **Shared**: Common patterns for API endpoints and authentication