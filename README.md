# Airbnb Clone — React + Node/Express + SQLite (MVP)

A minimal, **React-first** Airbnb-style booking app. Uses an **Express** API and **SQLite** for persistence (no MongoDB required).

## Quick Start
### API
```bash
cd server && npm i && npm run dev
```
### Client
```bash
cd client && npm i && npm run dev
```
- API: http://localhost:4000
- Client: http://localhost:5173


## Deploying
- **API (server/):** deploy to Render/Railway/Fly. Set env:
  - `JWT_SECRET`
  - `ALLOWED_ORIGINS` = `http://localhost:5173,https://<username>.github.io,https://<username>.github.io/<repo>/`
- **Client (client/):** this repo includes **GitHub Pages** workflow at `.github/workflows/deploy-client.yml`.
  - In repo: **Settings → Pages → Source: GitHub Actions**.
  - Add repository secret **VITE_API_URL** pointing to your deployed API URL (e.g., `https://your-api.onrender.com`).
  - Push to `main` → site published at `https://<username>.github.io/<repo>/`.

Vite's `base` is set from `BASE_PATH` (computed automatically by the workflow) and a `404.html` fallback is created for React Router.
