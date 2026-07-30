"""Battle Arena API routes — compare algorithms head-to-head."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.battle import run_battle, ALGORITHM_REGISTRY

router = APIRouter()


class CompetitorSpec(BaseModel):
    """A single competitor in the battle."""
    algorithm: str
    params: dict = {}


class BattleRequest(BaseModel):
    """Request body for the Battle Arena."""
    dataset_type: str = "moons"
    n_samples: int = 300
    noise: float = 1.5
    random_state: int = 42
    test_size: float = 0.2
    competitors: list[CompetitorSpec]


@router.post("/run")
async def battle(request: BattleRequest):
    """Run a head-to-head battle between multiple classifiers."""
    competitors = [
        {"algorithm": c.algorithm, "params": c.params}
        for c in request.competitors
    ]
    result = run_battle(
        dataset_type=request.dataset_type,
        n_samples=request.n_samples,
        noise=request.noise,
        random_state=request.random_state,
        test_size=request.test_size,
        competitors=competitors,
    )
    return result


@router.get("/algorithms")
async def list_battle_algorithms():
    """Return the list of algorithms available for battle."""
    return {
        "algorithms": [
            {"id": algo_id, "name": entry["name"]}
            for algo_id, entry in ALGORITHM_REGISTRY.items()
        ]
    }
