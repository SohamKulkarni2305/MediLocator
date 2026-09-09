# 📋 MediLocator — Decision Log

> This file is **persistent AI context**. Every important technical or product decision must be recorded here. AI coding assistants should read this file before making architectural or design choices.

---

## Table of Contents

| # | Decision | Date | Impact |
|---|----------|------|--------|
| D-001 | [React + Vite as Frontend Framework](#d-001-react--vite-as-frontend-framework) | 2026-09-08 | High |
| D-002 | [TailwindCSS v4 for Styling](#d-002-tailwindcss-v4-for-styling) | 2026-09-08 | High |
| D-003 | [TypeScript for Type Safety](#d-003-typescript-for-type-safety) | 2026-09-08 | High |
| D-004 | [Gemini AI API for OCR and Intelligence](#d-004-gemini-ai-api-for-ocr-and-intelligence) | 2026-09-08 | Critical |
| D-005 | [React Context API for State Management](#d-005-react-context-api-for-state-management) | 2026-09-08 | High |
| D-006 | [Multi-Role SPA Architecture](#d-006-multi-role-spa-architecture) | 2026-09-08 | Critical |
| D-007 | [Dual-Currency Support (INR + USD)](#d-007-dual-currency-support-inr--usd) | 2026-09-08 | Medium |
| D-008 | [D3.js for Compliance Visualizations](#d-008-d3js-for-compliance-visualizations) | 2026-09-08 | Medium |
| D-009 | [Mock Data Architecture for Demo Mode](#d-009-mock-data-architecture-for-demo-mode) | 2026-09-08 | Medium |
| D-010 | [Motion (Framer Motion) for Animations](#d-010-motion-framer-motion-for-animations) | 2026-09-08 | Low |

---

## D-001: React + Vite as Frontend Framework

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
MediLocator requires a fast, interactive UI with multiple role-based screens (Admin, Pharmacist, Customer). A modern frontend framework is needed to handle component reuse, state, and rapid iteration.

### Decision Taken
Use **React 19** with **Vite 6** as the build tool and development server.

### Reasoning
- React's component model suits the multi-screen, role-based UI architecture perfectly.
- Vite provides extremely fast HMR and build times compared to CRA or Webpack.
- React 19 introduces improvements to concurrent rendering and server components support.
- Large ecosystem of compatible libraries (Lucide, Motion, D3).

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|----------------|
| Next.js | Overkill for a primarily client-side demo; SSR not needed |
| Vue 3 | Team unfamiliarity; smaller ecosystem for this domain |
| Angular | Too verbose and opinionated for rapid prototyping |
| Svelte | Smaller ecosystem; fewer compatible UI libraries |

### Impact
- All components are `.tsx` files under `src/components/`.
- Routing is done via `ActiveScreen` state in `App.tsx` (no React Router).
- Build output via `npm run build`; dev server on port 3000.

---

## D-002: TailwindCSS v4 for Styling

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
The UI needs to be visually rich, responsive, and maintainable without writing extensive custom CSS. A utility-first approach allows rapid design iteration.

### Decision Taken
Use **TailwindCSS v4** via `@tailwindcss/vite` plugin (no separate `tailwind.config.js` needed).

### Reasoning
- TailwindCSS v4 integrates directly into Vite via plugin, removing config boilerplate.
- Utility classes allow component-level scoping without CSS file sprawl.
- Dark mode (`slate-900`, `slate-800` palette) enforced through utility classes.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|----------------|
| Plain CSS / CSS Modules | Slower iteration; harder to maintain consistency |
| Styled Components | Runtime overhead; doesn't align with TW ecosystem |
| MUI / Chakra UI | Heavy dependency; opinionated component design conflicts with custom UI |

### Impact
- No `tailwind.config.js` — v4 uses CSS-based config via `@import "tailwindcss"`.
- All styling is done inline via Tailwind utility classes in JSX.
- Custom component styles should use `@layer components` if a `globals.css` is introduced.

---

## D-003: TypeScript for Type Safety

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
MediLocator deals with complex domain entities (prescriptions, drug records, pharmacy KYC, audit ledgers). Untyped JavaScript risks runtime errors in critical healthcare workflows.

### Decision Taken
Use **TypeScript ~5.8** across the entire codebase. All types are centralized in `src/types.ts`.

### Reasoning
- Strong typing prevents mismatched data structures (e.g., `PrescriptionRecord`, `PharmacistCase`).
- IDE autocomplete improves developer velocity significantly.
- `tsc --noEmit` used as the lint step in `npm run lint`.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|----------------|
| Plain JavaScript | Too error-prone for healthcare data models |
| JSDoc typing | Inferior IDE support; not enforceable at compile time |

### Impact
- All interfaces and types live in `src/types.ts`.
- `tsconfig.json` uses strict mode.
- New data shapes MUST be added to `types.ts` before being used in components.

---

## D-004: Gemini AI API for OCR and Intelligence

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
Prescription processing requires OCR to extract drug names, dosages, and doctor information from uploaded images. Generic OCR tools lack healthcare-domain understanding.

### Decision Taken
Use **Google Gemini AI** (`@google/genai` v2.4+) for prescription OCR, molecule identification, and AI-assisted drug matching.

### Reasoning
- Gemini's multimodal capabilities handle image + text understanding natively.
- `GEMINI_API_KEY` is already configured as a project secret.
- Better healthcare context than generic OCR (e.g., AWS Textract, Tesseract).

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|----------------|
| AWS Textract | No domain intelligence; requires post-processing NLP |
| Tesseract.js | Client-side only; poor accuracy on handwritten prescriptions |
| OpenAI GPT-4V | Higher cost; no special advantage for Indian drug names |
| Azure Computer Vision | Requires Azure account setup; no advantage over Gemini |

### Impact
- `GEMINI_API_KEY` must be set in `.env` (never committed to git).
- AI calls are made server-side or via secure proxy to avoid key exposure.
- Confidence scores from AI (`ocrConfidence`) are stored in `PrescriptionRecord`.

---

## D-005: React Context API for State Management

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
Prescription data (records, verification toasts, status updates) must be shared across the Customer, Pharmacist, and Notification components without prop-drilling.

### Decision Taken
Use the **React Context API** (`PrescriptionContext`) for shared prescription state. No external state library.

### Reasoning
- The app's state complexity is moderate — Context API is sufficient without Redux overhead.
- `PrescriptionProvider` wraps the entire app in `App.tsx`, making state universally accessible.
- Custom hooks (`usePrescription`) provide a clean consumption API.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|----------------|
| Redux Toolkit | Overkill; boilerplate-heavy for this scale |
| Zustand | Valid alternative; rejected to avoid adding dependencies |
| Jotai / Recoil | Experimental for this use case; team unfamiliarity |

### Impact
- All prescription CRUD operations go through `PrescriptionContext`.
- Verification toast notifications are triggered via context actions.
- Audio chime (`audioChime.ts`) plays on prescription approval — triggered from context.

---

## D-006: Multi-Role SPA Architecture

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
MediLocator serves three distinct user roles: Admin, Pharmacist, and Customer. Each has different UI needs, data access, and workflows.

### Decision Taken
Implement a **single-page application** with screen-based navigation using an `ActiveScreen` union type and a `NavigationHeader` switcher — no URL routing.

### Reasoning
- Demo/prototype context: URL-based routing would add complexity without user benefit.
- `NavigationHeader` provides a single control point for switching between all 7 screens.
- Mobile frame toggle (`isMobileFrame`) demonstrates customer app in a phone mockup.

### Screens Defined
| Screen Key | Component | Role |
|-----------|-----------|------|
| `admin-console` | `AdminConsole` | Admin |
| `pharmacist-workstation` | `PharmacistWorkstation` | Pharmacist |
| `customer-search` | `CustomerSearch` | Customer |
| `customer-prescription` | `CustomerPrescription` | Customer |
| `customer-tracking` | `CustomerTracking` | Customer |
| `customer-account` | `CustomerAccount` | Customer |
| `architecture-blueprint` | `ArchitectureBlueprint` | Internal |

### Impact
- Navigation is done via `setCurrentScreen()` passed as props.
- Customer screens support `isMobileFrame` mode for phone viewport simulation.
- Adding new screens requires updating `ActiveScreen` type in `types.ts`.

---

## D-007: Dual-Currency Support (INR + USD)

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
MediLocator targets both Indian (INR) and international (USD) markets. Prices for drugs, savings calculations, and OrangeBook entries must display in the appropriate currency.

### Decision Taken
Implement a global `Currency` toggle (`'INR' | 'USD'`) stored in `App.tsx` state, passed down via props to all screens.

### Reasoning
- Simple toggle covers the primary use case without complex localization middleware.
- Both `priceUSD` and `priceINR` are stored on every `DrugItem` and `PrescriptionMedicine`.

### Impact
- All price-displaying components accept `currency: Currency` as a prop.
- Currency toggle is in `NavigationHeader` for global access.
- No automatic conversion — both values are pre-calculated in mock/real data.

---

## D-008: D3.js for Compliance Visualizations

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
The Regulatory Compliance Console needs advanced charts (line charts, trend analysis) for compliance KPIs that standard charting libraries can't render with sufficient flexibility.

### Decision Taken
Use **D3.js v7** for custom SVG-based charts in `ComplianceD3LineChart.tsx`.

### Reasoning
- D3 gives pixel-perfect control over axes, scales, and animations.
- `RegulatoryComplianceConsole` data (`complianceData.ts`) has complex multi-series structures.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|----------------|
| Recharts | Less control over custom SVG paths and animations |
| Chart.js | Canvas-based; harder to integrate with React rendering |
| Victory | Smaller community; less flexible for custom compliance layouts |

### Impact
- D3 charts live in `ComplianceD3LineChart.tsx`.
- Data source: `src/data/complianceData.ts`.
- Avoid using D3 for simple charts — use Tailwind-based progress bars instead.

---

## D-009: Mock Data Architecture for Demo Mode

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
MediLocator is in a prototype/demo phase. Real backend APIs and databases are not yet connected. The app must be fully functional and demonstrable without a live backend.

### Decision Taken
Use static **mock data files** (`src/data/mockData.ts`, `src/data/complianceData.ts`) to simulate all backend responses.

### Reasoning
- Allows full UI/UX demonstration without infrastructure dependency.
- Mock data closely mirrors the final API contract to minimize migration effort.
- Enables offline development and testing.

### Impact
- All mock data is in `src/data/`.
- When real APIs are introduced, mock imports must be replaced with API calls.
- Mock data should always conform to interfaces in `types.ts`.

---

## D-010: Motion (Framer Motion) for Animations

| Field | Details |
|-------|---------|
| **Date** | 2026-09-08 |
| **Status** | Accepted |
| **Decided By** | Project Lead |

### Context / Problem
The UI requires smooth micro-animations (toast slide-ins, card transitions, modal entrances) to feel premium and polished.

### Decision Taken
Use the **`motion`** package (v12, formerly Framer Motion) for declarative animations.

### Reasoning
- Declarative API integrates cleanly with React component lifecycle.
- `AnimatePresence` handles mount/unmount animations (toasts, modals).
- Consistent animation language across components.

### Impact
- Import from `motion/react` (not `framer-motion`).
- Use `motion.div`, `AnimatePresence` for animated elements.
- Keep animations subtle — use `duration: 0.2-0.4s` and `ease: easeOut` as defaults.
