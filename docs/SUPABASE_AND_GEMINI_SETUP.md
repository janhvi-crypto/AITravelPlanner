# Beginner setup: Supabase + Gemini (itinerary AI)

Follow this top to bottom. Do not skip steps.

---

## Part A — Create a Supabase project

1. Open https://supabase.com in your browser.
2. Click **Start your project** and sign in (GitHub is easiest).
3. Click **New project**.
4. Fill in:
   - **Organization** — create one if asked
   - **Project name** — e.g. `ai-travel-planner`
   - **Database password** — invent a strong password and **save it in Notepad** (you need it later)
   - **Region** — pick closest to you (e.g. Mumbai / Singapore)
5. Click **Create new project**. Wait 1–2 minutes until it says ready.

---

## Part B — Turn off email confirmation (for easy local testing)

1. In the left sidebar: **Authentication** → **Providers** → **Email**.
2. Find **Confirm email** and **turn it OFF**.
3. Save.

If you leave this ON, signup often returns no session token and login feels “broken”.

---

## Part C — Create the database tables

1. Left sidebar: **SQL Editor** → **New query**.
2. Open the file in this repo: `supabase/schema.sql`.
3. Copy **all** of its contents into the SQL Editor.
4. Click **Run** (bottom right).
5. You should see **Success**.

Check tables:
- Left sidebar → **Table Editor**
- You should see: `profiles`, `places`, `trips`, `reviews`
- Open `places` — you should see 6 cities (Jaipur, Goa, …)

---

## Part D — Copy your Supabase keys into `.env`

1. Left sidebar: **Project Settings** (gear) → **API**.
2. Copy these three values:

| What you see in Supabase | Paste into `backend/.env` as |
|--------------------------|------------------------------|
| Project URL              | `SUPABASE_URL=` |
| `anon` `public` key      | `SUPABASE_ANON_KEY=` and also `SUPABASE_PUBLISHABLE_KEY=` |
| `service_role` `secret`  | `SUPABASE_SERVICE_ROLE_KEY=` and also `SUPABASE_KEY=` |

3. In your project folder create the file:

`backend/.env`

(You can copy from `backend/.env.example` and fill the blanks.)

**Never commit `.env` or share the `service_role` key.** It bypasses security rules.

---

## Part E — Get a Gemini API key (AI itineraries)

1. Open https://aistudio.google.com/apikey
2. Sign in with Google.
3. Click **Create API key**.
4. Choose a Google Cloud project (or create one) → Create.
5. Copy the key. Newer Google AI Studio keys often start with `AQ.` (older ones with `AIza...`) — **both are valid**.
6. Paste into `backend/.env`:

```
GEMINI_API_KEY=AQ............   # or AIzaSy...
GEMINI_MODEL=gemini-3.1-flash-lite
```

Restart the backend after changing `.env`. If Gemini returns a 404 about a retired model, try `gemini-3.1-flash-lite` or `gemini-3.6-flash`.

---

## Part F — Example full `backend/.env`

```env
PORT=5000
CLIENT_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080,http://localhost:5173

SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

GEMINI_API_KEY=AIzaSy................
GEMINI_MODEL=gemini-3.1-flash-lite

ALLOW_DEMO_AUTH=false

OPENWEATHER_API_KEY=
GOOGLE_MAPS_API_KEY=
```

`frontend/.env` only needs:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Part G — Run the app

Open **two** terminals:

```powershell
cd "c:\Users\JANHVI KUMARI\OneDrive\Desktop\AI PLANNER\AITravelPlanner\backend"
npm install
npm run dev
```

```powershell
cd "c:\Users\JANHVI KUMARI\OneDrive\Desktop\AI PLANNER\AITravelPlanner\frontend"
npm install
npm run dev
```

Then open the frontend URL Vite prints (often `http://localhost:8080`).

Quick checks:
1. Browser: `http://localhost:5000/health` → `{ "status": "ok" }`
2. Browser: `http://localhost:5000/test-db` → should say database connected
3. Sign up with a real email + password (≥ 6 chars)
4. Generate an itinerary → should use Gemini (not the stub message)

---

## If something fails

| Symptom | Fix |
|---------|-----|
| `/test-db` fails | Wrong URL/key, or `schema.sql` not run |
| Signup works but no token | Turn off **Confirm email** (Part B) |
| “GEMINI_API_KEY not set” stub | Key missing/wrong in `backend/.env`; restart backend |
| Stub even with a key | Restart backend after editing `.env`. Keys may start with `AQ.` or `AIza` |
| Review not in Table Editor | Must be **logged in**; `reviews` table must exist (`schema.sql`); restart backend |
| Trip save 500 | Not logged in with real Supabase user, or `trips` table missing |
| Auth still “demo” | Set `ALLOW_DEMO_AUTH=false` and restart backend |
