# BarBuddy - Hybrid Intelligence Bar System

## Overview

BarBuddy is a mobile-first web application designed as an intelligent home bar assistant. It uses a **Hybrid System Design** that combines deterministic rules (for safety and technique) with adaptive learning (for personalization and recommendations).

**Core Purpose:** Help users manage their home bar inventory, discover cocktails they can make, master smoked cocktail techniques with guided timers, and find food-drink pairings.

**Key Features:**
- Smoker Lab with wood profiles, safety caps, and guided timers
- Inventory management with barcode/OCR scanning
- Personalized cocktail recommendations based on user profiles
- Two-way food-drink pairing engine
- Optional cost tracking per drink

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with Vite bundler
- **Styling:** Tailwind CSS v4 with custom speakeasy/art-deco theme
- **UI Components:** Radix UI primitives with shadcn/ui component library
- **Routing:** Wouter (lightweight React router)
- **State Management:** Zustand with LocalStorage persistence for client-side state
- **Server State:** TanStack React Query for API data fetching and caching

### Backend Architecture
- **Runtime:** Node.js with Express
- **API Pattern:** RESTful endpoints under `/api/*`
- **Database ORM:** Drizzle ORM with PostgreSQL
- **Schema Location:** `shared/schema.ts` (shared between client and server)

### Hybrid Intelligence Design
The app separates logic into two categories:

1. **Rules (Guardrails)** - Located in `client/src/lib/logic/rules.ts`
   - Safety caps for smoke times (e.g., Hickory ≤ 8s, Mesquite ≤ 7s)
   - Bitters reduction rules for smoked drinks (30-50%)
   - Method restrictions (garnish-only woods)
   - These rules are never violated by the learning system

2. **Learning (Adaptive)** - Located in `client/src/lib/logic/learning.ts`
   - Ranks cocktails based on user profiles and preferences
   - Adjusts default wood selections based on history
   - Personalizes recommendations within guardrail constraints

### Data Model
Key entities defined in `shared/schema.ts`:
- **People:** User taste profiles (sweetness, ABV comfort, liked/disliked tags)
- **Inventory:** Bar items with optional pricing
- **Recipes:** Cocktail database with smoking metadata
- **Wood Kit:** Wood profiles with intensity, timing, and pairing data
- **History/Favorites:** User activity tracking

### Directory Structure
```
client/src/
├── components/     # React components including shadcn/ui
├── pages/          # Route pages (Home, Inventory, Cocktails, Smoker, etc.)
├── lib/
│   ├── store.ts    # Zustand store with all domain types
│   ├── logic/      # Rules engine and learning algorithms
│   ├── api.ts      # React Query hooks for API calls
│   └── scanner.ts  # Barcode/OCR scanning logic
server/
├── routes.ts       # Express API endpoints
├── storage.ts      # Database operations interface
└── db.ts           # Drizzle database connection
shared/
└── schema.ts       # Drizzle schema (source of truth for types)
```

## External Dependencies

### Database
- **PostgreSQL** via Drizzle ORM
- Connection configured through `DATABASE_URL` environment variable
- Schema migrations managed with `drizzle-kit`

### UI Libraries
- **Radix UI:** Headless accessible components (dialogs, dropdowns, tabs, etc.)
- **Lucide React:** Icon library
- **Embla Carousel:** Carousel component
- **Tesseract.js:** Client-side OCR for bottle label scanning

### Build Tools
- **Vite:** Frontend bundler with HMR
- **esbuild:** Server bundling for production
- **TypeScript:** Full type safety across client/server/shared

### Fonts (Google Fonts)
- Cinzel (art-deco headings)
- Cormorant Garamond (serif body)
- Inter (sans-serif fallback)