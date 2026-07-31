"""Ensemble algorithm API routes — Random Forest, Gradient Boosting."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ensemble import (
    train_random_forest_classifier,
    train_random_forest_regressor,
    train_gradient_boosting_classifier,
    train_gradient_boosting_regressor,
)

router = APIRouter()


# ─── Random Forest Classifier ────────────────────────────────────

class RandomForestClassifierRequest(BaseModel):
    """Request body for Random Forest Classifier training."""
    n_samples: int = 200
    noise: float = 1.5
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "moons"
    n_estimators: int = 100
    criterion: str = "gini"
    max_depth: int | None = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    max_features: str = "sqrt"
    bootstrap: bool = True


@router.post("/random-forest/classify")
async def random_forest_classifier(request: RandomForestClassifierRequest):
    """Train a Random Forest Classifier and return results."""
    result = train_random_forest_classifier(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_estimators=request.n_estimators,
        criterion=request.criterion,
        max_depth=request.max_depth,
        min_samples_split=request.min_samples_split,
        min_samples_leaf=request.min_samples_leaf,
        max_features=request.max_features,
        bootstrap=request.bootstrap,
    )
    return result


# ─── Random Forest Regressor ─────────────────────────────────────

class RandomForestRegressorRequest(BaseModel):
    """Request body for Random Forest Regressor training."""
    n_samples: int = 200
    noise: float = 15.0
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "sinusoidal"
    n_estimators: int = 100
    criterion: str = "squared_error"
    max_depth: int | None = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    max_features: str = "sqrt"
    bootstrap: bool = True


@router.post("/random-forest/regress")
async def random_forest_regressor(request: RandomForestRegressorRequest):
    """Train a Random Forest Regressor and return results."""
    result = train_random_forest_regressor(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_estimators=request.n_estimators,
        criterion=request.criterion,
        max_depth=request.max_depth,
        min_samples_split=request.min_samples_split,
        min_samples_leaf=request.min_samples_leaf,
        max_features=request.max_features,
        bootstrap=request.bootstrap,
    )
    return result


# ─── Gradient Boosting Classifier ────────────────────────────────

class GradientBoostingRequest(BaseModel):
    """Request body for Gradient Boosting Classifier training."""
    n_samples: int = 200
    noise: float = 1.5
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "moons"
    n_estimators: int = 100
    learning_rate: float = 0.1
    max_depth: int = 3
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    subsample: float = 1.0
    max_features: str | None = None


@router.post("/gradient-boosting/classify")
async def gradient_boosting_classifier(request: GradientBoostingRequest):
    """Train a Gradient Boosting Classifier and return results."""
    result = train_gradient_boosting_classifier(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_estimators=request.n_estimators,
        learning_rate=request.learning_rate,
        max_depth=request.max_depth,
        min_samples_split=request.min_samples_split,
        min_samples_leaf=request.min_samples_leaf,
        subsample=request.subsample,
        max_features=request.max_features,
    )
    return result


# ─── Gradient Boosting Regressor ─────────────────────────────────

class GradientBoostingRegressorRequest(BaseModel):
    """Request body for Gradient Boosting Regressor training."""
    n_samples: int = 100
    noise: float = 0.1
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "sine"
    n_estimators: int = 100
    learning_rate: float = 0.1
    max_depth: int = 3
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    subsample: float = 1.0
    max_features: str | None = None
    loss: str = "squared_error"


@router.post("/gradient-boosting/regress")
async def gradient_boosting_regressor(request: GradientBoostingRegressorRequest):
    """Train a Gradient Boosting Regressor and return results."""
    result = train_gradient_boosting_regressor(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_estimators=request.n_estimators,
        learning_rate=request.learning_rate,
        max_depth=request.max_depth,
        min_samples_split=request.min_samples_split,
        min_samples_leaf=request.min_samples_leaf,
        subsample=request.subsample,
        max_features=request.max_features,
        loss=request.loss,
    )
    return result
