"""
main.py - FastAPI application entry point for Fit Chart Generator.
Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

import models
from database import engine
from routers import products, fit_chart, recommend


# ─────────────────────────────────────────
# Startup / Shutdown lifecycle
# ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    # Create all tables
    models.Base.metadata.create_all(bind=engine)

    # Ensure uploads directory exists
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    print("[OK] Fit Chart Generator API is ready!")
    print("[DOCS] Swagger docs: http://localhost:8000/docs")

    yield  # App runs here

    print("[BYE] Shutting down...")


# ─────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────

app = FastAPI(
    title="Fit Chart Generator API",
    description="""
## 👕 Fit Chart Generator

AI-powered size chart generator for apparel sellers.

### Features
- **Seller Dashboard**: Upload garments, generate dynamic size charts
- **Customer AI**: Get personalized size recommendations with confidence scores
- **Image Analysis**: OpenCV-powered garment feature extraction
- **ML Model**: KNN-based size prediction trained on real body measurements

### User Roles
- **Seller**: Upload products → Generate fit charts
- **Customer**: Enter measurements → Get size recommendation
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# ─────────────────────────────────────────
# CORS — allow frontend (React dev server)
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite dev server
        "http://localhost:3000",    # Alt React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Static files — serve uploaded garment images
# ─────────────────────────────────────────

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ─────────────────────────────────────────
# Routers
# ─────────────────────────────────────────

app.include_router(products.router)
app.include_router(fit_chart.router)
app.include_router(recommend.router)


# ─────────────────────────────────────────
# Health check & root
# ─────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "👕 Fit Chart Generator API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ─────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
