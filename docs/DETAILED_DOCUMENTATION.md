# India Tour – Smart Tourist Safety System

> **This is the deep, technical documentation for the project.**  
> The main `README.md` is a high‑level overview. This file goes module‑by‑module across the **frontend**, **backend**, and **database**, and lists **all technologies and commands** in one place.

---

## 1. High‑Level Summary

### 1.1 Purpose

India Tour – Smart Tourist Safety System is a full‑stack web application for:

- Safer trip planning across India.
- Viewing risk zones and safety information on an interactive map.
- Managing itineraries and digital safety IDs.
- Using AI and contextual data to guide tourists.

### 1.2 Major Parts

- **Frontend** – React + Vite + TypeScript SPA, deployed on Netlify.
  - **Live URL:** `https://india-tour-smart-tourist-safety.netlify.app`
- **Backend** – FastAPI application, deployed on Render.
  - **Live API base URL:** `https://india-tour-smart-tourist-safety-system.onrender.com`
  - Health check: `https://india-tour-smart-tourist-safety-system.onrender.com/health`
  - Interactive docs (Swagger UI): `https://india-tour-smart-tourist-safety-system.onrender.com/docs`
- **Database & Auth** – Supabase (PostgreSQL + Auth + Realtime + Storage).

---

## 2. Technologies Used

### 2.1 Frontend

**Language & Frameworks**

- TypeScript
- React 18
- Vite (bundler/dev server)

**Routing & State**

- `react-router-dom` 7 – routing
- React Context – notifications, itinerary, data, auth helpers

**UI / UX**

- Tailwind‑style utility classes (via `index.css` and custom theme)
- `framer-motion` – animations and transitions
- `lucide-react`, `react-icons`, `@heroicons/react` – icons
- Custom components in `src/new-ui/` (Button, Card, Navbar, Footer, HeroSection, etc.)

**Maps & Geospatial**

- `react-leaflet` + `leaflet` – map rendering and overlays
- `mapbox-gl` – Mapbox tiles (when `VITE_MAPBOX_ACCESS_TOKEN` is configured)

**Auth & Data**

- `@supabase/supabase-js` – main Supabase client
- `@supabase/auth-helpers-react`, `@supabase/auth-ui-react` – auth integration and UI
- Custom services in `src/services/` to talk to FastAPI backend

**Testing & Quality**

- `vitest` – unit testing
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` – component tests
- `eslint` + `@eslint/js` + `typescript-eslint` – linting

**Build & Tooling**

- `vite` – dev/build/preview
- `tailwindcss`, `postcss`, `autoprefixer` – styling pipeline
- Node scripts in `scripts/` for seeding and migrations

### 2.2 Backend

**Language & Frameworks**

- Python 3.11
- FastAPI
- Uvicorn (ASGI server)

**Database & ORM**

- PostgreSQL on Supabase
- `SQLAlchemy` – ORM and DB queries
- `psycopg2-binary` – PostgreSQL driver

**Config & Settings**

- `python-dotenv` – `.env` loading
- `pydantic` and `pydantic-settings` – configuration models and validation

**Auth & Security**

- Supabase JWT integration
- `python-jose[cryptography]` – JWT and crypto helpers

**Testing**

- `pytest` – backend tests (e.g. `test_safety_core.py`)

### 2.3 Database / Supabase

- Supabase project ID: `hqcgedoxnyvrwbhyxpql`.
- Local dev configuration in `India-Tour-main/supabase/`:
  - `config.toml` – ports, migrations, seed files, realtime, auth, storage.
  - `apply_migration.sql` – consolidated schema + sample data.
  - `migrations/*.sql` – incremental schema migrations.
  - `backup_schema_*.sql` – historical schema snapshots.

---

## 3. Frontend: Project Structure & Modules

**Root (frontend):** `India-Tour-main/`

- `index.html` – SPA root, mounting point for React.
- `vite.config.ts` – Vite config (plugins, aliases, env behavior).
- `tailwind.config.ts`, `postcss.config.js` – styling config.
- `tsconfig*.json` – TypeScript config for app, node, tests, seed scripts.
- `.env`, `.env.local`, `.env.example` – Vite env variables (not committed except example).

### 3.1 `src/` Overview

- `main.tsx` – main React entry, wraps app with providers (i18n, StrictMode, etc.).
- `App.tsx` – central app shell:
  - Sets up `react-router-dom` routes.
  - Wraps pages with `Navbar`, `Footer`, and animated transitions.
  - Lazy‑loads pages and shows `Loading` screen.
- `App.css`, `index.css` – global styles.
- `i18n.tsx` – internationalization (English/Hindi support) with context.
- `components/` – shared old‑UI components.
- `context/` – global contexts (e.g., notifications, data, itinerary, auth helpers).
- `features/` – domain‑oriented features (e.g., safety, profile, itineraries).
- `pages/` – original page components.
- `services/` – backend integration (`safetyApi.ts`, possibly others).
- `theme/` – theme variables/tokens.
- `types/` – shared TS types/interfaces.
- `utils/` – common helpers.
- `__tests__/` – frontend tests.
- `setupTests.ts` – Vitest + Testing Library setup.

### 3.2 `src/new-ui/` – New Experience

**Root new‑UI entry:**

- `new-ui/main.tsx` – alternate React entry targeting new UI.
- `new-ui/App.tsx` – high‑fidelity new home + layout.
- `new-ui/index.css` – design system styles.

**Core Components**

- `new-ui/Button.tsx` – primary button component (variants, sizes, loading states, icons).
- `new-ui/Card.tsx` – card layout building block.
- `new-ui/Loading.tsx` – global loading state component.
- `new-ui/ErrorBoundary.tsx` – error boundary wrapper for React tree.
- `new-ui/Navbar.tsx` – high‑end navigation:
  - Brand/logo and navigation links.
  - Language selector (English/Hindi) using i18n context.
  - Auth status display (Supabase user), profile dropdown.
  - Notifications dropdown using `NotificationContext`.
  - Emergency SOS button.
  - Theme/dark‑mode toggle.
- `new-ui/Footer.tsx` – structured footer:
  - Navigation, resources, social links.
  - Emergency contact info and disclaimers.
  - Newsletter sign‑up form.
- `new-ui/HeroSection.tsx` – landing hero:
  - Background imagery and parallax.
  - Trip search form (destination, dates, travel type, safety level).
  - Calls to action (e.g., “Explore Safely”).
- `new-ui/Chatbot.tsx` – chatbot UI:
  - Floating button toggling chat window.
  - Message list with roles (user/assistant/system).
  - Input box, send button, quick questions.
  - Voice input using Web Speech API.
  - Hooks for integrating backend `/api/chat` endpoint.

**`new-ui/components/`**

Contains additional building blocks like:

- Form inputs and dropdown components.
- Layout helpers and section containers.
- Possibly sub‑components for the hero, stats, or CTAs.

**`new-ui/features/`**

Domain‑specific UI for:

- Destinations (`features/destinations/DestinationExplorer.tsx`):
  - Lists states and cities with safety information.
  - Integrates with Supabase data via contexts.
- Safety hub (`features/safety/SafetyInformationHub.tsx`):
  - Curated safety tips, emergency numbers, guidelines.
  - May show risk summaries by state/city.
- Profile (`features/profile/UserProfile.tsx`):
  - Displays user avatar, name, email, safety ID.
  - Uses Supabase auth user data.
- Itinerary management, alerts, digital IDs (where present).

**`new-ui/pages/`**

- `HomePage.tsx` – orchestrates hero, safety overview, featured destinations, trust indicators, and final CTA sections.

**`new-ui/types/index.ts`**

- `ChatMessage` – role, content, timestamps, metadata for chatbot.
- `AICapability` – describes AI feature tiles.
- `ButtonProps`, and other UI‑oriented interfaces.

### 3.3 `src/features/safety/SafetyMapPage.tsx`

This is the **interactive safety map** page.

Key responsibilities:

- Uses React Leaflet components: `MapContainer`, `TileLayer`, `Marker`, `Circle`, `Polygon`, `Tooltip`, `useMap`.
- `RecenterOnUser` component uses `useMap()` to set view when location changes.
- Tracks user position via `navigator.geolocation.watchPosition`:
  - `position`: `lat`/`lng`.
  - `geoError`: user denied or unavailable.
- Loads risk zones via `fetchRiskZones()` from `safetyApi.ts`:
  - Expects `geom.bbox` (min/max lat/lng) per zone.
  - Builds polygon coordinates (4 corners) for each zone.
- Applies zoom‑based filtering:
  - At low zoom, only high/critical zones.
  - At closer zoom, medium zones appear.
- Chooses tile source:
  - If `VITE_MAPBOX_ACCESS_TOKEN` set → Mapbox tiles.
  - Else → default OpenStreetMap tiles.
- Renders:
  - User icon marker using a custom `L.Icon`.
  - Circular safety radius around user.
  - Styled `Tooltip` with zone name, risk level, city, and description.

### 3.4 `src/services/safetyApi.ts`

Core integration layer to the FastAPI backend.

- `SAFETY_API_BASE_URL` is derived from:

  ```ts
  const SAFETY_API_BASE_URL = import.meta.env.VITE_SAFETY_API_BASE_URL ?? 'http://localhost:8000';
  ```

- Provides helper functions, for example:
  - `fetchRiskZones()` – fetches risk zones.
  - `getSafetyProfile()` – fetches user’s safety profile.
  - `saveItinerary()`, `getUserItineraries()` – itinerary operations.
  - `sendLocationPing()` – sends periodic location to backend.
  - `getAlerts()`, `acknowledgeAlert()` – alert management.
  - (And any additional safety or digital ID operations.)
- All functions use `fetch` with `JSON` encoding/decoding and throw on non‑OK responses.

### 3.5 Contexts & Utilities

**`src/context/NotificationContext.tsx`**

- Manages notifications list:
  - `addNotification`, `markAsRead`, `removeNotification`.
  - `getActiveNotifications`, `getUnreadCount`.
- Provides initial demo notifications.
- Consumed by `new-ui/Navbar.tsx` to show an unread badge and dropdown.

**Other contexts** (not exhaustively listed here, but pattern is similar):

- Itinerary context – list of selected states/places and actions.
- Data context – loaded states, cities, places from Supabase.
- Auth context – wrappers around Supabase auth state.

---

## 4. Backend: Project Structure & Modules

**Root (backend):** `india-tour-safety-api/`

- `app/main.py` – FastAPI app creation, CORS, routers, health.
- `app/db.py` – DB engine/session setup (SQLAlchemy + `DATABASE_URL`).
- `app/models.py` – SQLAlchemy models (users, risk zones, locations, itineraries, alerts, digital IDs, etc.).
- `app/schemas.py` – Pydantic models for request/response bodies.
- `app/core/` – core configuration and utilities.
  - Likely includes settings class (reading `.env`), security helpers.
- `app/deps.py` – FastAPI dependency functions:
  - DB session provider.
  - Authenticated user dependency (Supabase JWT verification).
- `app/routers/` – modular API routers for each domain (e.g. `tourists`, `risk_zones`, `locations`, `itineraries`, `alerts`, `chat`).
- `.env` – backend env vars (local only, not committed). Mirrors Render env.
- `requirements.txt` – pinned Python dependencies.
- `tests/test_safety_core.py` – backend tests verifying safety logic.

### 4.3 Admin Users (Env-Based)

- Admin users are **not** determined by a DB column like `is_admin`; instead they are controlled via the environment variable `SAFETY_ADMIN_EMAILS`.
- Typical flow:
  1. Frontend authenticates with Supabase (Google OAuth).
  2. Supabase issues a JWT; frontend sends it as `Authorization: Bearer <token>` to FastAPI.
  3. FastAPI dependency (e.g. `get_current_user`) validates the JWT using Supabase settings.
  4. An admin-specific dependency (e.g. `get_admin_user`) checks whether the user’s email appears in `SAFETY_ADMIN_EMAILS`.
  5. Admin-only routes depend on `get_admin_user`, returning 403 for non-admins.

**Configuring admins on Render:**

- In Render → FastAPI service → Environment, set:

  ```text
  SAFETY_ADMIN_EMAILS=["admin1@example.com","admin2@example.com"]
  ```

  or, depending on how parsing is implemented, a comma-separated string.

After redeploy, any user who logs in with an email from this list is treated as admin.

### 4.1 `app/main.py`

Main responsibilities:

- Loads settings and constructs FastAPI app via a `create_app()` function.
- Configures CORS based on `BACKEND_CORS_ORIGINS` environment variable:
  - Example value on Render:

    ```json
    ["http://localhost:5173", "http://localhost:5174", "https://india-tour-smart-tourist-safety.netlify.app"]
    ```

- Includes routers for:
  - Tourist operations.
  - Safety risk zones.
  - Location pings and alerts.
  - Itineraries and digital IDs.
  - `/api/chat` for AI assistant (if `OPENAI_API_KEY` is present).
- Exposes:
  - `GET /` – root endpoint, often with basic metadata.
  - `GET /health` – health check.
- Provides `app = create_app()` for Uvicorn entry.

### 4.2 Models & Schemas

**`models.py`** (high level):

- Defines SQLAlchemy models roughly aligned with Supabase tables, such as:
  - `User` / `Tourist` models.
  - `RiskZone` (with `geom`, `bbox`, `risk_level`, `city`, `description`).
  - `LocationPing` – periodic user location data.
  - `Itinerary` / `ItineraryItem` – saved plans and entries.
  - `Alert` – safety alerts pushed to users.
  - `DigitalId` – digital safety IDs.
- Uses Postgres types for geometry/bounding boxes as necessary.

**`schemas.py`** (Pydantic models):

- Mirrors DB models for API I/O.
- Ensures type‑safe communication with the frontend.
- Typically includes `Base`, `Create`, `Update`, and `Out` variants.

### 4.3 Routers

**`app/routers/`** (high level):

- `risk_zones.py` – endpoints to:
  - List active zones.
  - Filter by state/city or risk level.
- `tourists.py` – user profile endpoints.
- `locations.py` – location ping endpoints.
- `itineraries.py` – CRUD operations for itineraries.
- `alerts.py` – fetch and acknowledge alerts.
- `digital_ids.py` – digital ID issuance/verification.
- `chat.py` – `/api/chat` that wraps OpenAI or another LLM (if configured).

Routers use dependencies from `deps.py` for DB access and auth.

### 4.4 Tests

**`tests/test_safety_core.py`**

- Contains unit tests for core safety functionality (e.g. scoring, filtering, or rules around zones/alerts).
- Uses pytest fixtures in `conftest.py` for DB or app setup.

---

## 5. Database: Schema & Migrations

### 5.1 Supabase Directory

**Path:** `India-Tour-main/supabase/`

- `config.toml` – local Supabase config for CLI.
- `apply_migration.sql` – heavyweight migration script.
- `migrations/*.sql` – incremental migrations as the project evolved.
- `backup_schema_*.sql` – schema backups.

### 5.2 Key Concepts

- **States** – normalized state metadata (name, code, capital, etc.).
- **Cities** – extended with `state_id` referencing `states.id`.
- **Places** – tourist places associated with cities, with ratings, categories.
- **Risk Zones** – geometric zones with bounding boxes and risk levels.
- **Digital IDs** – secure identifiers for tourists.
- **Statistics & Search** – `state_statistics` view and `search_states()` function.

### 5.3 Supabase CLI (optional)

Assuming you have Supabase CLI installed (optional for contributors):

```bash
cd India-Tour-main

supabase start           # Start local Supabase services
supabase db reset        # Reset DB and apply migrations + seed
supabase db push         # Push local schema to remote (use carefully)
supabase stop            # Stop Supabase services
```

The production backend uses the managed Supabase instance via `DATABASE_URL`.

---

### 5.4 Example SQL Inserts for States, Cities, and Places

These examples show how to manually insert **states**, **cities**, and **places** into the Supabase/Postgres database. They are useful when working directly in the Supabase SQL editor or psql.

#### 5.4.1 Insert Using Names (via Subqueries)

```sql
-- Insert a state
INSERT INTO public.states (name, description, image_url)
VALUES (
  '<STATE_NAME>',
  '<STATE_DESCRIPTION>',
  '<STATE_IMAGE_URL>'
) RETURNING *;



-- Insert a city for a given state
INSERT INTO public.cities (name, state_id, description, image_url)
VALUES (
  '<CITY_NAME>',
  (SELECT id FROM public.states WHERE name = '<STATE_NAME>' LIMIT 1),
  '<CITY_DESCRIPTION>',
  '<CITY_IMAGE_URL>'
) RETURNING *;



-- Insert a place for a given city and state
INSERT INTO public.places (
  name,
  city_id,
  state,
  description,
  image_url,
  rating,
  category
)
VALUES (
  '<PLACE_NAME>',
  (SELECT id FROM public.cities WHERE name = '<CITY_NAME>' LIMIT 1),
  '<STATE_NAME>',
  '<PLACE_DESCRIPTION>',
  '<PLACE_IMAGE_URL>',
  <RATING_NUMERIC>,     -- e.g. 4.5
  '<CATEGORY_TEXT>'     -- e.g. 'Historical', 'Nature', 'Temple', 'Food'
) RETURNING *;
```

#### 5.4.2 Insert When You Already Know IDs

If you already know the `state_id` or `city_id`, you can skip the subqueries and insert directly:

```sql
-- Insert a city when you know state_id
INSERT INTO public.cities (name, state_id, description, image_url)
VALUES (
  '<CITY_NAME>',
  <STATE_ID>,
  '<CITY_DESCRIPTION>',
  '<CITY_IMAGE_URL>'
) RETURNING *;


-- Insert a place when you know city_id
INSERT INTO public.places (
  name,
  city_id,
  state,
  description,
  image_url,
  rating,
  category
)
VALUES (
  '<PLACE_NAME>',
  <CITY_ID>,
  '<STATE_NAME>',
  '<PLACE_DESCRIPTION>',
  '<PLACE_IMAGE_URL>',
  <RATING_NUMERIC>,
  '<CATEGORY_TEXT>'
) RETURNING *;
```

Replace the placeholder values (`<STATE_NAME>`, `<CITY_NAME>`, etc.) with real data when executing these queries.

### 5.5 Risk Zones: Storage and Example Insert

- Risk zones for the safety map are stored in a `public.risk_zones` table.
- Important columns (see Supabase table editor):
  - `name` (TEXT)
  - `description` (TEXT)
  - `risk_level` (TEXT)
  - `category` (TEXT, optional)
  - `city` (TEXT, optional)
  - `geom` (JSON) – must include a `bbox` field used by the frontend
  - `is_active` (BOOLEAN)
  - `created_by` (TEXT)
- The frontend expects `zone.geom.bbox` to be an array:

```json
{
  "bbox": [minLng, minLat, maxLng, maxLat]
}
```

**Example: insert a risk zone using Supabase SQL editor**

```sql
INSERT INTO public.risk_zones (
  name,
  description,
  risk_level,
  category,
  city,
  geom,
  is_active,
  created_by
)
VALUES (
  'Old Delhi High-Risk Area',
  'Area with frequent pickpocketing and crowd-related risks.',
  'HIGH',                     -- or CRITICAL / MEDIUM / LOW
  'crime',
  'Delhi',
  jsonb_build_object(
    'bbox',
    ARRAY[77.1980, 28.6400, 77.2120, 28.6520]  -- [minLng, minLat, maxLng, maxLat]
  ),
  TRUE,
  'manual_seed'
);
```

After running this insert, reloading the frontend and zooming to the specified area will show the new polygon on the safety map (drawn via `SafetyMapPage.tsx`).

---

## 6. Environment Configuration

Environment variables are fully described in `README.md`. Here is how they align with each layer:

- **Frontend (Vite)**:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_SECRET`, `VITE_GOOGLE_REDIRECT_URI`
  - `VITE_SAFETY_API_BASE_URL`
  - `VITE_MAPBOX_ACCESS_TOKEN`
  - `NODE_ENV`

- **Backend (FastAPI)**:
  - `PYTHON_VERSION`, `DATABASE_URL`
  - `BACKEND_CORS_ORIGINS`
  - `SUPABASE_JWT_AUDIENCE`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_SECRET`
  - `SAFETY_ADMIN_EMAILS`, `SAFETY_ENCRYPTION_KEY`
  - `OPENAI_API_KEY` (optional)

- **Supabase (managed)**:
  - Project settings, service role key, anon key – configured in Supabase dashboard.

---

## 7. Commands: Frontend, Backend, Database, Git & Deployment

### 7.1 Frontend Commands (from `India-Tour-main/`)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build production bundle
npm run build

# Preview built bundle locally
npm run preview

# Run frontend tests (Vitest + Testing Library)
npm run test

# Run ESLint
npm run lint

# Seed helper scripts
npm run seed:states      # seed states data
npm run seed:cities      # seed cities data
npm run seed:places      # seed places data

# Apply digital ID DB migration logic (Node-based)
npm run db:migrate:digital-id
```

### 7.2 Backend Commands (from `india-tour-safety-api/`)

```bash
# Create & activate virtual environment (Windows example)
python -m venv .venv
.\.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI in dev mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run backend tests
pytest
```

### 7.3 Database / Supabase Commands (Optional)

```bash
cd India-Tour-main

# Start Supabase locally
supabase start

# Reset DB, apply migrations, and seed data
supabase db reset

# Push schema changes to remote Supabase (advanced, use carefully)
supabase db push

# Stop local Supabase
supabase stop
```

### 7.4 Git & Deployment Workflow

Typical workflow after making code changes:

```bash
# From repo root

git status               # inspect changes

git add <files>         # stage selected files (or `git add .` if you are sure)

git commit -m "Describe change"  # commit

git push origin main     # push to GitHub
```

**Deployment:**

- **Netlify** automatically builds frontend from GitHub `main` branch using:
  - Base dir: `India-Tour-main`
  - Build: `npm run build`
  - Publish: `dist`

- **Render** pulls backend from the same repo and runs:
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 8. Feature Flows (End‑to‑End)

### 8.1 Viewing the Safety Map

1. User opens the site.
2. Frontend requests geolocation via `navigator.geolocation`.
3. `SafetyMapPage.tsx` sets `position` and renders `MapContainer`.
4. `fetchRiskZones()` calls FastAPI `/safety/risk-zones` endpoint.
5. Backend fetches zones from Postgres (`RiskZone` model) and returns JSON.
6. Frontend draws polygons for each zone with color/opacity based on `risk_level`.
7. As user zooms, low‑importance zones may be hidden.
8. Tooltips show zone name, risk level, city, and description.

### 8.2 Logging In with Google

1. Frontend uses Supabase client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. User clicks “Login with Google” in navbar or auth UI.
3. Supabase redirects to Google OAuth with `VITE_GOOGLE_CLIENT_ID` and redirect URI.
4. After approval, user is redirected back to `/auth/callback`.
5. Supabase completes login and returns session.
6. Auth‑aware components (Navbar, Profile) react to user being logged in.

### 8.3 Saving an Itinerary

1. Logged‑in user selects destinations (states/cities/places) in new UI.
2. Itinerary context collects selected items.
3. User triggers “Save Itinerary”.
4. `safetyApi.ts` sends itinerary payload to backend `/safety/itineraries`.
5. Backend validates payload with Pydantic schemas and writes to Postgres.
6. Frontend updates itinerary list and potentially triggers notifications.

### 8.4 Managing Digital IDs

1. User navigates to Digital ID feature.
2. Frontend loads or generates a digital ID record via backend `/safety/digital-id` endpoints.
3. Backend writes to Postgres `digital_ids` table.
4. User can view the ID, export as PDF/QR, and show offline.

### 8.5 AI Chatbot Flow (when wired to backend)

1. User opens chatbot (`new-ui/Chatbot.tsx`) and sends a message.
2. Chat component calls `sendChatMessage()` (to be implemented) in `safetyApi.ts`.
3. FastAPI `/api/chat` receives message and forwards to OpenAI using `OPENAI_API_KEY`.
4. Backend returns assistant response.
5. Frontend appends response to chat history and scrolls to bottom.

---

## 9. Feature Catalog – Frontend ↔ Backend ↔ Database

This section summarizes the main user-facing features and clearly maps them across **frontend components**, **API calls**, and **database tables**.

### 9.1 Safety Map & Safety Dashboard

- **User experience**: interactive map with user location, radius circle, and colored polygons for risk zones, plus dashboard-style safety info.
- **Frontend**:
  - `src/features/safety/SafetyMapPage.tsx` using React Leaflet.
  - New-UI safety-related sections in `new-ui/features/safety/`.
- **API / Backend**:
  - `safetyApi.ts` → `fetchRiskZones()` → `GET /risk-zones` (router `risk_zones.py`).
- **Database**:
  - `risk_zones` table, with JSON `geom` (containing `bbox`), `risk_level`, `category`, `city`, and timestamps.

### 9.2 Destinations & Places

- **User experience**: explore states, cities, and places; apply filters; view ratings and details.
- **Frontend**:
  - Classic `features/destinations` + destination pages.
  - New-UI `new-ui/features/destinations/` cards and carousels.
- **API / Data**:
  - Mostly direct Supabase client queries from contexts (`@supabase/supabase-js`).
  - Optional use of views/functions like `state_statistics` and `search_places()`.
- **Database**:
  - `states`, `cities`, `places`, `events`, `local_specialties`, `transport_options`, `reviews`.

### 9.3 Itineraries

- **User experience**: build and save trip plans, then reopen them later.
- **Frontend**:
  - Itinerary contexts (ItineraryContext) and components under `features/itinerary` and new UI.
- **API / Backend**:
  - `safetyApi.ts`: `saveItinerary()`, `getUserItineraries()` → router `itinerary.py`.
  - Uses Supabase JWT via `get_current_user()`.
- **Database**:
  - `itineraries`, `itinerary_items`, joined with `places` and tourist/user table.

### 9.4 Digital Safety ID

- **User experience**: view a digital ID card with emergency details and a unique ID.
- **Frontend**:
  - `DigitalIDPage.tsx` and related components/contexts.
- **API / Backend**:
  - `safetyApi.ts`: `getDigitalId()` / `createOrUpdateDigitalId()` → digital-ID endpoints.
  - Router integrated with `tourists`/profile logic and `get_current_user()`.
- **Database**:
  - `digital_ids` table with RLS policies so users see only their own IDs.

### 9.5 Alerts & Notifications

- **User experience**: notification bell and dropdown, plus possible banners.
- **Frontend**:
  - `NotificationContext.tsx`, Navbar notification UI, alert components.
- **API / Backend**:
  - `safetyApi.ts`: `getAlerts()`, `acknowledgeAlert()` → `alerts.py` router.
- **Database**:
  - `alerts` table with user references and read/ack flags.

### 9.6 Admin Panel

- **User experience**: admin-only interface for managing data (incidents, content, etc.).
- **Frontend**:
  - `AdminPage.tsx` and admin components.
- **API / Backend**:
  - Uses existing routers (e.g. `incidents.py`, `itinerary.py`) but protected with admin dependency.
  - Admin detection via `SAFETY_ADMIN_EMAILS` + `get_admin_user()`.

### 9.7 AI Chatbot

- **User experience**: conversational assistant for questions about safety and travel.
- **Frontend**:
  - `new-ui/Chatbot.tsx` plus message types in `new-ui/types/index.ts`.
- **API / Backend**:
  - When enabled: `sendChatMessage()` style helper → `/api/chat` endpoint.
  - Backend uses `OPENAI_API_KEY` (or similar) to reach an external LLM.

---

## 10. Extensibility Guidelines

- **New Frontend Feature**
  - Create a new file under `src/new-ui/features/<domain>/`.
  - Add routes in `new-ui/App.tsx` or `src/App.tsx`.
  - Use `safetyApi.ts` or create a new service module.
  - Reuse `Button`, `Card`, `Navbar`, and contexts.

- **New Backend Endpoint**
  - Add SQL changes via a new migration under `supabase/migrations`.
  - Update `models.py` and `schemas.py` accordingly.
  - Create a router module under `app/routers/` and include it in `main.py`.
  - Add matching helper functions in `safetyApi.ts`.
  - Add tests in `tests/`.

- **New DB Feature**
  - Prefer Supabase migrations to keep schema versioned.
  - Optionally update `apply_migration.sql` if you want a one‑shot setup script.

---

## 10. Where to Start as a New Contributor

- Read `README.md` for high‑level context and quick start.
- Skim this `docs/DETAILED_DOCUMENTATION.md` for module‑level understanding.
- For frontend work:
  - Start from `India-Tour-main/src/new-ui/App.tsx` and `pages/HomePage.tsx`.
  - Trace into `HeroSection`, `Navbar`, `SafetyMapPage`, and `Chatbot`.
- For backend work:
  - Start from `india-tour-safety-api/app/main.py`.
  - Explore `models.py`, `schemas.py`, and key routers.
- For database changes:
  - Review `supabase/apply_migration.sql` and `supabase/migrations/`.

This document is intended to capture **all major moving parts** of the project. If you add a significant feature, update this file and the main README to keep the documentation in sync with the codebase.
