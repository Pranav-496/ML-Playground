from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.regression import (
    train_linear_regression, 
    train_linear_regression_gd,
    train_polynomial_regression,
    train_ridge_regression
)

router = APIRouter()


class LinearRegressionRequest(BaseModel):
    """Request body for linear regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    fit_intercept: bool = True


class PolynomialRegressionRequest(BaseModel):
    """Request body for polynomial regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    degree: int = 2
    fit_intercept: bool = True


class RidgeRegressionRequest(BaseModel):
    """Request body for ridge regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    degree: int = 15
    alpha: float = 1.0
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


@router.post("/polynomial")
async def polynomial_regression(request: PolynomialRegressionRequest):
    """Train a polynomial regression model and return results."""
    result = train_polynomial_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        degree=request.degree,
        fit_intercept=request.fit_intercept,
    )
    return result


@router.post("/ridge")
async def ridge_regression(request: RidgeRegressionRequest):
    """Train a ridge regression model and return results."""
    result = train_ridge_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        degree=request.degree,
        alpha=request.alpha,
        fit_intercept=request.fit_intercept,
    )
    return result


@router.get("/")
async def regression_root():
    return {"message": "Regression endpoints", "algorithms": ["linear", "linear-gd"]}

