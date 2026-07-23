from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.regression import (
    train_linear_regression, 
    train_linear_regression_gd,
    train_polynomial_regression,
    train_ridge_regression,
    train_lasso_regression,
    train_elasticnet_regression,
    train_knn_regression,
    train_svr,
    train_decision_tree_regression,
    compute_regularization_path,
    compute_bias_variance_curve,
    compute_learning_curve,
)

router = APIRouter()


class LinearRegressionRequest(BaseModel):
    """Request body for linear regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    fit_intercept: bool = True
    dataset_type: str = "linear"
    positive: bool = False


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


class LassoRegressionRequest(BaseModel):
    """Request body for lasso regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    degree: int = 15
    alpha: float = 1.0
    fit_intercept: bool = True


class ElasticNetRegressionRequest(BaseModel):
    """Request body for elastic net regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    degree: int = 15
    alpha: float = 1.0
    l1_ratio: float = 0.5
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
        dataset_type=request.dataset_type,
        positive=request.positive,
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


@router.post("/lasso")
async def lasso_regression(request: LassoRegressionRequest):
    """Train a lasso regression model and return results."""
    result = train_lasso_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        degree=request.degree,
        alpha=request.alpha,
        fit_intercept=request.fit_intercept,
    )
    return result


class KnnRegressionRequest(BaseModel):
    """Request body for KNN regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "linear"
    n_neighbors: int = 5
    weights: str = "uniform"
    p: int = 2
    algorithm: str = "auto"
    leaf_size: int = 30
    metric: str = "minkowski"

@router.post("/elastic-net")
async def elasticnet_regression(request: ElasticNetRegressionRequest):
    """Train an elastic net regression model and return results."""
    result = train_elasticnet_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        degree=request.degree,
        alpha=request.alpha,
        l1_ratio=request.l1_ratio,
        fit_intercept=request.fit_intercept,
    )
    return result

@router.post("/knn")
async def knn_regression(request: KnnRegressionRequest):
    """Train a KNN regression model and return results."""
    result = train_knn_regression(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        dataset_type=request.dataset_type,
        n_neighbors=request.n_neighbors,
        weights=request.weights,
        p=request.p,
        algorithm=request.algorithm,
        leaf_size=request.leaf_size,
        metric=request.metric,
    )
    return result


# ─── Interactive Analysis Endpoints ───────────────────────────

class RegularizationPathRequest(BaseModel):
    n_samples: int = 100
    noise: float = 10.0
    random_state: int = 42
    degree: int = 10
    model_type: str = "ridge"
    n_alphas: int = 50
    alpha_max: float = 100.0


class BiasVarianceRequest(BaseModel):
    n_samples: int = 100
    noise: float = 10.0
    random_state: int = 42
    test_size: float = 0.2
    sweep_param: str = "degree"
    model_type: str = "polynomial"
    alpha: float = 1.0


class LearningCurveRequest(BaseModel):
    noise: float = 10.0
    random_state: int = 42
    test_size: float = 0.2
    degree: int = 3
    alpha: float = 1.0
    model_type: str = "polynomial"
    max_samples: int = 300


@router.post("/regularization-path")
async def regularization_path(request: RegularizationPathRequest):
    """Compute how coefficients change as alpha increases."""
    return compute_regularization_path(
        n_samples=request.n_samples,
        noise=request.noise,
        random_state=request.random_state,
        degree=request.degree,
        model_type=request.model_type,
        n_alphas=request.n_alphas,
        alpha_max=request.alpha_max,
    )


@router.post("/bias-variance")
async def bias_variance(request: BiasVarianceRequest):
    """Compute train/test error as degree or alpha sweeps."""
    return compute_bias_variance_curve(
        n_samples=request.n_samples,
        noise=request.noise,
        random_state=request.random_state,
        test_size=request.test_size,
        sweep_param=request.sweep_param,
        model_type=request.model_type,
        alpha=request.alpha,
    )


@router.post("/learning-curve")
async def learning_curve(request: LearningCurveRequest):
    """Compute how error changes as training set size grows."""
    return compute_learning_curve(
        noise=request.noise,
        random_state=request.random_state,
        test_size=request.test_size,
        degree=request.degree,
        alpha=request.alpha,
        model_type=request.model_type,
        max_samples=request.max_samples,
    )


class SvrRequest(BaseModel):
    """Request body for SVR training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    C: float = 1.0
    kernel: str = "rbf"
    gamma: str = "scale"
    epsilon: float = 0.1
    degree: int = 3


@router.post("/svr")
async def svr(request: SvrRequest):
    """Train an SVR model and return results."""
    result = train_svr(
        n_samples=request.n_samples,
        noise=request.noise,
        test_size=request.test_size,
        random_state=request.random_state,
        C=request.C,
        kernel=request.kernel,
        gamma=request.gamma,
        epsilon=request.epsilon,
        degree=request.degree,
    )
    return result


@router.get("/")
async def regression_root():
    return {"message": "Regression endpoints", "algorithms": ["linear", "linear-gd", "polynomial", "ridge", "lasso", "elastic-net", "knn", "svr", "decision-tree"]}


class DecisionTreeRegressionRequest(BaseModel):
    """Request body for Decision Tree regression training."""
    n_samples: int = 100
    noise: float = 10.0
    test_size: float = 0.2
    random_state: int = 42
    dataset_type: str = "quadratic"
    criterion: str = "squared_error"
    splitter: str = "best"
    max_depth: int | None = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    max_features: str | None = None
    max_leaf_nodes: int | None = None
    min_impurity_decrease: float = 0.0


@router.post("/decision-tree")
async def decision_tree_regression(request: DecisionTreeRegressionRequest):
    """Train a Decision Tree regression model and return results."""
    result = train_decision_tree_regression(
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
