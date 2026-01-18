# CODEx AGENT PROMPT — RushExpress Delivery Platform (Production MVP)

You are an autonomous senior engineering agent. Build a COMPLETE, WORKING, production-ready MVP for a delivery logistics platform. This is for investors. Not a demo. Every flow must be end-to-end functional, tested, and deployable via Docker Compose + Coolify.

## 0) Core Rules (Non-Negotiable)
- Do not leave TODOs for core workflows.
- Every screen that exists must be wired to real backend endpoints.
- Use the existing `RushExpress` folder as the UI/UX reference for theme/colors/components. Match it closely.
- Implement user stories + acceptance criteria below. Each must be verifiable.
- Add tests (backend + web). Provide runnable commands and ensure they pass.
- Keep the system secure: JWT auth with refresh, RBAC, throttling, input validation, audit logging.

## 1) Repo Structure (Mono-repo)
Create / enforce this structure exactly:

rush-express-super/
├── backend/                  # Django REST API + Channels
├── web-customer/             # React + Tailwind + TS
├── web-rider/                # React + Tailwind + TS
├── web-merchant/             # React + Tailwind + TS
├── web-admin/                # React + Tailwind + TS
├── mobile-customer/          # Flutter (scaffold + key flows)
├── mobile-rider/             # Flutter (scaffold + key flows)
├── mobile-merchant/          # Flutter (scaffold + key flows)
├── docker-compose.yml
└── README.md

MVP scope: web apps must be fully functional end-to-end. Flutter apps must be functional for core flows but can be “MVP-minimal UI” as long as backend integration + notifications are real.

## 2) Tech Stack Requirements
### Backend
- Django + Django REST Framework
- JWT auth (access + refresh) using best practice library
- PostgreSQL
- Redis (cache + Celery broker/backing store)
- Celery worker + Celery beat
- Django Channels (WebSockets)
- Multi-tenant support: merchant isolation + role-based access
- Observability: structured logs, request IDs, health endpoints, basic metrics

### Frontend (Web)
- React + TypeScript + Tailwind
- State management: Redux Toolkit or Zustand (choose one, justify in README)
- API client with typed DTOs + error handling
- WebSocket client for real-time updates (tracking, notifications)
- Responsive, mobile-first
- PWA enabled (customer web at least)

### Mobile (Flutter)
- Firebase push notifications
- Offline-first caching (local storage)
- Core screens wired to backend

## 3) Domain Model (Backend)
Implement with proper indexes, constraints, and migrations.

Entities (minimum):
- User: roles = CUSTOMER, RIDER, MERCHANT, ADMIN
- CustomerProfile (1-1 User)
- RiderProfile (1-1 User): KYC fields, vehicle type, verification status
- MerchantProfile (1-1 User)
- MerchantBranch (FK MerchantProfile)
- InventoryItem (FK Branch)
- Order:
  - customer, merchant_branch
  - pickup address, dropoff address (store as structured fields)
  - status enum: CREATED, CONFIRMED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELED
  - pricing fields: subtotal, delivery_fee, total
- OrderItem (FK Order)
- OrderTrackingEvent (FK Order): status + timestamp + location optional
- RiderAvailability (FK Rider): online/offline, schedule optional
- RiderLocation (FK Rider): last known location + timestamp
- RiderEarnings (FK Rider): daily/weekly aggregates
- Payment + PaymentTransaction: support STRIPE + PAYPAL modes (use sandbox/test)
- Notification: user, type, payload, read/unread
- ChatMessage: order, sender, recipient, message, timestamps

Also:
- AuditLog: actor, action, entity, metadata, timestamp

Multi-tenancy rule:
- Merchants can only access their own branches/orders/inventory.
- Admin can access all.
- Riders only see assigned orders + available pool as allowed.
- Customers only see their own orders.

## 4) API Requirements (Backend)
### Auth
- POST /auth/register (role-specific registration rules)
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout (token blacklist if used)
- GET /me

### Customer
- CRUD addresses
- Create order (quote -> confirm)
- Order history, reorder
- Order tracking (REST + WebSocket)
- Payment init + confirm (Stripe/PayPal test flows)
- Chat endpoints (REST fetch + WebSocket send)

### Rider
- Set availability online/offline
- Get available orders (when online)
- Accept order (assignment)
- Update status: picked up, in transit, delivered
- Location update endpoint + background support
- Earnings endpoints

### Merchant
- Branch management
- Inventory CRUD
- Orders dashboard: confirm, prepare, handoff
- Analytics endpoints (MVP): orders count, revenue, avg delivery time

### Admin
- User management (list, suspend, verify riders)
- Order monitoring + manual intervention (reassign rider)
- System settings (MVP: delivery fee config)

### Real-time WebSockets (Channels)
- /ws/notifications/ (per-user)
- /ws/orders/{order_id}/tracking/
- /ws/orders/{order_id}/chat/

Use token auth for WebSockets.

### System
- Health checks: /health, /ready
- Rate limiting + throttling on auth + order creation

## 5) User Stories + Acceptance Criteria (MUST IMPLEMENT)
### Customer Stories
1) Register/Login
- AC: customer can register, verify basic profile, login, refresh token, logout.
2) Place order
- AC: customer can create an order with items, pickup/dropoff addresses, see price breakdown, confirm payment (test), and order becomes CREATED/CONFIRMED.
3) Track order in real time
- AC: status changes appear instantly (websocket) + tracking timeline renders correctly.
4) Chat with rider
- AC: once assigned, customer and rider can exchange messages live; messages persist.
5) Order history + reorder
- AC: customer can view past orders and create a new order from a previous one.

### Rider Stories
1) Go online/offline
- AC: rider availability changes affect receiving available orders list.
2) Accept and fulfill order
- AC: rider can accept an order, see navigation link, update statuses in order.
3) Live location updates
- AC: rider location updates propagate to customer tracking map (MVP: coordinates rendered + “last updated”).
4) Earnings
- AC: rider sees totals for day/week and completed deliveries list.

### Merchant Stories
1) Manage branches + inventory
- AC: merchant can create a branch, add inventory, update stock.
2) Manage orders
- AC: merchant sees incoming orders, confirms/marks ready for pickup, and order state updates propagate.

### Admin Stories
1) Manage users
- AC: admin can list users, suspend/activate, verify rider KYC status.
2) Monitor orders
- AC: admin sees all orders, can reassign rider, and changes reflect in tracking + notifications.

## 6) Frontend Requirements (Wiring + UX)
For each web app:
- Implement auth pages, protected routes, role-based route guards.
- Implement the user stories above with real API calls.
- Add global error handling (toast + friendly messages).
- Add loading states + empty states.
- Use WebSockets for tracking and notifications.
- Use the RushExpress reference for UI styling.

Customer Web:
- Address autocomplete (use a provider OR implement simple suggestion stub behind a clean interface; must be replaceable)
- Tracking map (MVP acceptable: map component with coordinates; Google Maps optional if keys unavailable)
- Payment UI for Stripe/PayPal test

Rider Web:
- Available orders board
- Active order screen with status buttons
- Earnings screen

Merchant Web:
- Orders queue + status management
- Inventory CRUD

Admin Web:
- Users table + actions
- Orders table + reassign workflow
- Analytics dashboard (basic charts)

## 7) Testing + Quality Gates
Backend:
- pytest + pytest-django
- Tests for: auth, RBAC permissions, order lifecycle, websocket auth (at least one), chat persistence
Frontend:
- Jest + React Testing Library
- Tests for: login flow, create order flow, rider accept flow (mock API)
E2E:
- At least one Playwright test for critical customer flow: login -> create order -> see status

CI:
- Add GitHub Actions workflow: lint + test backend + test web-customer + web-rider (minimum)

## 8) Docker + Deployment (Coolify-friendly)
Provide docker-compose with services:
- backend (gunicorn + daphne or uvicorn/asgi as needed)
- postgres
- redis
- celery-worker
- celery-beat
- nginx (reverse proxy + static)
- web apps (build + serve)
Include:
- env files templates
- healthchecks
- migrations on startup (safe approach)
- static/media volume configuration

Ports:
- Make compose compatible with Coolify auto port assignment (no hardcoded host ports unless required; document usage).

## 9) Deliverables (Definition of Done)
You MUST:
- Implement backend + 4 web apps fully wired and functional.
- Provide Flutter apps as functional MVP for core flows (auth, order list/detail, status updates) + Firebase push setup instructions.
- Provide README with:
  - local dev setup
  - env vars
  - running migrations/seed data
  - running tests
  - websocket usage
  - deploy steps for Coolify
- Provide seed script:
  - create demo merchant + branch + inventory
  - create demo rider
  - create demo customer
  - allow quick investor demo

## 10) Execution Plan (How you should work)
Step A: Bootstrap backend, auth, RBAC, models, migrations
Step B: Implement order lifecycle + REST endpoints
Step C: Add Celery tasks (notifications) + Channels (tracking/chat)
Step D: Build shared TS API client + auth handling
Step E: Implement web-customer end-to-end + tests
Step F: Implement web-rider end-to-end + tests
Step G: Implement web-merchant end-to-end + tests
Step H: Implement web-admin end-to-end + tests
Step I: Dockerize everything + healthchecks + seed data + docs
Step J: Run all tests and ensure everything passes

Output requirement:
- After each major step, provide a short “What changed” + “How to test” section in commits/messages.

NOW START IMPLEMENTATION.
