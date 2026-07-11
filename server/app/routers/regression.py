from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.regression import train_linear_regression

router = APIRouter()


class LinearRegressionRequest(BaseModel):
    """Request body for linear regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    fit_intercept: bool = True


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


@router.get("/")
async def regression_root():
    return {"message": "Regression endpoints", "algorithms": ["linear"]}
