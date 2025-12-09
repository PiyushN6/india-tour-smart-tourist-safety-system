# India Tour – Smart Tourist Safety System

## 1. Project Overview

India Tour – Smart Tourist Safety System is a full‑stack web application that helps tourists plan safer trips across India. It combines:

- Interactive safety maps with live risk zones
- AI‑assisted planning and chatbot
- Supabase‑backed authentication (Google Sign‑In)
- Itinerary management and safety alerts

**Live deployments:**

- Frontend (Netlify): `https://india-tour-smart-tourist-safety.netlify.app`
- Backend API (Render): `https://india-tour-smart-tourist-safety-system.onrender.com`
  - Health check: `https://india-tour-smart-tourist-safety-system.onrender.com/health`
  - Interactive docs (Swagger UI): `https://india-tour-smart-tourist-safety-system.onrender.com/docs`

The project is split into three major parts:

- **Frontend**: React + Vite (TypeScript) deployed on **Netlify**
- **Backend API**: FastAPI (Python) deployed on **Render**
- **Database/Auth**: **Supabase** (PostgreSQL + Auth) with SQL migrations stored in the repo

---

## 2. High‑Level Architecture

### 2.1 Components

- **Frontend (Vite + React, TypeScript)**  
  Path: `India-Tour-main/`
  - SPA with new UI components under `src/new-ui`
  - Uses React Router, Framer Motion, React Leaflet, Tailwind‑style utility classes
  - Talks to:
    - Supabase JS client (auth & some data)
    - FastAPI backend via `src/services/safetyApi.ts`

- **Backend (FastAPI)**  
  Path: `india-tour-safety-api/`
  - REST API for safety data, itineraries, risk zones, and AI chat
  - Uses SQLAlchemy + Supabase Postgres (Session Pooler)
  - CORS configured for localhost + Netlify

- **Supabase (Database & Auth)**  
  Path: `India-Tour-main/supabase/` and external Supabase project
  - Authentication (Google OAuth)
  - PostgreSQL database for users, itineraries, risk zones, alerts and digital IDs
  - SQL migrations & schema files tracked in `supabase/migrations` and `supabase/apply_migration.sql`

### 2.2 Data Flow

1. User opens the **Netlify frontend**.
2. Frontend loads configuration from **Vite env vars** (`VITE_...`).
3. User signs in via **Supabase Google OAuth**.
4. Frontend calls:
   - Supabase directly for auth/user data.
   - **FastAPI backend** for safety‑specific features via `safetyApi.ts`.
5. Backend reads/writes data in Supabase Postgres and returns JSON.
6. Map components (React Leaflet) and the AI chatbot render and consume that data.

---

## 3. Frontend (React + Vite)

### 3.1 Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- Framer Motion (animations)
- React Leaflet + Leaflet (maps)
- Supabase JS client
- Tailwind‑style utility classes

### 3.2 Key Structure

**Location:** `India-Tour-main/`

- `src/main.tsx` – React entry point.
- `src/App.tsx` – App shell, routing, global layout, navbar/footer.
- `src/services/safetyApi.ts` – All HTTP calls to the FastAPI backend.
- `src/features/safety/SafetyMapPage.tsx` – Safety map with user location + risk zones.
- `src/new-ui/`
  - `components/Navbar.tsx` – Main navigation, auth display, notifications, SOS, theme toggle.
  - `components/Footer.tsx` – Footer with navigation, social links, emergency info.
  - `components/HeroSection.tsx` – Landing hero with search and CTAs.
  - `components/Chatbot.tsx` – Floating AI assistant UI.
  - `features/profile/UserProfile.tsx` – Shows user profile, avatar, safety ID.
  - `pages/HomePage.tsx` – New home page composed of hero, safety overview, destinations, trust indicators, final CTAs.
  - `types/index.ts` – Shared TS interfaces (chat messages, capabilities, button props, etc.).
- `src/context/NotificationContext.tsx` – Notification system (add, mark read, remove, get unread count).

### 3.3 SafetyMapPage (Key Behaviors)

**File:** `src/features/safety/SafetyMapPage.tsx`

- Uses `MapContainer`, `TileLayer`, `Marker`, `Circle`, `Polygon`, `Tooltip`, and `useMap` from `react-leaflet`.
- Tracks **user location** using `navigator.geolocation.watchPosition`.
- Maintains state:
  - `position`: current user coordinates
  - `geoError`: geolocation error message
  - `riskZones`: list of zones from backend
  - `zonesError`: error loading zones
  - `zoom`: current map zoom (tracked via `MapZoomWatcher` helper component)
- Loads **risk zones** from `fetchRiskZones()` in `safetyApi.ts`.
  - Each risk zone has a `geom.bbox` used to construct a `Polygon`.
  - Zones are colored by risk level (high/critical vs medium).
  - Zoom‑based filtering hides some zones when zoomed out.
- Uses **Mapbox** or **OpenStreetMap** tiles:
  - Reads `VITE_MAPBOX_ACCESS_TOKEN` from env.
  - If available, uses Mapbox tiles; otherwise falls back to OSM.
- Renders:
  - A **user marker** with a custom Leaflet icon.
  - A **radius circle** around the user.

### 3.4 safetyApi.ts (Backend Integration)

**File:** `src/services/safetyApi.ts`

- Defines base URL:

  ```ts
  const SAFETY_API_BASE_URL = import.meta.env.VITE_SAFETY_API_BASE_URL ?? 'http://localhost:8000';
  ```

- Provides helper functions to call backend endpoints, e.g.:
  - `fetchRiskZones()` – load active risk zones.
  - `getSafetyProfile()` – fetch user safety profile.
  - `saveItinerary(...)`, `getUserItineraries(...)`.
  - `sendLocationPing(...)`.
  - `getAlerts(...)`, `acknowledgeAlert(...)`.
- All helpers:
  - Construct the full URL by concatenating `SAFETY_API_BASE_URL` with the API path.
  - Use `fetch` with JSON parsing and error handling.

---

## 4. Backend (FastAPI)

### 4.1 Tech Stack

**Location:** `india-tour-safety-api/`

- Python 3.11
- FastAPI
- Uvicorn
- SQLAlchemy
- Psycopg2
- Pydantic / Pydantic Settings
- Supabase Postgres (Session Pooler)
- pytest

### 4.2 Main Application

**File:** `india-tour-safety-api/app/main.py`

- Creates a FastAPI app via a `create_app()` function.
- Configures CORS using `BACKEND_CORS_ORIGINS` env var.
- Includes multiple routers (tourists, risk zones, locations, itineraries, alerts, etc.).
- Exposes utility endpoints:
  - `GET /` – root info.
  - `GET /health` – health check.
- Defines `/api/chat` endpoint for AI assistant, which uses `OPENAI_API_KEY` if configured.

### 4.3 Database Integration

- Uses Supabase **Session Pooler** URL for `DATABASE_URL`, e.g.

  ```text
  postgresql://postgres.hqcgedoxnyvrwbhyxpql:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
  ```

- SQLAlchemy is used for ORM / DB operations.
- Stores entities such as:
  - Risk zones (with geometric data / bbox)
  - User profiles and safety info
  - Itineraries and alerts

### 4.4 CORS

- Configured via environment variable `BACKEND_CORS_ORIGINS` (JSON array), for example:

  ```json
  ["http://localhost:5173", "http://localhost:5174", "https://india-tour-smart-tourist-safety.netlify.app"]
  ```

- FastAPI CORS middleware uses this list to send appropriate `Access-Control-Allow-Origin` headers.

### 4.5 AI Chat Endpoint

- `/api/chat` route accepts chat prompts and returns AI responses.
- Requires `OPENAI_API_KEY` in env to be functional.
- Can be wired to the frontend `Chatbot.tsx` via a helper in `safetyApi.ts`.

---

## 5. Environment Variables

### 5.1 Frontend (Vite / Netlify)

Set these in **Netlify → Site settings → Build & deploy → Environment**.

- **Supabase / Auth**
  - `VITE_SUPABASE_URL` – Supabase project URL.
  - `VITE_SUPABASE_ANON_KEY` – Public anon key for Supabase client.
  - `VITE_GOOGLE_CLIENT_ID` – Google OAuth Client ID.
  - `VITE_GOOGLE_CLIENT_SECRET` – (if used client‑side; often better in backend only).
  - `VITE_GOOGLE_REDIRECT_URI` – OAuth redirect URI.
    - Local: `http://localhost:5173/auth/callback`
    - Production: `https://india-tour-smart-tourist-safety.netlify.app/auth/callback`

- **Backend API**
  - `VITE_SAFETY_API_BASE_URL`
    - Local: `http://localhost:8000`
    - Production: `https://india-tour-smart-tourist-safety-system.onrender.com`

- **Mapbox**
  - `VITE_MAPBOX_ACCESS_TOKEN` – Mapbox public access token.

- **Misc**
  - `NODE_ENV` – `development` (local) or `production` (Netlify).

Local development values should be added to `India-Tour-main/.env.local` or `.env` using the same variable names.

### 5.2 Backend (Render)

Configure these in **Render → Service → Environment** for the FastAPI service:

- Core backend:
  - `PYTHON_VERSION=3.11.9`
  - `DATABASE_URL` – Supabase Session Pooler URL.
  - `BACKEND_CORS_ORIGINS` – JSON array of allowed origins.
  - `SAFETY_ADMIN_EMAILS` – comma‑separated or JSON list of admin emails.
  - `SAFETY_ENCRYPTION_KEY` – a strong random secret.

- Supabase JWT (for validating Supabase tokens):
  - `SUPABASE_JWT_AUDIENCE`
  - `SUPABASE_JWT_ISSUER`
  - `SUPABASE_JWT_SECRET`

- AI (optional):
  - `OPENAI_API_KEY` – required if `/api/chat` is used.

---

## 6. Database / Supabase

### 6.1 Supabase Project & Local Config

This project uses **Supabase** both as an authentication provider and as the primary PostgreSQL database.

- Remote project ID: `hqcgedoxnyvrwbhyxpql`.
- Local Supabase configuration lives in: `India-Tour-main/supabase/`.
  - `config.toml` – Supabase local dev configuration (ports, API schemas, seed files, studio, etc.).
  - `apply_migration.sql` – consolidated SQL script to create/patch core tables and sample data.
  - `migrations/` – individual SQL migration files for incremental schema changes.
  - `backup_schema_*.sql` – backup of schema at specific points in time.

From `config.toml`:

- `db.port = 54322` – local Postgres port.
- `db.migrations.enabled = true` – migration files are applied during `supabase db reset`.
- `db.seed.enabled = true` and `db.seed.sql_paths = ["./seed.sql"]` – optional seeding after migrations.
- `realtime.enabled = true`, `auth.enabled = true`, `storage.enabled = true` – real-time, auth, and storage are enabled in local Supabase.

### 6.2 Core Schema (apply_migration.sql)

The `apply_migration.sql` script performs core schema tasks:

- Ensures `uuid-ossp` extension is enabled.
- Creates `public.states` table with fields such as `id` (UUID), `name`, `code`, `description`, `capital`, `region`, `population`, `area_km2`, `languages`, `best_time_to_visit`, `image_url`, `created_at`, `updated_at`.
- Adds `state_id` foreign key column to `public.cities` if it does not exist, plus index and foreign key constraint.
- Defines a reusable trigger function `update_modified_column()` and trigger `update_states_modtime` to keep `updated_at` current.
- Defines `public.search_states(query TEXT)` for full‑text search on states.
- Defines `public.state_statistics` view combining states, cities, and places with aggregated counts and average rating.
- Inserts sample states (Andhra Pradesh, Madhya Pradesh, Rajasthan, Kerala, Uttar Pradesh) with metadata and example image URLs.
- Migrates existing city `state` names into the new `states` table and backfills `cities.state_id` from `states.id`.

Additional migrations live under `supabase/migrations/` and include tasks like:

- Adding new or missing core tables.
- Adding a museum category and related fields.
- Adding a `states` table (earlier version than `apply_migration.sql`).
- Adding an `img_url` to specific content tables.
- Defining a `digital_ids` table for digital safety IDs.

### 6.3 Using Supabase CLI (Optional)

If you want to manage the schema locally with the Supabase CLI, you can:

1. Install the Supabase CLI (see official Supabase docs).
2. From `India-Tour-main/` run commands such as:

```bash
supabase start           # start local Supabase stack
supabase db reset        # reset DB and apply migrations + seeds
supabase db push         # push local schema to remote (use with care)
supabase stop            # stop local Supabase stack
```

The backend uses the **remote Supabase instance** in production via `DATABASE_URL` (Session Pooler), so the CLI is mainly for local experimentation.

---

## 7. Local Development

### 7.1 Prerequisites

- Node.js (LTS)
- Python 3.11
- Git
- Supabase project & keys
- Mapbox public access token

### 7.2 Clone the Repository

```bash
git clone https://github.com/PiyushN6/india-tour-smart-tourist-safety-system.git
cd india-tour-smart-tourist-safety-system
```

### 7.3 Frontend Setup

```bash
cd India-Tour-main
npm install
```

Create `./.env.local` (or `.env`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_SAFETY_API_BASE_URL=http://localhost:8000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NODE_ENV=development
```

Run the dev server:

```bash
npm run dev
# App available at http://localhost:5173
```

### 7.4 Backend Setup

```bash
cd ../india-tour-safety-api
python -m venv .venv
# Windows
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```env
DATABASE_URL=postgresql://postgres.hqcgedoxnyvrwbhyxpql:password@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:5174"]
SUPABASE_JWT_AUDIENCE=...
SUPABASE_JWT_ISSUER=...
SUPABASE_JWT_SECRET=...
SAFETY_ADMIN_EMAILS=you@example.com
SAFETY_ENCRYPTION_KEY=some_secure_random_string
OPENAI_API_KEY=your_openai_key_if_used
```

Run FastAPI locally:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Now:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## 8. Commands Reference

This section summarizes the most important commands from `package.json` and the backend setup.

### 8.1 Frontend (Vite + React)

From `India-Tour-main/`:

```bash
# Start dev server
npm run dev

# Build production bundle
npm run build

# Preview built app locally
npm run preview

# Run frontend tests (Vitest + Testing Library)
npm run test

# Run ESLint over the codebase
npm run lint

# Seed helper scripts (Node-based)
npm run seed:states   # seeds states data
npm run seed:cities   # seeds cities data
npm run seed:places   # seeds places data

# Apply digital ID DB migration via Node script
npm run db:migrate:digital-id
```

### 8.2 Backend (FastAPI)

From `india-tour-safety-api/`:

```bash
# Create / activate virtual environment (Windows example)
python -m venv .venv
.\.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests (pytest)
pytest
```

`requirements.txt` pins the following key packages:

- `fastapi==0.111.0`
- `uvicorn[standard]==0.30.1`
- `SQLAlchemy==2.0.30`
- `psycopg2-binary==2.9.9`
- `python-dotenv==1.0.1`
- `python-jose[cryptography]==3.3.0`
- `pydantic==2.7.0`
- `pydantic-settings==2.2.1`
- `pytest==8.3.3`

The `tests/` directory currently contains backend tests such as `test_safety_core.py` to validate core safety logic.

---

## 9. Deployment

### 7.1 Backend on Render

1. **Create a new Web Service** from this repo, selecting `india-tour-safety-api` directory (or specify it in build command if needed).
2. **Build command:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Start command:**

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. Set environment variables described in **5.2** (DATABASE_URL, CORS, JWT, etc.).
5. Ensure `PYTHON_VERSION=3.11.9` is set.
6. Deploy and confirm the service is reachable at:

   ```
   https://india-tour-smart-tourist-safety-system.onrender.com
   ```

### 7.2 Frontend on Netlify

1. **New site from Git** → connect this GitHub repo.
2. **Build settings:**
   - Base directory: `India-Tour-main`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set Netlify environment variables as in **5.1**.
4. Deploy and verify the site at:

   ```
   https://india-tour-smart-tourist-safety.netlify.app
   ```

5. Post‑deploy checks:
   - Login with Google works end‑to‑end.
   - Safety map loads.
   - Risk zones and safety data load without CORS errors.

---

## 10. Troubleshooting

### 8.1 CORS Errors (Netlify → Render)

**Symptoms:**

- Console shows: `Access to fetch at ... from origin ... has been blocked by CORS policy`.

**Fix:**

1. On Render, set `BACKEND_CORS_ORIGINS` to include Netlify and local origins, for example:

   ```json
   ["http://localhost:5173", "http://localhost:5174", "https://india-tour-smart-tourist-safety.netlify.app"]
   ```

2. Redeploy / restart the backend.
3. Hard refresh the Netlify site.

### 8.2 Frontend Still Calls localhost in Production

**Symptoms:**

- Network requests from Netlify show `http://localhost:8000` as the base.

**Fix:**

- Ensure Netlify `VITE_SAFETY_API_BASE_URL` is set to the Render URL:

  ```
  https://india-tour-smart-tourist-safety-system.onrender.com
  ```

- Confirm `safetyApi.ts` uses `import.meta.env.VITE_SAFETY_API_BASE_URL`.
- Rebuild and redeploy Netlify.

### 8.3 Mapbox Token / Map Not Visible

**Symptoms:**

- Map tiles not loading or errors about access token.

**Fix:**

- Confirm `VITE_MAPBOX_ACCESS_TOKEN` is set (Netlify & local).
- Ensure `SafetyMapPage.tsx` reads `VITE_MAPBOX_ACCESS_TOKEN` and not an old env name.
- Redeploy frontend if env vars changed.

### 8.4 Leaflet TypeScript Errors

**Symptoms:**

- TS error: `Could not find a declaration file for module 'leaflet'`.
- Props like `center`, `zoom`, `sticky`, `radius`, `icon` flagged by TypeScript.

**Fix:**

```bash
cd India-Tour-main
npm install --save-dev @types/leaflet
```

Then restart the TypeScript server / editor.

### 8.5 Google OAuth Failures

**Checklist:**

1. **Google Cloud Console**
   - OAuth client type is `Web application`.
   - Authorized redirect URIs include:
     - `http://localhost:5173/auth/callback`
     - `https://india-tour-smart-tourist-safety.netlify.app/auth/callback`

2. **Supabase → Authentication → Providers → Google**
   - Client ID and secret match Google Cloud values.
   - Redirect URL configured as required by Supabase.

3. **Netlify env vars**
   - `VITE_GOOGLE_CLIENT_ID` is set correctly.
   - `VITE_GOOGLE_REDIRECT_URI` matches the production callback URL.

---

## 11. Repository Layout

```text
root /
├── India-Tour-main/                  # Frontend (Vite + React + TS)
│   ├── src/
│   │   ├── App.tsx                   # Main application shell & routes
│   │   ├── main.tsx                  # React entry point
│   │   ├── services/
│   │   │   └── safetyApi.ts          # All backend API calls
│   │   ├── features/
│   │   │   └── safety/
│   │   │       └── SafetyMapPage.tsx # Safety map (React Leaflet)
│   │   └── new-ui/                   # New UI components, pages, features, types
│   ├── supabase/
│   │   ├── config.toml               # Supabase local dev configuration
│   │   ├── apply_migration.sql       # Combined SQL for core schema & sample data
│   │   ├── migrations/               # Individual SQL migrations
│   │   └── backup_schema_*.sql       # Schema backups (if present)
│   ├── scripts/                      # Node scripts (seeding, migrations, etc.)
│   ├── package.json                  # Frontend dependencies & npm scripts
│   ├── package-lock.json
│   └── ...
├── india-tour-safety-api/            # Backend (FastAPI)
│   ├── app/
│   │   └── main.py                   # FastAPI app factory, routers, CORS, health
│   ├── requirements.txt              # Python dependencies
│   ├── .env (not committed)          # Backend runtime env vars (local only)
│   └── tests/                        # Backend tests (pytest)
├── .gitignore
├── .venv/ (ignored)                  # Python virtual environment (local)
└── README.md                         # This documentation
```

Root‑level `package.json` and `package-lock.json` were intentionally removed in a later cleanup commit; only `India-Tour-main/package*.json` are used for the frontend Node project.

---

## 12. Extending the Project

- **Add new API endpoint**
  - Create a router module under `india-tour-safety-api/app/routers/`.
  - Register it in `app/main.py`.
  - Add a matching helper in `src/services/safetyApi.ts`.
  - Build UI components in `src/new-ui` or `src/features/`.

- **Add new map layers or visualizations**
  - Extend `SafetyMapPage.tsx` to fetch and render more data using Leaflet layers.

- **Extend AI assistant**
  - Wire `Chatbot.tsx` to call `/api/chat` instead of using mock responses.
  - Add new intents/commands handled in the backend.
