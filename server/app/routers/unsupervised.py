"""Unsupervised algorithm API routes — PCA, DBSCAN, K-Means."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.unsupervised import train_pca, train_dbscan, train_kmeans

router = APIRouter()


# ─── PCA ─────────────────────────────────────────────────────────

class PcaRequest(BaseModel):
    """Request body for PCA."""
    n_samples: int = 300
    noise: float = 1.0
    random_state: int = 42
    dataset_type: str = "blobs_3d"
    n_components: int = 2


@router.post("/pca")
async def pca(request: PcaRequest):
    """Perform PCA and return projections + variance info."""
    return train_pca(
        n_samples=request.n_samples,
        noise=request.noise,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_components=request.n_components,
    )


# ─── DBSCAN ──────────────────────────────────────────────────────

class DbscanRequest(BaseModel):
    """Request body for DBSCAN clustering."""
    n_samples: int = 300
    noise: float = 1.0
    random_state: int = 42
    dataset_type: str = "moons"
    eps: float = 0.3
    min_samples: int = 5
    n_centers: int = 3


@router.post("/dbscan")
async def dbscan(request: DbscanRequest):
    """Perform DBSCAN clustering."""
    return train_dbscan(
        n_samples=request.n_samples,
        noise=request.noise,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        eps=request.eps,
        min_samples=request.min_samples,
        n_centers=request.n_centers,
    )


# ─── K-Means ─────────────────────────────────────────────────────

class KmeansRequest(BaseModel):
    """Request body for K-Means clustering."""
    n_samples: int = 300
    noise: float = 1.0
    random_state: int = 42
    dataset_type: str = "blobs"
    n_clusters: int = 3
    max_iter: int = 300
    init: str = "k-means++"
    n_init: int = 10


@router.post("/kmeans")
async def kmeans(request: KmeansRequest):
    """Perform K-Means clustering."""
    return train_kmeans(
        n_samples=request.n_samples,
        noise=request.noise,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_clusters=request.n_clusters,
        max_iter=request.max_iter,
        init=request.init,
        n_init=request.n_init,
    )
