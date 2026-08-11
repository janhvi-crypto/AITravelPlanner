# AI Travel Planner

| Folder | Deploy as |
|---|---|
| `frontend/` | Vercel / Netlify / Lovable |
| `backend/` | Render / Railway / Fly.io |

`backend/` merges:

- **auth** — Supabase login (`/auth/*`)
- **feature-trip** — trip CRUD + generate/pdf routes (`/trip/*`)
- **member-3 / main** — Gemini AI + OpenWeather (`/weather`, AI services)

Advanced ESM drafts from member-3 live in `backend/reference/member3-esm/` (not loaded at runtime).

## Run

```bash
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

Set `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Deploy

1. **Backend (Render Web Service)** — root dir `backend`, start `npm start`, add env from `.env.example`
2. **Frontend (Vercel)** — root dir `frontend`, set `VITE_API_BASE_URL` to the Render URL
3. Supabase → Auth → Email → disable “Confirm email” while developing
