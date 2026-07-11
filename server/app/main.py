from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import regression, classification, clustering

app = FastAPI(
    title="ML Playground API",
    description="Interactive Machine Learning Playground Backend",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(regression.router, prefix="/api/regression", tags=["Regression"])
app.include_router(classification.router, prefix="/api/classification", tags=["Classification"])
app.include_router(clustering.router, prefix="/api/clustering", tags=["Clustering"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "ML Playground API is running"}
