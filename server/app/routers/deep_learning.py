from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Tuple, Optional

from app.services.deep_learning import train_mlp_classifier, train_mlp_regressor

router = APIRouter()

class MLPClassifierRequest(BaseModel):
    n_samples: int = 300
    noise: float = 0.2
    dataset_type: str = "moons"
    hidden_layer_sizes: List[int] = [100]
    activation: str = "relu"
    solver: str = "adam"
    alpha: float = 0.0001
    learning_rate_init: float = 0.001
    max_iter: int = 500
    random_state: int = 42
    mesh_resolution: int = 50

class MLPRegressorRequest(BaseModel):
    n_samples: int = 100
    noise: float = 0.1
    dataset_type: str = "sine"
    hidden_layer_sizes: List[int] = [100]
    activation: str = "relu"
    solver: str = "adam"
    alpha: float = 0.0001
    learning_rate_init: float = 0.001
    max_iter: int = 500
    random_state: int = 42

@router.post("/mlp-classifier")
async def run_mlp_classifier(req: MLPClassifierRequest):
    return train_mlp_classifier(
        n_samples=req.n_samples,
        noise=req.noise,
        dataset_type=req.dataset_type,
        hidden_layer_sizes=tuple(req.hidden_layer_sizes),
        activation=req.activation,
        solver=req.solver,
        alpha=req.alpha,
        learning_rate_init=req.learning_rate_init,
        max_iter=req.max_iter,
        random_state=req.random_state,
        mesh_resolution=req.mesh_resolution
    )

@router.post("/mlp-regressor")
async def run_mlp_regressor(req: MLPRegressorRequest):
    return train_mlp_regressor(
        n_samples=req.n_samples,
        noise=req.noise,
        dataset_type=req.dataset_type,
        hidden_layer_sizes=tuple(req.hidden_layer_sizes),
        activation=req.activation,
        solver=req.solver,
        alpha=req.alpha,
        learning_rate_init=req.learning_rate_init,
        max_iter=req.max_iter,
        random_state=req.random_state
    )
