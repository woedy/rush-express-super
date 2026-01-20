# RushExpress Implementation Task List

Use this checklist as the authoritative execution plan. Check items only after the work is complete **and verified** (tests executed + passes or justified warnings).

## 0) Repository Baseline
- [x] Validate mono-repo structure matches spec (backend, web apps, mobile apps, docker-compose, README).
- [x] Align UI/UX reference from `web-customer` across other web apps (theme/colors/components audit).

## 1) Backend Bootstrap (Django + DRF + Channels + Celery)
- [x] Initialize Django project with settings for PostgreSQL, Redis, Celery, Channels.
- [x] Configure JWT auth (access + refresh) and token refresh/blacklist flow.
- [x] Add RBAC middleware/permissions and tenant isolation guardrails.
- [x] Add audit logging model + request ID logging + structured logging.
- [x] Add health checks: `/health` and `/ready`.
- [x] Add rate limiting for auth and order creation.
- [x] Add migrations and database indexes for all required entities.
- [x] Create seed script (demo merchant + branch + inventory + rider + customer).

## 2) Domain Models + Migrations
- [x] User model with roles: CUSTOMER, RIDER, MERCHANT, ADMIN.
- [x] Profiles: CustomerProfile, RiderProfile (KYC, vehicle), MerchantProfile.
- [x] MerchantBranch + InventoryItem.
- [x] Orders: Order + OrderItem + OrderTrackingEvent.
- [x] RiderAvailability, RiderLocation, RiderEarnings.
- [x] Payment + PaymentTransaction (Stripe/PayPal test modes).
- [x] Notification + ChatMessage.
- [x] AuditLog.

## 3) Core REST APIs
### Auth
- [x] POST `/auth/register` (role-specific rules).
- [x] POST `/auth/login`.
- [x] POST `/auth/refresh`.
- [x] POST `/auth/logout`.
- [x] GET `/me`.

### Customer
- [x] CRUD addresses.
- [x] Quote + create order + confirm payment.
- [x] Order history + reorder.
- [x] Order tracking (REST).
- [x] Chat endpoints (REST fetch).

### Rider
- [x] Availability online/offline.
- [x] Available orders list.
- [x] Accept assignment.
- [x] Update status (picked up, in transit, delivered).
- [x] Location update endpoint.
- [x] Earnings endpoints.

### Merchant
- [x] Branch CRUD.
- [x] Inventory CRUD.
- [x] Orders dashboard status updates.
- [x] Analytics endpoints (count, revenue, avg delivery time).

### Admin
- [ ] User management (list/suspend/verify rider KYC).
- [ ] Orders monitoring + reassign rider.
- [ ] System settings (delivery fee config).

## 4) Real-time (Channels + WebSockets)
- [ ] WebSocket auth with token.
- [ ] `/ws/notifications/` per-user channel.
- [ ] `/ws/orders/{order_id}/tracking/` real-time status + location events.
- [ ] `/ws/orders/{order_id}/chat/` live messaging + persistence.
- [ ] Celery tasks for notifications + status updates.

## 5) Shared Web Infrastructure
- [ ] Shared TypeScript API client with typed DTOs and error handling.
- [ ] Auth state management (Redux Toolkit or Zustand) and route guards.
- [ ] Global error handling (toast) + loading/empty states.
- [ ] WebSocket client integration for tracking/notifications.

## 6) Web Customer App
- [ ] Auth pages + protected routes.
- [ ] Address management + autocomplete stub.
- [ ] Create order flow (quote -> confirm -> payment).
- [ ] Order tracking timeline + map coordinates.
- [ ] Chat with rider UI (persisted history + real-time updates).
- [ ] Order history + reorder flow.
- [ ] PWA enabled.
- [ ] Tests: login flow, create order flow (RTL/Jest).
- [ ] Playwright E2E: login -> create order -> see status.

## 7) Web Rider App
- [ ] Auth pages + protected routes.
- [ ] Availability toggle + available orders board.
- [ ] Accept order + status update flow.
- [ ] Live location updates to backend.
- [ ] Earnings dashboard.
- [ ] Tests: rider accept flow (RTL/Jest).

## 8) Web Merchant App
- [ ] Auth pages + protected routes.
- [ ] Branch management.
- [ ] Inventory CRUD.
- [ ] Orders queue + status management.
- [ ] Analytics dashboard (basic charts).
- [ ] Tests: key inventory/order flows.

## 9) Web Admin App
- [ ] Auth pages + protected routes.
- [ ] Users table + suspend/verify actions.
- [ ] Orders table + reassign workflow.
- [ ] Analytics dashboard.
- [ ] Tests: key admin flows.

## 10) Mobile (Flutter)
- [ ] Customer app: auth + order list/detail + tracking status updates.
- [ ] Rider app: auth + active order + status updates.
- [ ] Merchant app: auth + orders list + status updates.
- [ ] Firebase push notifications setup + documentation.
- [ ] Offline-first caching (local storage) for core flows.

## 11) Docker + Deployment
- [ ] docker-compose services: backend, postgres, redis, celery-worker, celery-beat, nginx, web apps.
- [ ] Env templates and Coolify-friendly port configuration.
- [ ] Healthchecks + safe migration strategy + static/media volumes.

## 12) CI + Quality Gates
- [ ] GitHub Actions workflow: lint + test backend + test web-customer + web-rider.
- [ ] Backend tests: auth, RBAC, order lifecycle, websocket auth, chat persistence.
- [ ] Frontend tests: login, create order, rider accept flows.

## 13) Documentation
- [ ] Update root README with dev setup, env vars, migrations, seed data, tests, websockets, and Coolify deploy steps.
- [ ] Document state management choice (Redux Toolkit or Zustand) and rationale.

## 14) Final Verification
- [ ] Run full test suite and resolve failures.
- [ ] Validate end-to-end flows across customer/rider/merchant/admin.
