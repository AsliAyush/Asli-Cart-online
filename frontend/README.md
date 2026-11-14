# Asli Cart Frontend

Modern e-commerce and affiliate deals discovery frontend for **Asli Cart**, built with Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Axios, React Hook Form, and Zod.

---

## Architecture Overview

The frontend mirrors the role-oriented modular architecture of the Express.js backend (`backend/src/modules/`):

```
frontend/
├── public/                 # Static assets (brand logos, icons, illustrations)
│   ├── icons/
│   ├── images/
│   └── logo/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Protected Admin portal
│   │   │   └── dashboard/
│   │   ├── customer/       # Customer authentication & dashboard
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── product-manager/# Protected Product Manager portal
│   │   │   └── dashboard/
│   │   ├── social-media-manager/ # Protected Social Media Manager portal
│   │   │   └── dashboard/
│   │   ├── staff-login/    # Unified staff gateway (SUPER_ADMIN & PRODUCT_MANAGER)
│   │   ├── unauthorized/   # Friendly role mismatch guard page
│   │   ├── globals.css     # CSS custom variables & tokens
│   │   ├── layout.tsx      # Root layout with centralized AppProviders
│   │   └── page.tsx        # Responsive landing page
│   ├── components/         # Reusable UI component library
│   │   ├── layout/         # Header, Footer, responsive wrappers
│   │   ├── navigation/     # Navbar (auth-aware), Mobile Navigation drawer
│   │   ├── shared/         # Reusable shared domain blocks & AuthGuard
│   │   └── ui/             # shadcn/ui primitive library (Button, Card, Dialog, etc.)
│   ├── hooks/              # Custom React hooks (useAuth, useMounted, useMediaQuery)
│   ├── lib/                # Utilities, auth helpers, session cookies (cn, auth-helpers)
│   ├── middleware.ts       # Server-side Next.js route protection & role enforcement
│   ├── modules/            # Role-oriented business modules (mirrors backend)
│   │   ├── admin/          # Admin governance & staff login schemas
│   │   ├── customer/       # Customer registration & login schemas
│   │   ├── product_manager/# Deals curation, price verification & catalog
│   │   └── social_media_manager/ # Social campaigns, broadcast feeds & telemetry
│   ├── providers/          # Centralized providers (QueryClient, Auth, Theme, Toasts)
│   ├── services/           # Centralized API service layer
│   │   ├── api/            # Axios client, interceptors, error normalization
│   │   └── auth/           # Staff & Customer authentication service
│   ├── stores/             # Global client state via Zustand (auth-store, ui-store)
│   └── types/              # TypeScript interfaces (API envelope, Auth types)
├── vitest.config.mjs       # Vitest configuration
├── components.json         # shadcn/ui CLI configuration
├── next.config.mjs         # Next.js runtime configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS design system tokens
└── tsconfig.json           # Strict TypeScript configuration
```

---

## Environment Setup

1. Copy the example environment file into `.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

2. Confirm or adjust `NEXT_PUBLIC_API_BASE_URL`:

```env
# Backend API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# Application details
NEXT_PUBLIC_APP_NAME="Asli Cart"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security Note:** Never commit `.env`, `.env.local`, or any private credentials to Git.

---

## Installation, Testing & Startup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run unit & authentication test suite

```bash
npm run test
```

### 3. Run TypeScript typecheck

```bash
npm run typecheck
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## Authentication & Role-Based Access (Phase 2)

### Entry Points
- **Staff Gateway**: `/staff-login`
  - Authenticates `SUPER_ADMIN` and `PRODUCT_MANAGER` via `POST /api/v1/admin/auth/login`.
  - Customers attempting to log in are denied access.
  - Redirects:
    - `SUPER_ADMIN` → `/admin/dashboard`
    - `PRODUCT_MANAGER` → `/product-manager/dashboard`
    - `SOCIAL_MEDIA_MANAGER` → `/social-media-manager/dashboard` (deferred placeholder)
- **Customer Gateway**:
  - Sign in: `/customer/login` via `POST /api/v1/customer/auth/login`
  - Register: `/customer/register` via `POST /api/v1/customer/auth/register` (strictly server-enforces `CUSTOMER` role)
  - Redirects to `/customer/dashboard`

### Token Handling & Security
1. **Refresh Token**: Stored in an `HttpOnly`, `SameSite: Lax/Strict`, `Secure` cookie set directly by the Express.js backend.
2. **Access Token**: Stored in memory within the Zustand store for high security.
3. **Session Persistence**: Managed via `sessionStorage` on client mount and restored via `/me` or passive refresh.
4. **Auto Refresh**: Axios response interceptor intercepts 401s, executes refresh, retries original request, and handles concurrent requests using a queue.
