# MediLocator

MediLocator is a healthcare platform prototype with a React/Vite frontend and an Express/Prisma backend backed by MongoDB Atlas.

## Repository structure

```text
MediLocator/
├── frontend/   # React, Vite, Tailwind, API client
├── backend/    # Express, Prisma, routes, services, database schema
├── .github/    # CI workflow
└── README.md
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas access for the backend

## Install dependencies

```powershell
cd frontend
npm install

cd ../backend
npm install
```

Copy the environment templates and fill in local values:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

`backend/.env` contains `DATABASE_URL`, JWT secrets, the optional Gemini key, and the server port. `frontend/.env` contains only browser-safe Vite variables.

## Start the backend

```powershell
cd backend
npm run dev
```

The API runs on `http://localhost:3001`.

## Sign in

The frontend opens on the role-aware sign-in screen. The seeded development accounts all use `Admin@123`:

- Admin: `admin@medilocator.com`
- Medical / Pharmacist: `pharmacist@medilocator.com`
- Patient / User: `customer@medilocator.com`

After login, the access token is refreshed through the backend and navigation is scoped to the selected account role.

## Start the frontend

In a second terminal:

```powershell
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000`. Vite proxies `/api` requests to the backend, while production deployments can set `VITE_API_BASE_URL` to the deployed API origin.

## Run both applications

Run the frontend and backend commands in two terminals. They are intentionally independent applications with separate dependency manifests and environment files.

## Database commands

```powershell
cd backend
npm run db:push
npm run db:seed
npm run db:studio
```

## Phase 4 operations APIs

The backend exposes provider-ready expansion endpoints under `/api/operations`:

- `GET/POST/PATCH /inventory` for stock records and low-stock alerts
- `POST /payments` and `POST /payments/:id/refund` for checkout/refund adapter flows
- `GET /logistics/:orderId` and `POST /logistics/webhook` for courier integration
- `GET/POST /shifts` for pharmacist scheduling
- `GET /reports/summary` for operational reporting

Payment and courier adapters stop at the provider boundary until Razorpay, Stripe, Delhivery/Shiprocket credentials and webhook secrets are supplied. The current adapter state is process-local for development; persistent production storage should be wired to Prisma before launch.

## Verification

```powershell
cd frontend
npm run lint
npm run build

cd ../backend
npm run build
npm test
```
