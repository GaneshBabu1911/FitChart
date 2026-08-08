Deploying to Vercel
===================

This project is prepared to deploy the frontend to Vercel. The FastAPI backend is not converted to Vercel serverless functions in this change — deploy it separately (Render, Fly, Railway, or a Render/Heroku server).

Frontend (Vercel)
------------------
1. Go to https://vercel.com/new and import the repository `GaneshBabu1911/FitChart`.
2. During import, Vercel should detect the `frontend/package.json`. If needed, set:

  - Framework Preset: Other
  - Build Command: `npm install && npm run build`
  - Output Directory: `dist`

3. Set an Environment Variable on Vercel (Project Settings → Environment Variables):

  - `VITE_API_URL` = `https://<your-backend-url>` (point to your backend service URL)

4. Deploy. Your frontend will be available at the Vercel assigned URL.

Backend options
---------------
- Quick: continue hosting the backend on Render or another host and point `VITE_API_URL` to it.
- Advanced: convert FastAPI to serverless Python functions for Vercel (requires restructuring and testing). I can help if you want to pursue this.
