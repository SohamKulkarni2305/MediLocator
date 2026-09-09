# 🧠 MediLocator — Project Memory

> This file is **persistent AI context**. It represents the long-term memory of the MediLocator project. AI coding assistants should read this file at the start of every session to understand the current state of the project, what has been built, what is pending, and what constraints apply.

> **Last Updated:** 2026-09-08

---

## 1. Project Overview

**MediLocator** is a full-stack healthcare platform that connects patients, pharmacists, and healthcare administrators through a unified digital interface. Its core mission is to:

1. **Help patients** find affordable generic drug alternatives to expensive branded medications.
2. **Empower pharmacists** with AI-assisted prescription verification and drug matching workflows.
3. **Provide administrators** with pharmacy KYC management, regulatory compliance monitoring, and audit trail capabilities.

The platform bridges India's fragmented pharmaceutical supply chain by introducing price transparency (via an Orange Book equivalent), regulatory compliance dashboards, and real-time prescription tracking — all in a single SPA.

**Target Markets:** India (primary, INR pricing), International (USD pricing)
**Current Phase:** Prototype / Demo — all data is mocked; no live backend connected.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| UI Framework | React | 19.0.1 | Functional components + hooks |
| Build Tool | Vite | 6.2.3 | Dev server on port 3000 |
| Language | TypeScript | ~5.8.2 | Strict mode; all types in `src/types.ts` |
| Styling | TailwindCSS | v4.1.14 | Via `@tailwindcss/vite` plugin; no config file |
| AI / OCR | Google Gemini AI | `@google/genai` v2.4+ | Prescription OCR, molecule extraction |
| Animations | Motion (Framer Motion) | v12.23.24 | Import from `motion/react` |
| Icons | Lucide React | v0.546.0 | Only icon library in use |
| Charts | D3.js | v7.9.0 | Compliance line charts only |
| HTTP Server | Express | v4.21.2 | For server-side API proxy (Gemini calls) |
| Package Manager | npm / bun | — | `bun.lock` present; `npm` is primary |
| Runtime | Node.js | — | Via `tsx` for server scripts |

### Key Environment Variables
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI API key (server-side only, never expose client-side) |
| `APP_URL` | Hosted app URL (used for self-referential links) |

---

## 3. Features Completed

### Admin Console (`AdminConsole.tsx`)
- [x] Pharmacy KYC queue with status filters (Pending / Approved / Rejected / Inspection)
- [x] Pharmacy detail cards with document verification checklist
- [x] Approve / Reject / Flag for Inspection actions
- [x] GSTIN verification status indicator
- [x] Audit ledger timeline with cryptographic hash display
- [x] Orange Book drug price database (ceiling price vs. generic median)
- [x] Navigation to Pharmacist Workstation

### Pharmacist Workstation (`PharmacistWorkstation.tsx`)
- [x] Live case queue with SLA countdown timers (seconds remaining)
- [x] Case status pipeline: Queued → OCR Processing → Pre-Screened → Ready for Match → Active
- [x] Patient demographics panel (MRN, BP, HbA1c, allergies, condition)
- [x] Prescriber verification (name, degree, clinic, license, registration)
- [x] AI molecule identification with confidence scores and drug class
- [x] Branded → Generic drug substitution matching with price comparison
- [x] Lot number and expiry date tracking per line item
- [x] Equivalence code display (AB, AA, etc.)
- [x] Pharmacist sign-off with approval/rejection flow
- [x] Real-time prescription status sync to Customer portal (via Context)
- [x] Navigation to Admin Console and Customer Tracking

### Customer Search (`CustomerSearch.tsx`)
- [x] Drug search by brand name, generic name, or salt
- [x] Drug cards showing brand vs. generic price comparison
- [x] Savings percentage and amount (INR + USD)
- [x] Stock availability indicator
- [x] WHO-GMP / FDA Approved certification badges
- [x] NDC code display
- [x] Manufacturer information
- [x] Equivalence code display
- [x] Navigation to Prescription, Tracking, Account

### Customer Prescription (`CustomerPrescription.tsx`)
- [x] Prescription upload (camera / file / ABHA sync simulation)
- [x] Upload history list with status badges
- [x] OCR confidence score display
- [x] Medicine breakdown per prescription (brand vs. generic savings)
- [x] Refill tracking (allowed vs. remaining)
- [x] Validity / expiry date display
- [x] Pharmacist sign-off attribution
- [x] Rejection reason display
- [x] Prescription edit profile modal

### Customer Order Tracking (`CustomerTracking.tsx`)
- [x] Real-time order milestone timeline (Verified → Dispensed → Picked Up → En Route → Delivered)
- [x] Live courier speed, distance, and ETA display
- [x] Cold chain temperature monitoring
- [x] Dispensary name and pharmacist-in-charge display
- [x] Handover OTP generation and display
- [x] Total savings summary (branded vs. generic cost delta)

### Customer Account (`CustomerAccount.tsx`)
- [x] Patient profile (name, MRN, contact, ABHA ID)
- [x] Prescription history list
- [x] Account settings section
- [x] Edit profile modal (`EditProfileModal.tsx`)

### Prescription Notification Toast (`PrescriptionNotificationToast.tsx`)
- [x] Floating toast alert for prescription approval/rejection events
- [x] Animated entrance/exit via Motion
- [x] Audio chime on approval (`audioChime.ts`)
- [x] Deep-link navigation to relevant screen from toast

### Architecture Blueprint (`ArchitectureBlueprint.tsx`)
- [x] Visual system architecture diagram for internal documentation

### Regulatory Compliance Console (`RegulatoryComplianceConsole.tsx`)
- [x] Compliance KPI dashboard
- [x] D3.js multi-series line chart for compliance trends (`ComplianceD3LineChart.tsx`)
- [x] Compliance data from `src/data/complianceData.ts`

### Prescription History Section (`PrescriptionHistorySection.tsx`)
- [x] Detailed prescription history view with filtering

### Global Infrastructure
- [x] `PrescriptionContext` — shared state for prescriptions, toasts, actions
- [x] `NavigationHeader` — global screen switcher with currency toggle and mobile frame toggle
- [x] `CustomerBottomNav` — bottom navigation bar for customer screens
- [x] Dual-currency toggle (INR / USD) affecting all price displays
- [x] Mobile frame simulation for customer screens

---

## 4. Pending Features

> Items below have been identified but not yet implemented. Priority levels: 🔴 High · 🟡 Medium · 🟢 Low

| # | Feature | Priority | Notes |
|---|---------|----------|-------|
| P-001 | Real backend API integration (replace mock data) | 🔴 High | Express server exists; needs actual DB connection |
| P-002 | User authentication (login / signup / session management) | 🔴 High | No auth implemented; all screens are freely accessible |
| P-003 | Role-based access control (Admin / Pharmacist / Customer guards) | 🔴 High | Depends on P-002 |
| P-004 | Real Gemini OCR integration for prescription image processing | 🔴 High | API key configured; frontend flow simulated |
| P-005 | Database design and ORM setup (PostgreSQL or Firestore) | 🔴 High | Currently all data is in-memory mocks |
| P-006 | Push notification system for prescription status updates | 🟡 Medium | Currently simulated via Context toast |
| P-007 | ABHA (Ayushman Bharat Health Account) real API integration | 🟡 Medium | Currently simulated in upload flow |
| P-008 | Payment gateway integration for drug orders | 🟡 Medium | Pricing shown but no checkout flow |
| P-009 | Pharmacist availability / shift scheduling | 🟡 Medium | SLA timers present but no real scheduling |
| P-010 | Drug inventory management for pharmacies | 🟡 Medium | `inStock` boolean exists; no inventory CRUD |
| P-011 | Multi-pharmacy support (cluster management) | 🟡 Medium | Cluster field exists in `PharmacyKYC` type |
| P-012 | Real-time courier tracking with map integration | 🟢 Low | Currently simulated with ETA countdown |
| P-013 | Export / download prescription history as PDF | 🟢 Low | UI design not started |
| P-014 | Dark / light theme toggle | 🟢 Low | Currently dark-only |
| P-015 | Internationalization (i18n) for Hindi and regional languages | 🟢 Low | English-only currently |
| P-016 | Unit and integration test suite | 🔴 High | No tests exist yet |

---

## 5. API Endpoints

> **Status: Not yet implemented.** These are the planned REST API contracts based on the current mock data structures. When building real APIs, these endpoints must be created on the Express server.

### Authentication
```
POST   /api/auth/login          # Customer / Pharmacist / Admin login
POST   /api/auth/logout         # Invalidate session
GET    /api/auth/me             # Get current session user
```

### Prescriptions
```
GET    /api/prescriptions                    # List all prescriptions for current user
GET    /api/prescriptions/:id               # Get single prescription by ID
POST   /api/prescriptions                   # Upload new prescription (multipart/form-data)
PUT    /api/prescriptions/:id/approve       # Pharmacist approves prescription
PUT    /api/prescriptions/:id/reject        # Pharmacist rejects prescription
DELETE /api/prescriptions/:id               # Soft-delete a prescription
```

### Drugs / Formulary
```
GET    /api/drugs                           # Search drug formulary (query: ?q=metformin)
GET    /api/drugs/:id                       # Get drug details by ID
GET    /api/drugs/orange-book               # Get Orange Book ceiling price list
GET    /api/drugs/:id/generics              # Get generic equivalents for a drug
```

### Pharmacies (Admin)
```
GET    /api/pharmacies                      # List all pharmacies with KYC status
GET    /api/pharmacies/:id                  # Get pharmacy details
PUT    /api/pharmacies/:id/approve          # Approve pharmacy KYC
PUT    /api/pharmacies/:id/reject           # Reject pharmacy KYC
PUT    /api/pharmacies/:id/flag-inspection  # Flag for physical inspection
GET    /api/pharmacies/:id/audit-log        # Get audit ledger for pharmacy
```

### Pharmacist Cases
```
GET    /api/cases                           # List active pharmacist cases
GET    /api/cases/:id                       # Get case details
PUT    /api/cases/:id/signoff               # Pharmacist signs off on case
```

### Orders / Tracking
```
GET    /api/orders/:id                      # Get order tracking state
GET    /api/orders/:id/milestones           # Get delivery milestones
```

### AI / OCR (Gemini Proxy)
```
POST   /api/ai/ocr                          # Submit prescription image for OCR
POST   /api/ai/match-drugs                  # AI-assisted drug matching
```

### Compliance
```
GET    /api/compliance/kpis                 # Compliance KPI summary
GET    /api/compliance/trends               # Time-series compliance trend data
```

---

## 6. Database Schema Summary

> **Status: Not implemented.** Below is the intended schema derived from TypeScript interfaces in `src/types.ts`.

### `drugs` table
```sql
id               UUID PRIMARY KEY
brand_name       TEXT NOT NULL
generic_name     TEXT NOT NULL
salt_name        TEXT NOT NULL
strength         TEXT
dosage_form      TEXT
manufacturer     TEXT
is_brand         BOOLEAN
price_usd        DECIMAL(10,2)
price_inr        DECIMAL(10,2)
original_price_usd  DECIMAL(10,2)
original_price_inr  DECIMAL(10,2)
ndc_code         TEXT
equivalence_code TEXT  -- 'AB', 'AA', etc.
certification    TEXT  -- 'WHO-GMP', 'FDA Approved'
lot_number       TEXT
expiry_date      DATE
savings_percentage  INTEGER
in_stock         BOOLEAN
created_at       TIMESTAMPTZ DEFAULT NOW()
```

### `pharmacies` table
```sql
id               UUID PRIMARY KEY
name             TEXT NOT NULL
code             TEXT UNIQUE
license_number   TEXT
staff_count      INTEGER
cluster          TEXT
location         TEXT
status           TEXT CHECK (status IN ('pending','approved','rejected','inspection_pending'))
gstin_verified   BOOLEAN DEFAULT FALSE
submitted_at     TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

### `prescriptions` table
```sql
id               UUID PRIMARY KEY
rx_number        TEXT UNIQUE NOT NULL
patient_id       UUID REFERENCES users(id)
file_name        TEXT
file_size        TEXT
upload_date      DATE
upload_timestamp TIMESTAMPTZ
source           TEXT CHECK (source IN ('camera','file','abha_sync'))
doctor_name      TEXT
doctor_specialty TEXT
doctor_reg       TEXT
clinic_name      TEXT
clinic_location  TEXT
status           TEXT CHECK (status IN ('pending','approved','rejected','verified','expired'))
ocr_confidence   DECIMAL(5,2)
valid_until      DATE
refills_allowed  INTEGER
refills_remaining INTEGER
audit_hash       TEXT
pharmacist_id    UUID REFERENCES users(id)
rejection_reason TEXT
created_at       TIMESTAMPTZ DEFAULT NOW()
```

### `pharmacist_cases` table
```sql
id               UUID PRIMARY KEY
case_number      TEXT UNIQUE NOT NULL
prescription_id  UUID REFERENCES prescriptions(id)
patient_name     TEXT
mrn              TEXT
status           TEXT CHECK (status IN ('Ready for Match','OCR Processing','Pre-Screened','Queued','Active'))
sla_deadline     TIMESTAMPTZ
pharmacist_id    UUID
created_at       TIMESTAMPTZ DEFAULT NOW()
```

### `orders` table
```sql
id               UUID PRIMARY KEY
prescription_id  UUID REFERENCES prescriptions(id)
patient_id       UUID REFERENCES users(id)
pharmacy_id      UUID REFERENCES pharmacies(id)
status           TEXT
courier_name     TEXT
eta_minutes      INTEGER
temperature_celsius DECIMAL(4,1)
handover_otp     TEXT
total_paid_inr   DECIMAL(10,2)
total_saved_inr  DECIMAL(10,2)
created_at       TIMESTAMPTZ DEFAULT NOW()
```

---

## 7. Important Business Logic

### Drug Equivalence and Substitution
- Pharmacists match branded drugs to generics using **equivalence codes** (AB = therapeutically equivalent, AA = no in-vivo bioequivalence needed).
- Only drugs with `equivalenceCode === 'AB'` can be automatically substituted — `AA` and others require manual pharmacist decision.
- Price comparison always shows **savings percentage** = `(brandedPrice - genericPrice) / brandedPrice * 100`.

### Prescription Verification Flow
1. Customer uploads prescription image (camera / file / ABHA sync).
2. Gemini OCR extracts drug names, dosages, doctor info → stored in `PrescriptionRecord`.
3. System sets `status: 'pending'` and creates a `PharmacistCase` entry.
4. Pharmacist reviews case, verifies molecules, matches generics.
5. Pharmacist approves (sets `status: 'approved'`) or rejects (sets `status: 'rejected'`, adds `rejectionReason`).
6. `PrescriptionNotificationToast` fires for the customer.
7. Audio chime plays on approval.
8. On approval, order tracking begins (`OrderTrackingState`).

### OrangeBook Price Ceiling
- `OrangeBookEntry` defines the maximum allowed price (`ceilingPriceUSD`, `ceilingPriceINR`) for each salt/dosage form.
- No drug in the formulary may be sold above its Orange Book ceiling price.
- The admin console displays savings per entry: `ceilingPrice - genericMedian`.

### SLA (Service Level Agreement) for Pharmacists
- Each `PharmacistCase` has a `slaRemainingSeconds` countdown.
- When SLA reaches 0, the case must be escalated (future feature).
- SLA timer is displayed in real-time in the Pharmacist Workstation UI.

### Prescription Validity and Refills
- Prescriptions have a `validUntil` date — expired prescriptions cannot be refilled.
- `refillsRemaining` decrements on each order. When 0, the prescription cannot be used again.
- `daysRemaining: null` means the prescription has no expiry restriction.

### Currency Display Logic
- Global `currency: Currency` state (`'INR' | 'USD'`) is in `App.tsx`.
- Every price-displaying component receives this prop and conditionally renders INR (₹) or USD ($).
- No real-time exchange rate conversion — both values are pre-stored in data models.

---

## 8. Known Issues

| ID | Issue | Severity | Status | Notes |
|----|-------|---------|--------|-------|
| BUG-001 | No authentication — all screens freely accessible | Critical | Open | Awaiting backend implementation |
| BUG-002 | SLA countdown timers reset on page refresh | Medium | Open | State is local; needs persistence |
| BUG-003 | Mobile frame overflow on very small viewport heights (<700px) | Low | Open | `max-h-[820px]` constraint needed |
| BUG-004 | PrescriptionContext state lost if tab is closed | Medium | Open | No persistence layer yet |
| BUG-005 | AudioChime may not play on first load due to browser autoplay policy | Low | Open | Requires user gesture first |
| BUG-006 | D3 chart does not re-render correctly on rapid window resize | Low | Open | `ResizeObserver` debounce needed |
| BUG-007 | `npm run lint` (`tsc --noEmit`) is slow on large component files | Low | Open | Consider `tsc --incremental` |

---

## 9. Future Roadmap

### Phase 1 — Backend Foundation (Next)
- Set up PostgreSQL database with schema from Section 6.
- Build Express REST API endpoints from Section 5.
- Connect Gemini OCR API for real prescription processing.
- Implement JWT-based authentication.

### Phase 2 — Real Data Integration
- Replace all `src/data/mockData.ts` imports with API calls.
- Add loading states, error handling, and retry logic throughout.
- Implement real-time updates (WebSocket or SSE) for prescription status.

### Phase 3 — Production Hardening
- Add comprehensive unit and integration tests.
- Implement ABHA (Ayushman Bharat Health Account) real API.
- HIPAA/DPDP Act compliance audit and remediation.
- Performance optimization (lazy loading, code splitting).

### Phase 4 — Scale and Expansion
- Multi-pharmacy cluster management.
- Real courier/logistics API integration.
- Payment gateway for drug orders.
- Native mobile apps (React Native).
- Regional language support (Hindi, Marathi, Tamil).
