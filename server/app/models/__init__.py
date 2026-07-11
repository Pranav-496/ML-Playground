"""Pydantic schemas for API request/response models"""

from pydantic import BaseModel
from typing import Optional


class TrainRequest(BaseModel):
    """Base request schema for training any algorithm."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42


class RegressionMetrics(BaseModel):
    """Response metrics for regression algorithms."""
    r2_score: float
    mse: float
    rmse: float
    mae: float


class PlotData(BaseModel):
    """Data points for visualization."""
    x_train: list
    y_train: list
    x_test: list
    y_test: list
    x_line: list
    y_line: list


class RegressionResponse(BaseModel):
    """Standard response for regression endpoints."""
    metrics: RegressionMetrics
    plot_data: PlotData
    equation: Optional[str] = None
    coefficients: Optional[list] = None
    intercept: Optional[float] = None
    model_params: Optional[dict] = None
