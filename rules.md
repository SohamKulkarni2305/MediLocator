# 📏 MediLocator — Project Rules

> This file is **persistent AI context**. These rules are non-negotiable. AI coding assistants **must** follow every rule in this file on every task, without exception, unless the user explicitly overrides a specific rule in that session.

---

## Table of Contents

1. [Coding Standards](#1-coding-standards)
2. [Folder Structure Rules](#2-folder-structure-rules)
3. [Naming Conventions](#3-naming-conventions)
4. [UI/UX Consistency Rules](#4-uiux-consistency-rules)
5. [Git Commit Rules](#5-git-commit-rules)
6. [Security and Environment Variable Rules](#6-security-and-environment-variable-rules)
7. [Functional Integrity Rules](#7-functional-integrity-rules)

---

## 1. Coding Standards

### TypeScript
- **Always use TypeScript** — no `.js` or `.jsx` files in `src/`.
- **Strict mode is enabled** — never disable `strict` in `tsconfig.json`.
- All new data shapes **must be declared as interfaces or types** in `src/types.ts` before use.
- Use `interface` for object shapes; use `type` for unions, intersections, and primitives.
- **Never use `any`** — use `unknown` and narrow it, or define a proper type.
- Always type function return values explicitly for exported functions.

```typescript
// GOOD
export function formatCurrency(amount: number, currency: Currency): string { ... }

// BAD
export function formatCurrency(amount, currency) { ... }
```

### React Components
- All components must be **named exports** (not default exports), except `App.tsx`.
- Use **functional components with hooks** — no class components.
- Props must always have an **explicit interface** defined above the component.
- Use `React.FC` sparingly — prefer explicit prop interface + return type.
- Keep components **focused and single-responsibility** — if a component exceeds ~400 lines, consider splitting it.

```typescript
// GOOD
interface MyComponentProps {
  label: string;
  onClick: () => void;
}

export function MyComponent({ label, onClick }: MyComponentProps) { ... }
```

### Hooks
- Custom hooks must be prefixed with `use` (e.g., `usePrescription`, `useCurrency`).
- Never call hooks conditionally.
- Memoize expensive computations with `useMemo`; memoize callbacks with `useCallback` when passed to child components.

### Imports
- Use **absolute imports** via the `@/` alias (maps to project root).
- Group imports in this order, separated by a blank line:
  1. React and React ecosystem
  2. Third-party libraries
  3. Internal components
  4. Internal context / hooks
  5. Internal types
  6. Internal utils / data

```typescript
import React, { useState, useCallback } from 'react';

import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';

import { DrugCard } from './DrugCard';

import { usePrescription } from '../context/PrescriptionContext';

import type { DrugItem, Currency } from '../types';

import { mockDrugs } from '../data/mockData';
```

### Error Handling
- All async operations must be wrapped in `try/catch`.
- Display user-friendly error states in the UI — never leave a blank screen on error.
- Log errors to the console with sufficient context: `console.error('[ComponentName] Operation failed:', error)`.

---

## 2. Folder Structure Rules

```
MediLocator/
├── frontend/
│   ├── src/
│   ├── components/       # All UI components (one file per component)
│   ├── context/          # React context providers and hooks
│   ├── data/             # Static mock data and seed files
│   ├── utils/            # Pure utility functions (no React)
│   ├── types.ts          # ALL TypeScript interfaces and types (single source of truth)
│   ├── App.tsx           # Root component and screen router
│   ├── main.tsx          # React DOM entry point
│   └── index.css         # Global styles and Tailwind directives
│   └── public/            # Static assets (favicons, images)
├── backend/
│   ├── src/               # Express routes, services, middleware
│   └── prisma/            # Database schema and seed
├── decisions.md          # AI context: Technical decisions log
├── rules.md              # AI context: Project rules (this file)
├── memory.md             # AI context: Long-term project memory
├── changelog.md          # AI context: Chronological change history
├── frontend/.env         # Browser-safe local variables (NEVER commit)
├── backend/.env          # Server secrets (NEVER commit)
├── .gitignore            # Must include .env
├── frontend/vite.config.ts
├── frontend/tsconfig.json
├── frontend/package.json
└── backend/package.json
```

### Rules
- **Do NOT** create new top-level directories without documenting the decision in `decisions.md`.
- **Do NOT** put utility functions in component files — move them to `src/utils/`.
- **Do NOT** put types inline in component files — add them to `src/types.ts`.
- Data files in `src/data/` must only export static data or data-generating functions — no React.
- The `context/` folder is reserved for React Context providers only.

---

## 3. Naming Conventions

### Files
| Type | Convention | Example |
|------|-----------|---------|
| React Component | `PascalCase.tsx` | `PharmacistWorkstation.tsx` |
| Context Provider | `[Domain]Context.tsx` | `PrescriptionContext.tsx` |
| Utility file | `camelCase.ts` | `audioChime.ts` |
| Data file | `camelCase.ts` | `mockData.ts`, `complianceData.ts` |
| Type file | `camelCase.ts` | `types.ts` |
| Config file | `camelCase.config.ts` | `vite.config.ts` |
| Markdown docs | `lowercase.md` | `decisions.md`, `rules.md` |

### Variables and Functions
| Type | Convention | Example |
|------|-----------|---------|
| Variables | `camelCase` | `currentScreen`, `isLoading` |
| Constants (module-level) | `SCREAMING_SNAKE_CASE` | `MAX_REFILLS`, `API_BASE_URL` |
| React components | `PascalCase` | `CustomerSearch` |
| Custom hooks | `useCamelCase` | `usePrescription` |
| Event handlers | `handleActionNoun` | `handleSubmitForm`, `handleTabChange` |
| Boolean variables | `is/has/can/should` prefix | `isLoading`, `hasError`, `canRefill` |
| TypeScript interfaces | `PascalCase` | `DrugItem`, `PharmacistCase` |
| TypeScript type aliases | `PascalCase` | `ActiveScreen`, `Currency` |

### CSS / Tailwind
- Avoid one-off inline styles (`style={{}}`) — use Tailwind utilities.
- For complex repeated patterns, extract to a named variable:
  ```typescript
  const cardClass = 'bg-slate-800 rounded-xl p-4 border border-slate-700';
  ```

### IDs and Data Attributes
- All interactive elements that need testing must have a `data-testid` attribute.
- Format: `data-testid="[screen]-[element]-[action]"` e.g., `data-testid="customer-search-submit-btn"`.

---

## 4. UI/UX Consistency Rules

### Color Palette
The project uses a **dark-first** design. These are the approved palette tokens:

| Role | Tailwind Class | Use Case |
|------|---------------|---------|
| Background (deep) | `bg-slate-950` | Page background, mobile frame |
| Background (base) | `bg-slate-900` | Main app surface |
| Surface (elevated) | `bg-slate-800` | Cards, panels, sidebars |
| Surface (interactive) | `bg-slate-700` | Hover states, inputs |
| Border | `border-slate-700` | Card borders, dividers |
| Text (primary) | `text-white` | Headings, important labels |
| Text (secondary) | `text-slate-400` | Subtitles, metadata |
| Text (muted) | `text-slate-500` | Placeholders, disabled |
| Accent (primary) | `text-blue-400` / `bg-blue-500` | Primary actions, highlights |
| Accent (success) | `text-emerald-400` / `bg-emerald-500` | Approvals, savings |
| Accent (warning) | `text-amber-400` / `bg-amber-500` | Pending, caution states |
| Accent (danger) | `text-red-400` / `bg-red-500` | Errors, rejections |

- **Never introduce a new color** without documenting it here.
- Do not use plain `red`, `green`, `blue` — always use shaded variants (e.g., `red-400`, `emerald-500`).

### Typography
- Use system/sans-serif stack (Tailwind's `font-sans`).
- Heading hierarchy: `text-2xl font-bold` > `text-lg font-semibold` > `text-base font-medium` > `text-sm`.
- Never skip heading levels.

### Spacing
- Use Tailwind spacing scale consistently: `p-4`, `p-6`, `gap-4`, `gap-6`.
- Card internal padding: `p-4` (compact) or `p-6` (standard).
- Section gaps: `gap-4` (tight) or `gap-6` (standard).

### Icons
- **Only use `lucide-react`** for icons — do not mix icon libraries.
- Icon size: `w-4 h-4` (inline), `w-5 h-5` (standard), `w-6 h-6` (prominent).
- Icons must have an `aria-label` or be accompanied by visible text.

### Animations
- Use `motion` (Framer Motion v12) for all entrance/exit animations.
- Standard entrance: `initial={{ opacity: 0, y: 8 }}` + `animate={{ opacity: 1, y: 0 }}`.
- Duration: `0.2s` (micro) to `0.4s` (standard). Never exceed `0.6s`.
- Do not animate layout changes that shift large blocks of content unexpectedly.

### Loading States
- Always show a loading skeleton or spinner while data is fetching.
- Use `animate-pulse` for skeleton loaders.
- Never show an empty screen while loading.

### Responsiveness
- Customer-facing screens must be functional and beautiful in mobile frame mode (`max-w-[420px]`).
- Admin and Pharmacist screens are desktop-first.
- Use `overflow-hidden` on mobile containers to prevent horizontal scroll.

### Accessibility
- All interactive elements must be keyboard-navigable (`tab` key support).
- Buttons must have descriptive `aria-label` if icon-only.
- Color alone must never be the sole indicator of state — always pair with text or icon.
- Minimum touch target size: `44px x 44px` for mobile.

---

## 5. Git Commit Rules

### Commit Message Format
Use **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types
| Type | When to Use |
|------|------------|
| `feat` | New feature or screen |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `style` | UI/CSS-only changes |
| `docs` | Documentation updates (including AI context files) |
| `chore` | Dependency updates, config changes |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |

### Examples
```bash
feat(pharmacist): add SLA countdown timer to case queue
fix(prescription): correct refill count display when refillsRemaining is 0
style(admin): align pharmacy KYC table columns on mobile
docs(memory): update pending features list
chore(deps): upgrade motion to v12.23.24
```

### Rules
- **Subject line must be 72 characters or fewer**.
- Use **present tense imperative**: "add feature" not "added feature" or "adds feature".
- Reference issue numbers in the footer: `Closes #42` or `Refs #15`.
- **Never commit directly to `main`** — use feature branches and pull requests.
- Branch naming: `feat/short-description`, `fix/bug-name`, `docs/what-updated`.

---

## 6. Security and Environment Variable Rules

### Environment Variables
- **NEVER hardcode secrets** (API keys, tokens, passwords) in source code.
- All secrets must live in `.env` (local) and be injected at runtime via the platform.
- `.env` is in `.gitignore` and must **never** be committed.
- `.env.example` must be kept up to date with all required variable names (but no real values).
- Access env vars via `import.meta.env.VITE_*` (client-side) or `process.env.*` (server-side/Node).

### Required Environment Variables
| Variable | Purpose | Exposed Client-Side? |
|----------|---------|---------------------|
| `GEMINI_API_KEY` | Google Gemini AI API authentication | No (server-side only) |
| `APP_URL` | Self-referential URL for the hosted app | Yes (via Vite env) |

### API Key Security
- `GEMINI_API_KEY` must **never** be exposed in client-side bundle.
- All Gemini API calls must be proxied through a server-side handler (Express route) or serverless function.
- If a key is accidentally committed, rotate it immediately and document the incident.

### Data Handling
- Patient data (names, MRNs, prescriptions) must never be logged to the console in production.
- Mock data is for development only — strip all `console.log` statements before production builds.
- Prescription audit hashes (`auditHash`) must be treated as sensitive — do not expose in URLs.

### Input Validation
- All user inputs must be sanitized before display (prevent XSS).
- File uploads (prescription images) must validate MIME type and file size before processing.
- OTP inputs must be numeric-only and length-validated client-side before submission.

---

## 7. Functional Integrity Rules

> These rules prevent regressions.

- **Never remove or modify existing functionality unless explicitly requested by the user.**
- When refactoring a component, verify all its props and navigation callbacks still work.
- When adding a new screen, add it to `ActiveScreen` type in `types.ts` AND to `NavigationHeader`.
- When modifying `PrescriptionContext`, ensure all consumers (`CustomerPrescription`, `PharmacistWorkstation`, `PrescriptionNotificationToast`) are updated.
- When modifying `types.ts`, run `npm run lint` to catch all type errors before committing.
- **Currency prop** (`currency: Currency`) must be threaded through to every component that displays prices — never hardcode `USD` or `INR`.
- The `PrescriptionProvider` wrapper in `App.tsx` must always remain as the outermost wrapper.
- `AudioChime` must only play on genuine user-triggered events — never on initial page load.
- Mock data in `src/data/` must always satisfy the TypeScript interfaces — run `npm run lint` to verify.
