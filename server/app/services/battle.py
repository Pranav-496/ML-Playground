"""Battle Arena service — train multiple algorithms on the same dataset and compare."""

import time
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.utils.data_generation import generate_classification_data


# ─── Supported Algorithms ─────────────────────────────────────────

ALGORITHM_REGISTRY = {
    "logistic-regression": {
        "name": "Logistic Regression",
        "builder": lambda params: LogisticRegression(
            C=params.get("C", 1.0),
            max_iter=200,
            random_state=params.get("random_state", 42),
        ),
    },
    "knn": {
        "name": "K-Nearest Neighbors",
        "builder": lambda params: KNeighborsClassifier(
            n_neighbors=params.get("n_neighbors", 5),
            weights=params.get("weights", "uniform"),
        ),
    },
    "decision-tree": {
        "name": "Decision Tree",
        "builder": lambda params: DecisionTreeClassifier(
            max_depth=params.get("max_depth", None) or None,
            criterion=params.get("criterion", "gini"),
            random_state=params.get("random_state", 42),
        ),
    },
    "svm": {
        "name": "Support Vector Machine",
        "builder": lambda params: SVC(
            kernel=params.get("kernel", "rbf"),
            C=params.get("C", 1.0),
            gamma=params.get("gamma", "scale"),
            random_state=params.get("random_state", 42),
        ),
    },
    "gaussian-nb": {
        "name": "Gaussian Naive Bayes",
        "builder": lambda _params: GaussianNB(),
    },
    "random-forest": {
        "name": "Random Forest",
        "builder": lambda params: RandomForestClassifier(
            n_estimators=params.get("n_estimators", 100),
            max_depth=params.get("max_depth", None) or None,
            random_state=params.get("random_state", 42),
            n_jobs=-1,
        ),
    },
    "gradient-boosting": {
        "name": "Gradient Boosting",
        "builder": lambda params: GradientBoostingClassifier(
            n_estimators=params.get("n_estimators", 100),
            learning_rate=params.get("learning_rate", 0.1),
            max_depth=params.get("max_depth", 3) or 3,
            random_state=params.get("random_state", 42),
        ),
    },
}


def run_battle(
    dataset_type: str = "moons",
    n_samples: int = 300,
    noise: float = 1.5,
    random_state: int = 42,
    test_size: float = 0.2,
    competitors: list[dict] | None = None,
) -> dict:
    """Train multiple classifiers on the same dataset and return comparison data.

    Args:
        dataset_type: Shape of the synthetic dataset.
        n_samples: Number of data points.
        noise: Cluster spread / noise level.
        random_state: Random seed for reproducibility.
        test_size: Fraction held out for testing.
        competitors: List of dicts like [{"algorithm": "svm", "params": {"C": 1.0}}, ...]

    Returns:
        Dict with shared dataset info and per-competitor results.
    """
    if not competitors or len(competitors) < 2:
        raise ValueError("At least 2 competitors are required for a battle.")
    if len(competitors) > 3:
        raise ValueError("Maximum 3 competitors allowed.")

    # Generate a shared dataset
    X, y = generate_classification_data(
        n_samples=n_samples,
        n_features=2,
        n_classes=2,
        random_state=random_state,
        cluster_std=noise,
        dataset_type=dataset_type,
    )

    # Same train-test split for all competitors
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    # Shared meshgrid for decision boundaries
    mesh_resolution = 50
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, mesh_resolution),
        np.linspace(y_min, y_max, mesh_resolution),
    )
    grid_points = np.c_[xx.ravel(), yy.ravel()]

    # Shared dataset response
    shared_data = {
        "x_train": X_train.tolist(),
        "y_train": y_train.tolist(),
        "x_test": X_test.tolist(),
        "y_test": y_test.tolist(),
        "x_min": float(x_min),
        "x_max": float(x_max),
        "y_min": float(y_min),
        "y_max": float(y_max),
        "xx": xx.tolist(),
        "yy": yy.tolist(),
    }

    # Train each competitor
    results = []
    for comp in competitors:
        algo_id = comp.get("algorithm", "")
        algo_params = comp.get("params", {})

        if algo_id not in ALGORITHM_REGISTRY:
            results.append({
                "algorithm": algo_id,
                "name": algo_id,
                "error": f"Unknown algorithm: {algo_id}",
            })
            continue

        registry_entry = ALGORITHM_REGISTRY[algo_id]
        algo_params["random_state"] = random_state

        try:
            model = registry_entry["builder"](algo_params)

            # Time the training
            start_time = time.perf_counter()
            model.fit(X_train, y_train)
            train_time = time.perf_counter() - start_time

            # Time the prediction
            start_time = time.perf_counter()
            y_pred = model.predict(X_test)
            predict_time = time.perf_counter() - start_time

            # Metrics
            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred, average="macro", zero_division=0)),
                "recall": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
                "f1_score": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
            }

            # Decision boundary
            Z = model.predict(grid_points).reshape(xx.shape)

            results.append({
                "algorithm": algo_id,
                "name": registry_entry["name"],
                "metrics": metrics,
                "z": Z.tolist(),
                "train_time_ms": round(train_time * 1000, 2),
                "predict_time_ms": round(predict_time * 1000, 2),
                "error": None,
            })

        except Exception as e:
            results.append({
                "algorithm": algo_id,
                "name": registry_entry["name"],
                "error": str(e),
            })

    # Determine winner by accuracy
    valid_results = [r for r in results if r.get("metrics")]
    winner = None
    if valid_results:
        winner = max(valid_results, key=lambda r: r["metrics"]["accuracy"])["algorithm"]

    return {
        "dataset": shared_data,
        "competitors": results,
        "winner": winner,
        "dataset_type": dataset_type,
        "n_samples": n_samples,
    }
