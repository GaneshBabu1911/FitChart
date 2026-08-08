Deploying this project to Render
=================================

Overview
--------
This repository contains a FastAPI backend (`backend/`) and a Vite React frontend (`frontend/`). Use Render to host the backend as a Web Service and the frontend as a Static Site.

Steps
-----
1. Push this repo to GitHub (or Git provider) and note the repository URL.
2. In Render dashboard, "New +" → "Import from Git" and connect your repository.
3. The included `render.yaml` defines two services. If Render doesn't auto-detect, create two services manually:

  - Backend (Web Service)
    - Root Directory: `backend`
    - Environment: `Python 3.11` (recommended)
    - Build Command: `pip install --upgrade pip setuptools wheel && pip install numpy==1.26.4 pandas==2.2.2 && pip install -r requirements.txt --no-deps`
    - Note: This installs `numpy` and `pandas` first (binary wheels) to avoid building pandas from source on Render.
    - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

  - Frontend (Static Site)
    - Root Directory: `frontend`
    - Build Command: `npm install && npm run build`
    - Publish Directory: `frontend/dist`

4. After creating frontend, set an environment variable on the frontend service:
   - `VITE_API_URL` = backend service URL (e.g. `https://fit-chart-backend.onrender.com`)

5. Trigger deploys for both services and verify:
   - Backend health: `https://<backend-service>.onrender.com/docs`
   - Frontend: visit the frontend URL provided by Render

Local testing
-------------
If you want to test the production build locally before deploying:

```bash
cd frontend
npm install
npm run build
npx serve dist
```

Notes
-----
- The `render.yaml` file is provided to support Render's spec-based deploys; you can also create services manually in the Render dashboard.
- If you prefer a single full-stack deploy (backend and frontend together), Render can serve both but you'll still need to configure `VITE_API_URL` to point to the backend URL.

Troubleshooting pandas build failures
-----------------------------------
- If you see errors like "ninja: build stopped" or "metadata-generation-failed" for `pandas`, it's usually because Render's Python runtime is newer than prebuilt pandas wheels or build tools are missing.
- Recommended fixes:
  - Use Python 3.11 as the service runtime (wheels are widely available).
  - Install `numpy` and wheel/build tools before `pip install -r requirements.txt` (see build command above).
  - Optionally pin a pandas wheel-compatible version in `backend/requirements.txt` (e.g., a pandas release that has manylinux wheels for your Python version).