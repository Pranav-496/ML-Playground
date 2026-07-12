from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.regression import train_linear_regression, train_linear_regression_gd

router = APIRouter()


class LinearRegressionRequest(BaseModel):
    """Request body for linear regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    fit_intercept: bool = True


class LinearRegressionGDRequest(BaseModel):
    """Request body for gradient descent linear regression."""
    n_samples: int = 100
    noise: float = 10.0
    learning_rate: float = 0.01
    epochs: int = 100
    gd_type: str = "batch"
    batch_size: int = 32
    random_state: int = 42


@router.post("/linear")
async def linear_regression(request: LinearRegressionRequest):
    """Train a linear regression model and return results."""
    result = train_linear_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        fit_intercept=request.fit_intercept,
    )
    return result


@router.post("/linear-gd")
async def linear_regression_gd(request: LinearRegressionGDRequest):
    """Train linear regression using gradient descent and return visualisation data."""
    result = train_linear_regression_gd(
        n_samples=request.n_samples,
        noise=request.noise,
        learning_rate=request.learning_rate,
        epochs=request.epochs,
        gd_type=request.gd_type,
        batch_size=request.batch_size,
        random_state=request.random_state,
    )
    return result


@router.get("/")
async def regression_root():
    return {"message": "Regression endpoints", "algorithms": ["linear", "linear-gd"]}

