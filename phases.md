# ??? MediLocator � Development Phases

> This file is **persistent AI context**. It defines the sequential development phases of the MediLocator platform. Each phase builds on the previous and must be completed before the next begins. AI coding assistants should consult this file when planning new features or architectural changes.

> **Last Updated:** 2026-09-09

---

## Table of Contents

| Phase | Name | Status | Priority |
|-------|------|--------|----------|
| [Phase 0](#phase-0--prototype--demo-foundation) | Prototype / Demo Foundation | ? Complete | � |
| [Phase 1](#phase-1--backend-foundation) | Backend Foundation | ?? Pending | ?? High |
| [Phase 2](#phase-2--real-data-integration) | Real Data Integration | ?? Pending | ?? High |
| [Phase 3](#phase-3--production-hardening) | Production Hardening | ?? Pending | ?? Medium |
| [Phase 4](#phase-4--scale--expansion) | Scale & Expansion | ?? In Progress | ?? Low |

---

## Phase 0 � Prototype / Demo Foundation

> **Status:** ? Complete � **Version:** `0.1.0` � **Released:** 2026-09-08

### Goal
Build a fully functional frontend prototype demonstrating all three user roles (Admin, Pharmacist, Customer) with mocked data, AI-ready prescription flows, and a compliance dashboard � without any live backend dependency.

### Deliverables

#### ? Infrastructure
- [x] React 19 + Vite 6 + TypeScript 5.8 project setup
- [x] TailwindCSS v4 via `@tailwindcss/vite` plugin (no config file)
- [x] Express 4 scaffold for future API proxy
- [x] `vite.config.ts` with `@/` alias and HMR toggle
- [x] `.env.example` with `GEMINI_API_KEY` and `APP_URL`
- [x] `.gitignore` for `.env`, `node_modules`, `dist`
- [x] Core dependencies: `@google/genai`, `motion`, `lucide-react`, `d3`

#### ? Type System (`src/types.ts`)
- [x] `DrugItem` � drug formulary with brand/generic dual-currency pricing
- [x] `PharmacyKYC` � pharmacy onboarding and document verification
- [x] `AuditLedgerEntry` � immutable audit trail
- [x] `OrangeBookEntry` � price ceiling database
- [x] `PharmacistCase` � full case record with molecules and line items
- [x] `OrderTrackingState` � delivery milestones and courier state
- [x] `ActiveScreen`, `Currency` union types

#### ? State Management
- [x] `PrescriptionContext` with `PrescriptionProvider`
- [x] `PrescriptionRecord` CRUD actions
- [x] `VerificationToast` notification queue
- [x] `usePrescription()` custom hook

#### ? Mock Data
- [x] `src/data/mockData.ts` � drug formulary, KYC records, audit ledger, Orange Book, cases, order tracking
- [x] `src/data/complianceData.ts` � multi-series compliance KPI time-series

#### ? Screens & Components
- [x] `AdminConsole` � KYC queue, audit ledger, Orange Book viewer
- [x] `PharmacistWorkstation` � AI-assisted prescription verification
- [x] `CustomerSearch` � drug search with price comparison
- [x] `CustomerPrescription` � prescription upload and history
- [x] `CustomerTracking` � real-time order milestone tracking
- [x] `CustomerAccount` � patient profile management
- [x] `RegulatoryComplianceConsole` + `ComplianceD3LineChart`
- [x] `PrescriptionNotificationToast` � animated floating toast
- [x] `NavigationHeader` � global screen switcher with currency toggle
- [x] `ArchitectureBlueprint` � system architecture visualization

#### ? Persistent AI Context Files
- [x] `decisions.md` � technical decision log
- [x] `memory.md` � long-term project state
- [x] `changelog.md` � chronological change history
- [x] `rules.md` � coding and UI standards
- [x] `phases.md` � this file

---

## Phase 1 � Backend Foundation

> **Status:** ?? Pending � **Depends on:** Phase 0

### Goal
Stand up a real backend with a relational database, secure REST API, AI OCR integration, and authentication � replacing the mock data layer with production-grade infrastructure.

### Deliverables

#### ?? Database Setup
- [ ] Choose ORM: **Prisma** (recommended) or **Drizzle**
- [ ] Initialize **PostgreSQL** database (or **Firebase Firestore** if chosen)
- [ ] Implement schema from `memory.md` Section 6:
  - `users` table (Admin, Pharmacist, Customer roles)
  - `drugs` table
  - `pharmacies` table
  - `prescriptions` table
  - `pharmacist_cases` table
  - `orders` table
- [ ] Write and test database migrations
- [ ] Seed database with existing mock data for smoke testing

#### ?? Authentication (P-002, P-003)
- [ ] Implement **JWT-based** login / logout / session refresh
- [ ] `POST /api/auth/login` � supports Admin / Pharmacist / Customer roles
- [ ] `POST /api/auth/logout` � invalidate refresh token
- [ ] `GET /api/auth/me` � return current session user
- [ ] Role-based access control (RBAC) middleware guards for all API routes
- [ ] Secure `httpOnly` cookies for token storage

#### ?? REST API Endpoints (P-001)
Implement all endpoints defined in `memory.md` Section 5:
- [ ] `GET/POST/PUT/DELETE /api/prescriptions`
- [ ] `GET /api/drugs`, `GET /api/drugs/orange-book`, `GET /api/drugs/:id/generics`
- [ ] `GET/PUT /api/pharmacies` (admin-only)
- [ ] `GET/PUT /api/cases` (pharmacist-only)
- [ ] `GET /api/orders/:id`
- [ ] `GET /api/compliance/kpis`, `GET /api/compliance/trends`
- [ ] Input validation with **Zod** schemas on all endpoints
- [ ] Standardized error responses with HTTP status codes

#### ?? Gemini AI OCR Integration (P-004)
- [ ] Implement `POST /api/ai/ocr` � server-side Gemini multimodal call
- [ ] Implement `POST /api/ai/match-drugs` � AI-assisted drug matching
- [ ] Secure `GEMINI_API_KEY` handling (server-side only, never client-exposed)
- [ ] Store OCR confidence scores in `prescriptions.ocr_confidence`
- [ ] Fallback handling for OCR failures (manual entry fallback)

#### ?? Express Server Hardening
- [ ] Add **Helmet** for HTTP security headers
- [ ] Add **rate limiting** (express-rate-limit) on auth and AI endpoints
- [ ] Add **CORS** configuration for frontend origin
- [ ] Add **morgan** for HTTP request logging
- [ ] Add **compression** middleware

### Acceptance Criteria
- All API endpoints return correct data from a live PostgreSQL database
- JWT auth flow works end-to-end (login ? token ? protected route)
- Gemini OCR extracts drug names from a real prescription image
- No mock data is required for core flows

---

## Phase 2 � Real Data Integration

> **Status:** ?? Pending � **Depends on:** Phase 1

### Goal
Replace all mock data imports in the frontend with real API calls. Add loading states, error handling, retry logic, and real-time prescription status updates.

### Deliverables

#### ?? API Client Layer
- [ ] Create `src/api/` module with typed API client functions
- [ ] Replace all `src/data/mockData.ts` imports with API calls
- [ ] Replace all `src/data/complianceData.ts` imports with `GET /api/compliance/trends`
- [ ] Use **TanStack Query** (or `useSWR`) for server state, caching, and background refetch
- [ ] Global **Axios** or `fetch` wrapper with auth token injection

#### ?? Loading & Error States
- [ ] Skeleton loaders for all data-heavy screens (Drug cards, KYC queue, Case list)
- [ ] Error boundary components for API failure states
- [ ] Toast notifications for API errors (extends existing toast system)
- [ ] Retry logic with exponential backoff on failed requests

#### ?? Real-Time Updates (P-006)
- [ ] Implement **WebSocket** or **Server-Sent Events (SSE)** for:
  - Prescription status changes (Customer portal notifications)
  - Pharmacist case queue updates (new case arrivals)
  - SLA countdown persistence (fixes BUG-002)
- [ ] Replace `PrescriptionContext` mock polling with real-time event subscription

#### ?? Prescription Upload Flow (P-004)
- [ ] Wire `CustomerPrescription` upload to `POST /api/prescriptions` (multipart/form-data)
- [ ] Send uploaded image to `POST /api/ai/ocr` and display real confidence score
- [ ] Persist upload history from `GET /api/prescriptions`

#### ?? ABHA Integration (P-007)
- [ ] Integrate **ABHA (Ayushman Bharat Health Account)** real API for prescription sync
- [ ] Handle ABHA auth flow and token management
- [ ] Fallback to manual upload if ABHA sync fails

#### ?? State Management Upgrade
- [ ] Migrate `PrescriptionContext` state to server-state (TanStack Query)
- [ ] Keep UI-only state (active screen, mobile frame, currency) in React Context
- [ ] Add optimistic updates for pharmacist sign-off actions

### Acceptance Criteria
- All screens display real data from the live database
- Prescription upload ? OCR ? pharmacist approval ? customer notification works end-to-end in real time
- No hardcoded mock data remains in frontend code

---

## Phase 3 � Production Hardening

> **Status:** ?? Pending � **Depends on:** Phase 2

### Goal
Make MediLocator production-ready: tested, compliant, accessible, performant, and deployable to a cloud environment.

### Deliverables

#### ?? Testing (P-016)
- [ ] Set up **Vitest** for unit tests + **React Testing Library** for component tests
- [ ] Unit tests for all utility functions (`audioChime.ts`, currency formatting, equivalence logic)
- [ ] Component tests for critical flows: prescription upload, pharmacist sign-off, KYC actions
- [ ] API integration tests with **supertest** for all REST endpoints
- [ ] Target: **= 80% code coverage** on business-critical modules
- [ ] E2E test suite with **Playwright** for core user journeys

#### ?? Regulatory Compliance
- [ ] **HIPAA** compliance audit: data encryption at rest and in transit, PHI handling
- [ ] **DPDP Act (India)** compliance: data minimization, consent management, right to erasure
- [ ] End-to-end **TLS** enforcement (HTTPS only)
- [ ] Audit log completeness review (all PHI access must be logged)
- [ ] Penetration testing on auth and prescription endpoints

#### ?? Performance Optimization
- [ ] Code splitting and lazy loading for all route-level components
- [ ] `React.lazy()` + `Suspense` for screen components
- [ ] Image optimization for prescription uploads (client-side compression before upload)
- [ ] Bundle analysis (`vite-bundle-visualizer`) and tree-shaking audit
- [ ] Fix BUG-006: `ResizeObserver` debounce for D3 chart resize
- [ ] Fix BUG-007: Enable `tsc --incremental` for faster lint

#### ?? Accessibility (a11y)
- [ ] Full ARIA attribute audit on all interactive elements
- [ ] Keyboard navigation support across all screens
- [ ] Screen reader compatibility testing
- [ ] Color contrast ratio compliance (WCAG 2.1 AA minimum)

#### ?? Dark / Light Theme Toggle (P-014)
- [ ] Implement `prefers-color-scheme` detection
- [ ] Add manual dark/light toggle in `NavigationHeader`
- [ ] Persist theme preference in `localStorage`

#### ?? CI/CD Pipeline
- [ ] GitHub Actions workflow: lint ? typecheck ? test ? build on every PR
- [ ] Automated deployment to staging on merge to `main`
- [ ] Production deployment gate requiring manual approval
- [ ] Environment secrets management (never commit `.env`)

#### ?? Monitoring & Observability
- [ ] Error tracking with **Sentry** (frontend + backend)
- [ ] API performance monitoring (response times, error rates)
- [ ] Health check endpoint `GET /health` for uptime monitoring
- [ ] Structured logging (JSON) on Express server

### Acceptance Criteria
- All critical paths have automated test coverage
- App passes HIPAA and DPDP Act compliance checklist
- Lighthouse score = 90 on Performance, Accessibility, Best Practices
- CI/CD pipeline green on every merge

---

## Phase 4 � Scale & Expansion

> **Status:** ?? In Progress � **Depends on:** Phase 3

### Goal
Expand MediLocator to handle multi-pharmacy clusters, native mobile platforms, payment processing, real logistics, and regional language support.

### Deliverables

#### ?? Multi-Pharmacy Cluster Management (P-011)
- [ ] Implement pharmacy cluster grouping in the Admin Console
- [ ] Cluster-level KYC aggregation and compliance reporting
- [ ] Cross-pharmacy drug inventory visibility
- [ ] Cluster admin role with scoped permissions

#### ?? Drug Inventory Management (P-010)
- [x] Full inventory CRUD foundation with low-stock alerts and reorder thresholds
- [ ] Low-stock alerts for pharmacists
- [ ] Reorder triggers and supplier management scaffold
- [ ] Real-time inventory deduction on prescription fulfillment

#### ?? Payment Gateway Integration (P-008)
- [x] Provider-neutral payment checkout/refund API foundation for Razorpay and Stripe adapters
- [ ] Checkout flow: drug selection ? address ? payment ? confirmation
- [ ] Invoice generation and download (PDF)
- [ ] Refund and dispute handling scaffold
- [ ] Payment audit trail in the Admin Console

#### ?? Real Courier / Logistics Tracking (P-012)
- [x] Provider-neutral logistics status and webhook API foundation
- [ ] Live GPS map integration for `CustomerTracking` (Google Maps or Mapbox)
- [ ] Webhook receiver for courier status updates
- [ ] Cold-chain IoT sensor data integration (temperature monitoring)

#### ?? Pharmacist Shift Scheduling (P-009)
- [x] Shift calendar API foundation with pharmacist assignment and status
- [ ] SLA escalation routing based on active pharmacist availability
- [ ] Case assignment and load balancing across shift pharmacists

#### ?? Native Mobile Apps
- [ ] React Native app for Customer role (iOS + Android)
- [ ] Share business logic and API client with web frontend
- [ ] Push notifications via FCM (Firebase Cloud Messaging) for prescription updates
- [ ] Biometric authentication (Face ID / Fingerprint) for mobile login

#### ?? Internationalization (P-015)
- [x] Lightweight translation foundation with English/Hindi language persistence
- [ ] Translate every remaining UI string to **Hindi** (follow-up content pass)
- [ ] Add **Marathi** and **Tamil** (stretch goal)
- [ ] RTL layout support (if Arabic or Urdu is added later)
- [ ] Locale-aware date and number formatting

#### ?? Export & Reports (P-013)
- [x] Report summary API foundation and existing compliance export flow
- [ ] Pharmacist case report exports (CSV / Excel)
- [ ] Admin compliance report exports with D3 chart snapshots
- [ ] Scheduled email reports for admin users

### Acceptance Criteria
- Multi-pharmacy clusters are manageable from a single Admin Console
- Native mobile app is published to App Store and Google Play
- Payment gateway processes real transactions end-to-end
- App is fully translated into Hindi with locale-aware formatting

### Current release blockers
- Real payment processing requires Razorpay/Stripe merchant credentials and webhook secrets.
- Real courier tracking requires a Delhivery/Shiprocket account and webhook contract.
- Native publication requires React Native build pipelines, signing credentials, and App Store/Play Console access.
- Full Hindi coverage requires a content pass across every existing screen, not only the shared navigation controls.

---

## Phase Dependency Map

```
Phase 0 (Prototype)
    |
    v
Phase 1 (Backend Foundation)
    |
    v
Phase 2 (Real Data Integration)
    |
    v
Phase 3 (Production Hardening)
    |
    v
Phase 4 (Scale & Expansion)
```

---

## Phase Status Legend

| Symbol | Meaning |
|--------|---------|
| ? Complete | All deliverables shipped and verified |
| ?? Pending | Not yet started |
| ?? In Progress | Actively being worked on |
| ?? Blocked | Waiting on a dependency or decision |
| ? Cancelled | Descoped; see decisions.md for rationale |

---

## Related Files

| File | Purpose |
|------|---------|
| `memory.md` | Long-term project state, tech stack, pending features |
| `decisions.md` | Architectural and technical decision log |
| `changelog.md` | Chronological change history |
| `rules.md` | Coding standards and UI rules |
