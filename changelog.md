# 📜 MediLocator — Changelog

> This file is **persistent AI context**. Every change to the codebase must be recorded here in reverse chronological order (newest first). AI coding assistants should append a new entry here after completing any significant task.
>
> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

---

## Versioning Guide

| Increment | When | Example |
|-----------|------|---------|
| **MAJOR** (x.0.0) | Breaking changes, major re-architecture | `1.0.0 → 2.0.0` |
| **MINOR** (0.x.0) | New features, new screens, new integrations | `0.1.0 → 0.2.0` |
| **PATCH** (0.0.x) | Bug fixes, UI tweaks, copy changes | `0.1.0 → 0.1.1` |

---

## [Unreleased]

### Added
- React Query API client and mutation/query hooks for the Phase 2 data integration layer
- Server-Sent Events endpoint and frontend listener for prescription status notifications

### Changed
- Aligned Prisma CLI and client to 6.17.0, matching the existing schema and backend API
- Wired the SSE listener into the app while keeping `PrescriptionProvider` as the outermost wrapper

### Fixed
- Resolved TypeScript errors across Zod validation, Gemini response handling, chart statistics, and prescription context typing
- Verified frontend lint, backend compilation, and production Vite build
- Added native Node test coverage for request schemas and authentication helpers
- Added lazy-loaded screen chunks, persisted theme switching, and debounced D3 chart resizing
- Started Phase 4 with multi-pharmacy cluster filtering and cluster-level Admin Console metrics
- Added cluster-aware mock inventory management with stock alerts and reorder actions
- Added provider-ready operations APIs for inventory, payment checkout/refunds, logistics webhooks, pharmacist shifts, and report summaries
- Added persistent English/Hindi language toggle in the frontend navigation
- Added working role-aware login screens for Admin, Medical/Pharmacist, and Patient/User accounts
- Connected Prisma to MongoDB Atlas, synchronized collections/indexes, and verified seed users

> Features merged to `main` but not yet versioned / deployed.

### Added
- `decisions.md` — persistent AI context for all technical decisions
- `rules.md` — persistent AI context for project coding and UI rules
- `memory.md` — persistent AI context for long-term project state
- `changelog.md` — persistent AI context for chronological change history (this file)

---

## [0.1.0] — 2026-09-08

> **Initial prototype release.** Full multi-role SPA with mocked data, AI-ready prescription flow, and compliance dashboard.

### Added

#### Infrastructure
- Initialized project with **React 19 + Vite 6 + TypeScript 5.8**
- Configured **TailwindCSS v4** via `@tailwindcss/vite` plugin
- Added **Express 4** as HTTP server scaffold for future API proxy
- Configured `vite.config.ts` with `@/` path alias and HMR toggle (respects `DISABLE_HMR`)
- Added `.env.example` with `GEMINI_API_KEY` and `APP_URL` documentation
- Added `.gitignore` excluding `.env`, `node_modules`, `dist`
- Installed core dependencies: `@google/genai`, `motion`, `lucide-react`, `d3`

#### Type System (`src/types.ts`)
- Defined `DrugItem` interface — full drug formulary record with brand/generic prices (INR + USD)
- Defined `PharmacyKYC` interface — pharmacy onboarding with document verification
- Defined `AuditLedgerEntry` interface — immutable audit trail with type-safe action categories
- Defined `OrangeBookEntry` interface — price ceiling database entry
- Defined `PharmacistCase` interface — full case record with patient, prescriber, molecules, line items
- Defined `OrderTrackingState` interface — real-time delivery tracking with milestones
- Defined `ActiveScreen` union type — all 7 navigable screens
- Defined `Currency` union type — `'INR' | 'USD'`

#### State Management (`src/context/PrescriptionContext.tsx`)
- Created `PrescriptionProvider` — React Context wrapping entire app
- Implemented `PrescriptionRecord` state with full CRUD actions
- Implemented `VerificationToast` queue for pharmacist approval/rejection notifications
- Exposed `usePrescription()` custom hook for clean consumer API
- Integrated `playVerificationChime()` on prescription approval events

#### Utilities (`src/utils/`)
- Created `audioChime.ts` — Web Audio API-based chime generator (no audio file dependency)

#### Mock Data (`src/data/`)
- Created `mockData.ts` — comprehensive mock drug formulary, pharmacy KYC records, audit ledger, Orange Book entries, pharmacist cases, order tracking state
- Created `complianceData.ts` — multi-series compliance KPI time-series data for D3 charts

#### Components

**Admin Console**
- `AdminConsole.tsx` — pharmacy KYC management, audit ledger, Orange Book viewer
  - Pharmacy queue with filterable status tabs
  - Document verification checklist per pharmacy
  - Approve / Reject / Inspect action buttons
  - Immutable audit ledger with cryptographic signature display
  - Orange Book ceiling price table

**Pharmacist Workstation**
- `PharmacistWorkstation.tsx` — AI-assisted prescription verification workstation
  - Live case queue with real-time SLA countdown timers
  - Patient demographics and vitals panel
  - Prescriber identity verification panel
  - AI molecule identification with confidence scores
  - Branded → Generic drug substitution matching
  - Lot number / expiry date per line item
  - Pharmacist sign-off with approval and rejection flows

**Customer Portal**
- `CustomerSearch.tsx` — drug formulary search with price comparison cards
- `CustomerPrescription.tsx` — prescription upload, history, status tracking
- `CustomerTracking.tsx` — real-time order milestone and courier tracking with OTP handover
- `CustomerAccount.tsx` — patient profile and prescription history
- `CustomerBottomNav.tsx` — persistent bottom navigation for customer screens

**Prescription Upload Simulator**
- `PrescriptionUploadSimulator.tsx` — upload flow (camera / file / ABHA sync) with OCR simulation

**Prescription History**
- `PrescriptionHistorySection.tsx` — detailed prescription history with filter and detail view

**Modals**
- `Modals.tsx` — reusable modal shell with backdrop and close handling
- `EditProfileModal.tsx` — customer profile editing modal

**Notifications**
- `PrescriptionNotificationToast.tsx` — animated floating toast for prescription status updates

**Navigation**
- `NavigationHeader.tsx` — global top navigation with screen switcher, currency toggle, mobile frame toggle

**Compliance**
- `RegulatoryComplianceConsole.tsx` — compliance KPI dashboard with trend analysis
- `ComplianceD3LineChart.tsx` — D3.js multi-series line chart for compliance metrics

**Architecture**
- `ArchitectureBlueprint.tsx` — internal system architecture visualization

#### App Shell (`src/App.tsx`)
- Implemented screen-based SPA routing via `ActiveScreen` state
- Added mobile frame simulation for customer screens (iPhone-style mockup)
- Threaded `currency: Currency` prop to all screens
- Integrated `PrescriptionProvider` as root wrapper
- Integrated `PrescriptionNotificationToast` as floating layer

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Removed
- N/A (initial release)

---

<!-- 
TEMPLATE — Copy and fill in for each new release:

## [X.Y.Z] — YYYY-MM-DD

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

-->
