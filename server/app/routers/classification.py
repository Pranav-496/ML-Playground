from fastapi import APIRouter
from pydantic import BaseModel

from app.services.classification import train_logistic_regression, train_knn

router = APIRouter()


class LogisticRegressionRequest(BaseModel):
    """Request body for logistic regression training."""
    n_samples: int = 200
    noise: float = 1.5
    test_size: float = 0.2
    random_state: int = 42
    C: float = 1.0
    penalty: str = "l2"
    solver: str = "lbfgs"
    max_iter: int = 100


@router.post("/logistic")
async def logistic_regression(request: LogisticRegressionRequest):
    """Train a logistic regression model and return results."""
    result = train_logistic_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        C=request.C,
        penalty=request.penalty,
        solver=request.solver,
        max_iter=request.max_iter,
    )
    return result


class KnnRequest(BaseModel):
    """Request body for K-Nearest Neighbors training."""
    n_samples: int = 200
    noise: float = 1.5
    test_size: float = 0.2
    random_state: int = 42
    n_neighbors: int = 5
    weights: str = "uniform"
    p: int = 2


@router.post("/knn")
async def knn(request: KnnRequest):
    """Train a KNN model and return results."""
    result = train_knn(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        n_neighbors=request.n_neighbors,
        weights=request.weights,
        p=request.p,
    )
    return result


@router.get("/")
async def classification_root():
    return {"message": "Classification endpoints", "algorithms": ["logistic", "knn"]}
