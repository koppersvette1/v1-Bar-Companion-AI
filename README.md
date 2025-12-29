# BarBuddy — Hybrid Intelligence Bar System

BarBuddy is a mobile-first web application designed to be your intelligent home bar assistant. It uses a **Hybrid System Design** that combines deterministic rules (for safety and technique) with adaptive learning (for personalization).

## 🚀 Key Features

### 1. Hybrid Intelligence
- **Guardrails (Rules):** Safety caps for smoker times (e.g., Mesquite ≤ 7s), bitterness reduction for smoked drinks, and pairing logic.
- **Learning:** Adaptive ranking of cocktails and woods based on user history, taste profiles, and seasonal context.

### 2. Smoker Lab (Signature Feature)
- Dedicated mode for cocktail smokers.
- **Wood Profiles:** Detailed library of woods (Apple, Hickory, Oak, etc.) with intensity ratings, tasting notes, and pairing tags.
- **Guided Timers:** Visual countdowns with specific caps per wood type to prevent acrid smoke.

### 3. Inventory & Cost Tracking
- **Scanner:** Barcode/OCR simulation to add bottles.
- **Cost Tracking (Optional):** Toggleable setting to track bottle prices and calculate cost-per-drink.
- **My Bar:** Filterable inventory of spirits, mixers, and tools.

### 4. Personalization
- **People Profiles:** Create profiles for friends/family with specific taste preferences (Sweetness, ABV comfort, Likes/Dislikes).
- **Adaptive Ranking:** The cocktail list re-orders itself based on the selected person's profile.

### 5. Pairing Lab
- Two-way pairing engine (Meal ↔ Drink).
- Explains *why* a pairing works (e.g., "Tannins cut through fat").
- Smoker integration: Suggests specific woods to bridge food and drink flavors.

## 🛠 Tech Stack (Prototype)
- **Frontend:** React + Vite + Tailwind CSS (v4)
- **State Management:** Zustand (with LocalStorage persistence to simulate full-stack)
- **Icons:** Lucide React
- **Logic:** Custom rule engine in `client/src/lib/logic/`

## 🏗 Architecture & Extension Points

### Data Model (`client/src/lib/store.ts`)
The application uses a monolithic store pattern with slices for:
- `inventory`: Items in bar.
- `woodLibrary`: Wood profiles.
- `people`: User profiles for personalization.
- `recipes`: Cocktail database.
- `settings`: Global app config.

### Logic Engine (`client/src/lib/logic/`)
- `rules.ts`: Contains the deterministic guardrails (Safety caps, Method rules).
- `learning.ts`: Scoring algorithms that take a PersonProfile and context to rank items.
- `pairing.ts`: Heuristic engine for food/drink matching.

### Extending
- **New Woods:** Add to `SEED_WOODS` in `store.ts`.
- **New Rules:** Add to `SMOKER_RULES` in `rules.ts`.
- **New Recipes:** Add to `SEED_RECIPES` in `store.ts` or implement the Import URL feature.

## 📱 Mobile First
The UI is optimized for touch targets, bottom navigation on mobile, and responsive layouts for desktop.

---
*Built with ❤️ by Replit Agent*
