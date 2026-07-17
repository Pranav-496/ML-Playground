from fastapi import APIRouter
from pydantic import BaseModel

from app.services.classification import train_logistic_regression, train_knn, train_decision_tree

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


class DecisionTreeRequest(BaseModel):
    """Request body for Decision Tree training."""
    n_samples: int = 200
    noise: float = 1.5
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "moons"
    criterion: str = "gini"
    splitter: str = "best"
    max_depth: int | None = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    max_features: str | None = None
    max_leaf_nodes: int | None = None
    min_impurity_decrease: float = 0.0


@router.post("/decision-tree")
async def decision_tree(request: DecisionTreeRequest):
    """Train a Decision Tree model and return results."""
    result = train_decision_tree(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        criterion=request.criterion,
        splitter=request.splitter,
        max_depth=request.max_depth,
        min_samples_split=request.min_samples_split,
        min_samples_leaf=request.min_samples_leaf,
        max_features=request.max_features,
        max_leaf_nodes=request.max_leaf_nodes,
        min_impurity_decrease=request.min_impurity_decrease,
    )
    return result


@router.get("/")
async def classification_root():
    return {"message": "Classification endpoints", "algorithms": ["logistic", "knn", "decision-tree"]}
