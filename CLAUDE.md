# CLAUDE.md - Bar Companion AI Development Guide

> **Last Updated:** 2026-01-05
> **Purpose:** Comprehensive codebase documentation for AI assistants working on the Bar Companion AI project

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Directory Structure](#directory-structure)
4. [Tech Stack](#tech-stack)
5. [Development Workflows](#development-workflows)
6. [Database & Schema](#database--schema)
7. [API Patterns & Conventions](#api-patterns--conventions)
8. [Authentication & Authorization](#authentication--authorization)
9. [State Management](#state-management)
10. [Frontend Patterns](#frontend-patterns)
11. [Code Conventions](#code-conventions)
12. [Key Files Reference](#key-files-reference)
13. [Common Development Tasks](#common-development-tasks)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Bar Companion AI** is a full-stack web application for intelligent home bar management with a focus on cocktail smoking techniques, personalized recommendations, and adaptive learning.

### Core Features

1. **Cocktail Database** - 1000+ built-in recipes with adaptive ranking
2. **Smoker Lab** - Guided smoking technique with 16+ wood profiles
3. **Inventory Management** - Bar stock tracking with barcode scanning
4. **Personalization** - Guest taste profiles with adaptive recommendations
5. **Pairing Engine** - Food-to-drink suggestions with reasoning
6. **Flights** - Side-by-side cocktail tasting planning
7. **Cost Tracking** - Optional per-drink cost calculation
8. **Guest Mode** - Try before you buy with data migration after login

### Design Philosophy

- **Mobile-First**: Touch-optimized with bottom navigation
- **Hybrid Intelligence**: Deterministic rules + adaptive learning
- **User Isolation**: All user data strictly partitioned by userId
- **Guest-Friendly**: Full feature access without authentication

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React 19)                       │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │   Pages    │  Components  │   Hooks     │     Lib      │ │
│  │  (Routes)  │  (shadcn/ui) │  (useAuth)  │   (Logic)    │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
│         │                    │                     │         │
│    Wouter Router      React Query API      Zustand Store    │
└─────────────────────────────────────────────────────────────┘
                               │
                        HTTP/JSON API
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Server (Express.js)                       │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │   Routes   │   Storage    │    Auth     │  Generation  │ │
│  │ (REST API) │  (DB Layer)  │  (Passport) │    (Logic)   │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                        Drizzle ORM
                               │
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│     14 tables (users, inventory, recipes, people, etc.)      │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

#### 1. **Monorepo Structure**
- Single repository with `/client`, `/server`, `/shared` directories
- Shared TypeScript types between frontend and backend
- Single `package.json` with unified dependencies

#### 2. **Hybrid Determinism + Learning**
- **Deterministic Rules** (`/client/src/lib/logic/rules.ts`): Safety guardrails, smoke time limits, ingredient validation
- **Adaptive Learning** (`/client/src/lib/logic/learning.ts`): Taste weight vectors, wood affinity scoring, contextual ranking

#### 3. **User Isolation Pattern**
Every user-owned table includes:
```typescript
userId: varchar("user_id").notNull()
// Indexed: index("table_user_idx").on(table.userId)
```
All queries filter: `eq(table.userId, userId)`

#### 4. **Guest Mode → Authenticated Sync**
- Guest data stored in Zustand (localStorage)
- After login: `POST /api/migrate-guest-data` bulk transfers data
- Error handling per item with migration report

#### 5. **Validation at Boundaries**
- **Request**: Zod schemas validate incoming data
- **Type**: Drizzle generates TypeScript types
- **Database**: PostgreSQL constraints enforce integrity

---

## Directory Structure

```
/home/user/v1-Bar-Companion-AI/
├── client/                          # React frontend application
│   └── src/
│       ├── pages/                   # Route page components
│       │   ├── home.tsx             # Landing page
│       │   ├── inventory.tsx        # Bar inventory management
│       │   ├── cocktails.tsx        # Recipe browser
│       │   ├── smoker.tsx           # Smoker lab & guidance
│       │   ├── people.tsx           # Guest taste profiles
│       │   ├── favorites.tsx        # Saved recipes
│       │   ├── flights.tsx          # Cocktail flight planning
│       │   ├── pair.tsx             # Food pairing engine
│       │   ├── education.tsx        # Learning resources
│       │   ├── generate.tsx         # AI drink generation
│       │   ├── settings.tsx         # User preferences
│       │   └── diagnostics.tsx      # Debug tools
│       │
│       ├── components/              # Reusable UI components
│       │   ├── ui/                  # shadcn/ui component library
│       │   ├── layout/              # Layout components (nav, etc.)
│       │   └── [feature]/           # Feature-specific components
│       │
│       ├── hooks/                   # Custom React hooks
│       │   ├── use-auth.ts          # Authentication hook
│       │   ├── use-migrate.ts       # Guest data migration
│       │   └── use-toast.ts         # Toast notifications
│       │
│       ├── lib/                     # Utilities & state
│       │   ├── logic/               # Business logic
│       │   │   ├── rules.ts         # Deterministic rules
│       │   │   ├── learning.ts      # Adaptive ranking
│       │   │   └── pairing.ts       # Food pairing logic
│       │   ├── store.ts             # Zustand global store
│       │   ├── api.ts               # React Query hooks
│       │   ├── guest-store.ts       # Guest mode persistence
│       │   ├── scanner.ts           # Barcode/OCR functionality
│       │   └── utils.ts             # Utility functions
│       │
│       ├── index.css                # Tailwind CSS global styles
│       └── App.tsx                  # App root with routing
│
├── server/                          # Express.js backend
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API endpoint definitions
│   ├── storage.ts                   # Database interface/implementation
│   ├── generation.ts                # Drink generation logic
│   ├── db.ts                        # Drizzle ORM connection
│   ├── vite.ts                      # Vite dev server integration
│   └── replit_integrations/
│       └── auth/                    # Replit OIDC authentication
│           ├── replitAuth.ts        # OIDC setup & middleware
│           └── routes.ts            # Auth endpoints
│
├── shared/                          # Shared code (client/server)
│   ├── schema.ts                    # Drizzle ORM table definitions
│   ├── models/auth.ts               # Auth-related database models
│   └── generation-types.ts          # Shared type definitions
│
├── script/                          # Build scripts
│   └── build.ts                     # Custom esbuild configuration
│
├── attached_assets/                 # Generated images/assets
│
├── Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── vite.config.ts               # Vite bundler configuration
│   ├── drizzle.config.ts            # Database migration config
│   ├── tsconfig.json                # TypeScript configuration
│   ├── components.json              # shadcn/ui configuration
│   ├── postcss.config.js            # PostCSS/Tailwind setup
│   ├── .replit                      # Replit deployment config
│   └── .gitignore                   # Git ignore rules
```

---

## Tech Stack

### Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.2.0 | UI library |
| **Build Tool** | Vite | 7.1.9 | Fast bundler |
| **Language** | TypeScript | 5.6.3 | Type safety |
| **Styling** | TailwindCSS | 4.1.14 | Utility-first CSS |
| **UI Components** | Radix UI + shadcn/ui | Latest | Accessible primitives |
| **Routing** | Wouter | 3.3.5 | Lightweight router |
| **State** | Zustand | 5.0.9 | Global state |
| **Data Fetching** | TanStack React Query | 5.60.5 | Server state |
| **Forms** | React Hook Form | 7.66.0 | Form handling |
| **Validation** | Zod | 3.25.76 | Schema validation |
| **Icons** | Lucide React | 0.545.0 | Icon library |
| **Animation** | Framer Motion | 12.23.26 | Animations |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |

### Backend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | Express.js | 4.21.2 | Web server |
| **Database** | PostgreSQL | 16 | Relational database |
| **ORM** | Drizzle ORM | 0.39.3 | Type-safe queries |
| **Database Driver** | node-postgres (pg) | 8.16.3 | PostgreSQL client |
| **Authentication** | Passport.js | 0.7.0 | Auth middleware |
| **OIDC** | openid-client | 6.8.1 | Replit OAuth |
| **Sessions** | express-session | 1.18.2 | Session management |
| **Session Store** | connect-pg-simple | 10.0.0 | PostgreSQL sessions |
| **Validation** | Zod | 3.25.76 | Schema validation |
| **WebSocket** | ws | 8.18.0 | Real-time comms |

### Build & Development

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Server Bundler** | esbuild | 0.25.0 | Fast server builds |
| **Dev Server** | tsx | 4.20.5 | TypeScript execution |
| **Platform** | Replit | Latest | Cloud deployment |

---

## Development Workflows

### Local Development

```bash
# Install dependencies
npm install

# Start development server (client + server)
npm run dev
# → Client: http://localhost:5000
# → API: http://localhost:5000/api/*
# → Auto-reload enabled

# Type checking (no emit)
npm run check

# Database schema push (apply changes)
npm run db:push
```

### Build Process

```bash
# Production build (two-stage)
npm run build

# Stage 1: Vite builds client → dist/public/
# Stage 2: esbuild bundles server → dist/index.cjs
```

**Build Configuration** (`/script/build.ts`):
- **Client**: Vite with code splitting, minification
- **Server**: esbuild bundles to single CommonJS file
- **Bundled deps**: Core libraries (express, drizzle, zod)
- **External deps**: Heavy dependencies stay external

### Production

```bash
# Start production server
npm start
# → NODE_ENV=production node dist/index.cjs
# → Port 5000 (from $PORT env var)
```

### Testing

**Current Status:** No test framework configured

**Recommended Setup:**
- Unit tests: Vitest (Vite-native)
- Integration: Supertest for API routes
- Component: React Testing Library
- E2E: Playwright

---

## Database & Schema

### Database Setup

- **Type:** PostgreSQL 16
- **Connection:** Via `DATABASE_URL` environment variable
- **ORM:** Drizzle ORM (type-safe, zero-runtime overhead)
- **Schema Location:** `/shared/schema.ts`
- **Migration Tool:** Drizzle Kit

### Schema Characteristics

```typescript
// All tables follow this pattern:
{
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),  // User isolation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // ... table-specific fields
}
```

### Core Tables (14 total)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User authentication | `id`, `email`, `firstName`, `lastName` |
| **people** | Taste profiles | `name`, `sweetnessPref`, `abvComfort`, `tasteWeights` |
| **inventory** | Bar stock | `name`, `category`, `quantity`, `abv`, `price` |
| **recipes** | Cocktails | `name`, `ingredients[]`, `steps[]`, `tags[]` |
| **favorites** | Saved recipes | `recipeId`, `notes`, `preferences` |
| **collections** | Recipe groups | `name`, `description`, `recipeIds[]` |
| **woods** | Smoking materials | `name`, `intensity`, `timeMin/Max`, `flavorTags[]` |
| **garnishes** | Garnish catalog | `name`, `category`, `smokeFriendly` |
| **history** | Made drinks | `recipeId`, `rating`, `tuning`, `smoked` |
| **variations** | Recipe tuning | `originalRecipeId`, `beforeState`, `afterState` |
| **flights** | Tasting sets | `name`, `recipeIds[]`, `votingEnabled` |
| **flightResults** | Flight votes | `flightId`, `recipeId`, `votes` |
| **pairings** | Food-drink | `drinkType`, `foodType`, `reasoning` |
| **userSettings** | Preferences | `smokerType`, `enableCostTracking`, `debugMode` |

### Database Indexes

All user-owned tables indexed on `userId`:
```typescript
index("table_user_idx").on(table.userId)
```

### Zod Integration

```typescript
import { createInsertSchema } from 'drizzle-zod';

// Auto-generate Zod schemas from Drizzle tables
export const insertPersonSchema = createInsertSchema(people)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type inference
type InsertPerson = z.infer<typeof insertPersonSchema>;
```

### Migration Workflow

```bash
# 1. Edit /shared/schema.ts
# 2. Push schema to database
npm run db:push

# For production: generate migrations
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

---

## API Patterns & Conventions

### REST API Structure

**Base URL:** `/api/*`

**Method Conventions:**
- `GET /api/resource` - List all
- `POST /api/resource` - Create new
- `PATCH /api/resource/:id` - Update
- `DELETE /api/resource/:id` - Remove

### Request/Response Patterns

#### Authentication Extraction

```typescript
function getUserId(req: Request): string {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) throw new Error("User not authenticated");
  return userId;
}
```

#### Validation

```typescript
// Validate request body with Zod
const data = insertPersonSchema.parse({ ...req.body, userId });
```

#### Error Responses

```typescript
// Validation errors
res.status(400).json({ error: error.errors });

// Not found
res.status(404).json({ error: "Resource not found" });

// Server errors
res.status(500).json({ error: "Operation failed" });
```

#### Success Responses

```typescript
// Direct object/array
res.json(result);

// Wrapped success
res.json({ success: true, data: result });
```

### API Endpoint Reference

#### Public Routes (No Auth)

```typescript
GET  /api/health                    // Health check
GET  /api/public/recipes            // Built-in recipes
GET  /api/public/woods              // Wood profiles
GET  /api/public/garnishes          // Garnish library
POST /api/generation/batch          // Drink generation
```

#### Protected Routes (Auth Required)

```typescript
// People Management
GET    /api/people                  // List profiles
POST   /api/people                  // Create profile
PATCH  /api/people/:id              // Update profile
DELETE /api/people/:id              // Delete profile

// Inventory
GET    /api/inventory               // List items
POST   /api/inventory               // Add item
PATCH  /api/inventory/:id           // Update item
DELETE /api/inventory/:id           // Remove item

// Recipes & Favorites
GET    /api/recipes                 // All recipes
POST   /api/recipes                 // Create recipe
GET    /api/favorites               // Favorited recipes
POST   /api/favorites               // Add favorite

// Flights
GET    /api/flights                 // List flights
POST   /api/flights                 // Create flight
GET    /api/flights/:id/results     // Flight results

// History & Analytics
GET    /api/history                 // Drink history
POST   /api/history                 // Log drink

// Guest Migration
POST   /api/migrate-guest-data      // Bulk transfer
```

#### Authentication Routes

```typescript
GET /api/auth/session               // Current session
GET /api/auth/user                  // User details
GET /api/login                      // Initiate OAuth
GET /api/callback                   // OAuth callback
GET /api/logout                     // Clear session
```

### Middleware

#### Authentication Middleware

```typescript
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}
```

#### Logging Middleware

Automatic request logging:
```
HH:MM:SS [express] METHOD /api/path STATUS in XXms :: {response}
```

#### Request Size Limits

- JSON body: 10MB
- URL-encoded: 10MB
- Raw body captured for logging

---

## Authentication & Authorization

### Authentication Strategy: Replit OIDC

**Flow:**
1. User → `/api/login` → Replit OAuth
2. User authenticates with Replit
3. Callback → `/api/callback` with tokens
4. Session created in PostgreSQL
5. Session cookie returned to client

### Session Management

**Configuration:**
- **Library:** `express-session` + `connect-pg-simple`
- **Storage:** PostgreSQL `sessions` table
- **TTL:** 7 days
- **Cookie:** HttpOnly, Secure, SameSite

```typescript
session({
  secret: process.env.SESSION_SECRET,
  store: pgStore,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
})
```

### User Session Object

```typescript
req.user = {
  claims: {
    sub: "user-id",                 // Unique user ID
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    profile_image_url: "url",
    exp: 1234567890
  },
  access_token: "...",
  refresh_token: "...",
  expires_at: 1234567890
}
```

### Authorization

**User Isolation:**
- All queries filter by `userId`
- No cross-user data access
- No role-based access control (RBAC)

**Frontend Session Validation:**
```typescript
// useAuth hook checks session every 5 minutes
fetchSession() → /api/auth/session → localStorage cache
```

### Logout Flow

```typescript
GET /api/logout
→ req.session.destroy()
→ Redirect to external page
```

---

## State Management

### Zustand Global Store

**Location:** `/client/src/lib/store.ts`

**Persistence:** localStorage via `zustand/middleware/persist`

### Store Structure

```typescript
interface AppState {
  // Data
  inventory: InventoryItem[];
  woodLibrary: Wood[];
  garnishLibrary: Garnish[];
  people: PersonProfile[];
  recipes: Recipe[];
  favorites: string[];
  history: HistoryEntry[];
  settings: UserSettings;

  // Actions (mutations)
  addInventoryItem: (item) => void;
  updateInventoryItem: (id, updates) => void;
  removeInventoryItem: (id) => void;
  // ... more actions
}
```

### Usage Patterns

```typescript
// Read state
const inventory = useStore((state) => state.inventory);

// Call actions
const addItem = useStore((state) => state.addInventoryItem);
addItem({ name: "Gin", category: "spirit", quantity: 1 });

// Computed selectors
const availableWoods = useStore((state) =>
  state.woodLibrary.filter(w => w.isInMyKit)
);
```

### Guest Store

**Location:** `/client/src/lib/guest-store.ts`

Separate Zustand store for unauthenticated users:
- Persists to localStorage
- Contains favorites, flights, history
- Migrated to database after login via `/api/migrate-guest-data`

### React Query (Server State)

**Location:** `/client/src/lib/api.ts`

```typescript
// Query pattern
export const usePeople = () => {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await fetch('/api/people');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });
};

// Mutation pattern
export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (person) => {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
};
```

---

## Frontend Patterns

### Routing (Wouter)

**Location:** `/client/src/App.tsx`

```typescript
import { Route, Switch } from 'wouter';

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/cocktails" component={Cocktails} />
      <Route path="/smoker" component={Smoker} />
      {/* ... more routes */}
      <Route component={NotFound} />
    </Switch>
  );
}
```

### Component Structure (shadcn/ui)

**Location:** `/client/src/components/ui/*`

**Installation Pattern:**
```bash
# shadcn/ui components are added via CLI
npx shadcn-ui@latest add [component-name]
```

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Inventory</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Add Item</Button>
  </CardContent>
</Card>
```

### Path Aliases

**tsconfig.json:**
```json
{
  "paths": {
    "@/*": ["./client/src/*"],
    "@shared/*": ["./shared/*"]
  }
}
```

**Usage:**
```typescript
import { useAuth } from '@/hooks/use-auth';
import { insertPersonSchema } from '@shared/schema';
```

### Custom Hooks Pattern

**Location:** `/client/src/hooks/*`

```typescript
// Example: use-auth.ts
export function useAuth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetchSession().then(setSession);
  }, []);

  return { session, isAuthenticated: !!session };
}
```

### Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0)
});

function InventoryForm() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <input type="number" {...register('quantity')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Code Conventions

### TypeScript

- **Strict mode:** Enabled
- **File naming:** `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Component naming:** `PascalCase`
- **Variable naming:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`

### React Patterns

```typescript
// Prefer functional components
function ComponentName({ prop1, prop2 }: Props) {
  return <div>{prop1}</div>;
}

// Use hooks for state
const [state, setState] = useState(initialValue);

// Use useEffect for side effects
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### API Route Patterns

```typescript
// Pattern: Validate → Extract userId → Query → Respond
app.post('/api/resource', isAuthenticated, async (req, res) => {
  try {
    // 1. Extract userId
    const userId = getUserId(req);

    // 2. Validate request
    const data = insertSchema.parse({ ...req.body, userId });

    // 3. Database operation
    const result = await storage.createResource(data);

    // 4. Respond
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Database Query Patterns

```typescript
// Always filter by userId
const items = await db
  .select()
  .from(inventory)
  .where(eq(inventory.userId, userId));

// Use transactions for multi-step operations
await db.transaction(async (tx) => {
  await tx.insert(table1).values(data1);
  await tx.insert(table2).values(data2);
});
```

### Error Handling

```typescript
// Client-side
try {
  const res = await fetch('/api/resource');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
} catch (error) {
  toast.error('Operation failed');
  console.error(error);
}

// Server-side
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Operation failed' });
}
```

### Import Order

1. External dependencies
2. Internal absolute imports (`@/...`)
3. Relative imports
4. Type imports

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { insertPersonSchema } from '@shared/schema';

import { LocalComponent } from './local-component';

import type { Person } from '@shared/schema';
```

---

## Key Files Reference

### Critical Files

| File Path | Purpose | When to Edit |
|-----------|---------|--------------|
| `/shared/schema.ts` | Database table definitions | Adding/modifying tables |
| `/server/routes.ts` | All API endpoints | Adding/modifying endpoints |
| `/server/storage.ts` | Database interface | Adding database operations |
| `/client/src/App.tsx` | Frontend routing | Adding routes |
| `/client/src/lib/store.ts` | Global state | Adding state/actions |
| `/client/src/lib/api.ts` | React Query hooks | Adding API calls |
| `/server/index.ts` | Server entry point | Server configuration |
| `/vite.config.ts` | Build configuration | Build settings |
| `/script/build.ts` | Production build | Build process changes |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite bundler settings |
| `drizzle.config.ts` | Database migration config |
| `components.json` | shadcn/ui configuration |
| `postcss.config.js` | CSS processing |
| `.replit` | Replit deployment |

### Page Components

| Path | Route | Purpose |
|------|-------|---------|
| `/client/src/pages/home.tsx` | `/` | Landing page |
| `/client/src/pages/inventory.tsx` | `/inventory` | Bar stock |
| `/client/src/pages/cocktails.tsx` | `/cocktails` | Recipe browser |
| `/client/src/pages/smoker.tsx` | `/smoker` | Smoker lab |
| `/client/src/pages/people.tsx` | `/people` | Taste profiles |
| `/client/src/pages/favorites.tsx` | `/favorites` | Saved recipes |
| `/client/src/pages/flights.tsx` | `/flights` | Tasting sets |
| `/client/src/pages/pair.tsx` | `/pair` | Food pairing |
| `/client/src/pages/generate.tsx` | `/generate` | AI generation |
| `/client/src/pages/settings.tsx` | `/settings` | Preferences |

---

## Common Development Tasks

### Adding a New Database Table

1. **Define schema** in `/shared/schema.ts`:
```typescript
export const newTable = pgTable('new_table', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull(),
  name: varchar('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('new_table_user_idx').on(table.userId),
}));
```

2. **Create Zod schemas**:
```typescript
export const insertNewTableSchema = createInsertSchema(newTable)
  .omit({ id: true, createdAt: true, updatedAt: true });
```

3. **Push schema**:
```bash
npm run db:push
```

4. **Add storage methods** in `/server/storage.ts`:
```typescript
async getNewTableItems(userId: string) {
  return db.select().from(newTable).where(eq(newTable.userId, userId));
}

async createNewTableItem(data: InsertNewTable) {
  const [item] = await db.insert(newTable).values(data).returning();
  return item;
}
```

5. **Add API routes** in `/server/routes.ts`:
```typescript
app.get('/api/new-table', isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  const items = await storage.getNewTableItems(userId);
  res.json(items);
});
```

### Adding a New API Endpoint

1. **Define route** in `/server/routes.ts`:
```typescript
app.post('/api/resource', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = insertSchema.parse({ ...req.body, userId });
    const result = await storage.createResource(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

2. **Add React Query hook** in `/client/src/lib/api.ts`:
```typescript
export const useCreateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    }
  });
};
```

3. **Use in component**:
```typescript
const createResource = useCreateResource();

const handleSubmit = (data) => {
  createResource.mutate(data, {
    onSuccess: () => toast.success('Created!'),
    onError: () => toast.error('Failed!')
  });
};
```

### Adding a New Page/Route

1. **Create page component** in `/client/src/pages/new-page.tsx`:
```typescript
export default function NewPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">New Page</h1>
    </div>
  );
}
```

2. **Add route** in `/client/src/App.tsx`:
```typescript
import NewPage from '@/pages/new-page';

<Route path="/new-page" component={NewPage} />
```

3. **Add navigation link** (if needed):
```typescript
<Link href="/new-page">New Page</Link>
```

### Adding Zustand State

1. **Extend AppState interface** in `/client/src/lib/store.ts`:
```typescript
export interface AppState {
  // ... existing state
  newData: NewData[];

  // ... existing actions
  addNewData: (item: NewData) => void;
  updateNewData: (id: string, updates: Partial<NewData>) => void;
}
```

2. **Implement actions**:
```typescript
export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ... existing state
      newData: [],

      // ... existing actions
      addNewData: (item) => set((state) => ({
        newData: [...state.newData, { ...item, id: uuidv4() }]
      })),

      updateNewData: (id, updates) => set((state) => ({
        newData: state.newData.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),
    }),
    { name: 'barbuddy-hybrid-store' }
  )
);
```

### Adding a shadcn/ui Component

```bash
# Add component
npx shadcn-ui@latest add [component-name]

# Example: Add dialog
npx shadcn-ui@latest add dialog
```

Component added to `/client/src/components/ui/[component-name].tsx`

---

## Deployment

### Replit Platform

**Configuration:** `.replit` file

```ini
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["node", "./dist/index.cjs"]
```

### Environment Variables (Replit Secrets)

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` - Secure random string for session signing
- `ISSUER_URL` - Replit OIDC issuer URL
- `REPL_ID` - Replit project ID (auto-set)
- `REPLIT_DOMAINS` - Comma-separated domain list (auto-set)

**Optional:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - "production" or "development"

### Deployment Process

1. **Build:** `npm run build` creates production bundles
2. **Start:** Server runs via `node dist/index.cjs`
3. **Scaling:** Replit autoscale handles traffic
4. **Database:** PostgreSQL auto-provisioned and backed up

### Port Configuration

- **Internal Port 5000** → External Port 80 (HTTP)
- **Internal Port 5001** → External Port 3000 (Dev preview)

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Symptom:** `Error: Connection refused`

**Solutions:**
1. Check `DATABASE_URL` environment variable
2. Verify PostgreSQL is running (Replit auto-starts)
3. Check database credentials

#### Authentication Failures

**Symptom:** `401 Unauthorized` on protected routes

**Solutions:**
1. Check session cookie is sent
2. Verify `SESSION_SECRET` is set
3. Check Passport configuration
4. Verify user is logged in via `/api/auth/session`

#### Build Failures

**Symptom:** `npm run build` fails

**Solutions:**
1. Clear `dist/` directory
2. Run `npm run check` for TypeScript errors
3. Check for missing dependencies
4. Verify all imports are valid

#### Type Errors

**Symptom:** TypeScript compilation errors

**Solutions:**
1. Run `npm run check`
2. Ensure path aliases are configured
3. Check shared types are imported correctly
4. Verify Drizzle types are generated

#### Migration Issues

**Symptom:** Database schema out of sync

**Solutions:**
1. Run `npm run db:push` to sync schema
2. Check `/shared/schema.ts` for errors
3. Verify Drizzle config points to correct schema file
4. Check database permissions

### Debug Mode

Enable debug mode in settings:
```typescript
updateSettings({ debugMode: true })
```

**Diagnostics Page:** `/diagnostics`
- Database connectivity check
- API health status
- Configuration verification

### Logs

**Server logs:**
```bash
# Development
npm run dev
# → Console shows all requests and errors

# Production (Replit)
# → Check Replit "Console" tab for logs
```

**Client logs:**
- Browser DevTools Console
- React Query DevTools (if enabled)
- Zustand DevTools (if enabled)

---

## Additional Resources

### Key Concepts

- **Drizzle ORM Docs:** https://orm.drizzle.team/
- **TanStack Query:** https://tanstack.com/query/latest
- **Zustand:** https://zustand-demo.pmnd.rs/
- **shadcn/ui:** https://ui.shadcn.com/
- **Wouter:** https://github.com/molefrog/wouter
- **Replit Docs:** https://docs.replit.com/

### Code Quality

- Always run `npm run check` before committing
- Follow TypeScript strict mode conventions
- Use Zod for all validation boundaries
- Maintain user isolation in all queries
- Document complex business logic

### Performance Best Practices

- Use React Query for server state (automatic caching)
- Use Zustand for client state (persistent when needed)
- Lazy load routes/components when appropriate
- Optimize database queries with proper indexes
- Keep bundle size minimal (external deps when possible)

---

**End of CLAUDE.md**

*This document is maintained by AI assistants working on the Bar Companion AI project. Last updated: 2026-01-05*
