import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import regression, classification, clustering, ensemble, battle, unsupervised, auth
from app.database import engine, Base

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ML Playground API",
    description="Interactive Machine Learning Playground Backend",
    version="1.0.0",
)

# CORS — allow the Vite dev server and production frontend
raw_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
# Fix common user error: remove trailing slash if they added one
frontend_url = raw_frontend_url.rstrip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(regression.router, prefix="/api/regression", tags=["Regression"])
app.include_router(classification.router, prefix="/api/classification", tags=["Classification"])
app.include_router(clustering.router, prefix="/api/clustering", tags=["Clustering"])
app.include_router(ensemble.router, prefix="/api/ensemble", tags=["Ensemble"])
app.include_router(battle.router, prefix="/api/battle", tags=["Battle Arena"])
app.include_router(unsupervised.router, prefix="/api/unsupervised", tags=["Unsupervised"])


@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"status": "healthy", "message": "Valoris ML Backend is active"}


@app.api_route("/api/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy", "message": "ML Playground API is running"}
