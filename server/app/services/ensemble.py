"""Ensemble algorithm services — Random Forest, Gradient Boosting, etc."""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    r2_score, mean_squared_error, mean_absolute_error,
)

from app.utils.data_generation import generate_classification_data, generate_regression_data


# ─── Shared Classification Helper ────────────────────────────────

def _evaluate_classifier(
    model,
    X: np.ndarray,
    y: np.ndarray,
    test_size: float = 0.2,
    random_state: int = 42,
    mesh_resolution: int = 50,
    extras_fn=None,
) -> dict:
    """Shared evaluation pipeline for ensemble classifiers."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="macro", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
    }

    # Decision boundary meshgrid
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, mesh_resolution),
        np.linspace(y_min, y_max, mesh_resolution),
    )
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    plot_data = {
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
        "z": Z.tolist(),
    }

    result = {
        "metrics": metrics,
        "plot_data": plot_data,
        "model_params": model.get_params(),
    }

    if extras_fn:
        result.update(extras_fn(model, X_train, X_test, y_train, y_test))

    return result


# ─── Shared Regression Helper ────────────────────────────────────

def _evaluate_regressor(
    model,
    X: np.ndarray,
    y: np.ndarray,
    test_size: float = 0.2,
    random_state: int = 42,
    extras_fn=None,
) -> dict:
    """Shared evaluation pipeline for ensemble regressors."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model.fit(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    metrics = {
        "r2_score": float(r2_score(y_test, y_test_pred)),
        "mse": float(mean_squared_error(y_test, y_test_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_test_pred))),
        "mae": float(mean_absolute_error(y_test, y_test_pred)),
    }

    # Build prediction line over full range
    x_flat_train = X_train.ravel()
    x_flat_test = X_test.ravel()
    x_all = np.concatenate([x_flat_train, x_flat_test])
    x_line = np.linspace(x_all.min(), x_all.max(), 300).reshape(-1, 1)
    y_line = model.predict(x_line)

    # Residuals
    residuals_train = (y_train - y_train_pred).tolist()
    residuals_test = (y_test - y_test_pred).tolist()

    plot_data = {
        "x_train": x_flat_train.tolist(),
        "y_train": y_train.tolist(),
        "x_test": x_flat_test.tolist(),
        "y_test": y_test.tolist(),
        "x_line": x_line.ravel().tolist(),
        "y_line": y_line.tolist(),
        "y_train_pred": y_train_pred.tolist(),
        "y_test_pred": y_test_pred.tolist(),
        "residuals_train": residuals_train,
        "residuals_test": residuals_test,
    }

    result = {
        "metrics": metrics,
        "plot_data": plot_data,
        "model_params": model.get_params(),
    }

    if extras_fn:
        result.update(extras_fn(model, X_train, X_test, y_train, y_test))

    return result


# ─── Random Forest Classifier ────────────────────────────────────

def train_random_forest_classifier(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "moons",
    n_estimators: int = 100,
    criterion: str = "gini",
    max_depth: int | None = None,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    max_features: str = "sqrt",
    bootstrap: bool = True,
) -> dict:
    """Train a Random Forest Classifier and return results and plot data."""
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = RandomForestClassifier(
        n_estimators=n_estimators,
        criterion=criterion,
        max_depth=max_depth if max_depth and max_depth > 0 else None,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        max_features=max_features if max_features != "none" else None,
        bootstrap=bootstrap,
        oob_score=bootstrap,  # Only available when bootstrap=True
        random_state=random_state,
        n_jobs=-1,
    )

    def extras(m, X_train, X_test, y_train, y_test):
        """Extract feature importances and OOB score."""
        feature_importances = m.feature_importances_.tolist()
        oob = float(m.oob_score_) if hasattr(m, "oob_score_") and m.bootstrap else None

        # Get individual tree decision boundaries (first 3 estimators for visualization)
        individual_boundaries = []
        mesh_resolution = 40
        x_min, x_max = X_train[:, 0].min() - 1, X_train[:, 0].max() + 1
        y_min, y_max = X_train[:, 1].min() - 1, X_train[:, 1].max() + 1
        xx, yy = np.meshgrid(
            np.linspace(x_min, x_max, mesh_resolution),
            np.linspace(y_min, y_max, mesh_resolution),
        )
        grid_points = np.c_[xx.ravel(), yy.ravel()]

        for i, tree in enumerate(m.estimators_[:min(3, len(m.estimators_))]):
            Z_tree = tree.predict(grid_points).reshape(xx.shape)
            individual_boundaries.append({
                "tree_index": i,
                "z": Z_tree.tolist(),
            })

        return {
            "feature_importances": feature_importances,
            "oob_score": oob,
            "n_estimators_actual": len(m.estimators_),
            "individual_boundaries": individual_boundaries,
            "individual_xx": xx.tolist(),
            "individual_yy": yy.tolist(),
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )


# ─── Random Forest Regressor ─────────────────────────────────────

def train_random_forest_regressor(
    n_samples: int = 200,
    noise: float = 15.0,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "sinusoidal",
    n_estimators: int = 100,
    criterion: str = "squared_error",
    max_depth: int | None = None,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    max_features: str = "sqrt",
    bootstrap: bool = True,
) -> dict:
    """Train a Random Forest Regressor and return results and plot data."""
    X, y = generate_regression_data(
        n_samples=n_samples,
        noise=noise,
        random_state=random_state,
        dataset_type=dataset_type,
    )

    model = RandomForestRegressor(
        n_estimators=n_estimators,
        criterion=criterion,
        max_depth=max_depth if max_depth and max_depth > 0 else None,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        max_features=max_features if max_features != "none" else None,
        bootstrap=bootstrap,
        oob_score=bootstrap,
        random_state=random_state,
        n_jobs=-1,
    )

    def extras(m, X_train, X_test, y_train, y_test):
        """Extract feature importances, OOB score, and individual tree predictions."""
        feature_importances = m.feature_importances_.tolist()
        oob = float(m.oob_score_) if hasattr(m, "oob_score_") and m.bootstrap else None

        # Get individual tree prediction lines (first 5 estimators)
        x_all = np.concatenate([X_train.ravel(), X_test.ravel()])
        x_line = np.linspace(x_all.min(), x_all.max(), 200).reshape(-1, 1)

        individual_predictions = []
        for i, tree in enumerate(m.estimators_[:min(5, len(m.estimators_))]):
            y_tree = tree.predict(x_line)
            individual_predictions.append({
                "tree_index": i,
                "y_pred": y_tree.tolist(),
            })

        return {
            "feature_importances": feature_importances,
            "oob_score": oob,
            "n_estimators_actual": len(m.estimators_),
            "individual_predictions": individual_predictions,
            "individual_x_line": x_line.ravel().tolist(),
        }

    return _evaluate_regressor(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )


# ─── Gradient Boosting Classifier ────────────────────────────────

def train_gradient_boosting_classifier(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "moons",
    n_estimators: int = 100,
    learning_rate: float = 0.1,
    max_depth: int = 3,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    subsample: float = 1.0,
    max_features: str | None = None,
) -> dict:
    """Train a Gradient Boosting Classifier and return results and plot data."""
    X, y = generate_classification_data(
        n_samples=n_samples, n_features=2, n_classes=2,
        random_state=random_state, cluster_std=noise,
        dataset_type=dataset_type,
    )

    model = GradientBoostingClassifier(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        max_depth=max_depth if max_depth and max_depth > 0 else 3,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        subsample=subsample,
        max_features=max_features if max_features and max_features != "none" else None,
        random_state=random_state,
    )

    def extras(m, X_train, X_test, y_train, y_test):
        """Extract feature importances and staged loss history."""
        feature_importances = m.feature_importances_.tolist()

        # Staged loss curve — training loss at each boosting step
        staged_train_scores = []
        staged_test_scores = []

        for i, y_stage_pred in enumerate(m.staged_predict(X_train)):
            staged_train_scores.append(float(accuracy_score(y_train, y_stage_pred)))

        for i, y_stage_pred in enumerate(m.staged_predict(X_test)):
            staged_test_scores.append(float(accuracy_score(y_test, y_stage_pred)))

        # Training deviance (loss) at each stage
        train_loss = []
        test_loss = []
        for i, (train_dec, test_dec) in enumerate(
            zip(m.staged_decision_function(X_train), m.staged_decision_function(X_test))
        ):
            # Use log-loss proxy via negative deviance
            pass

        # Simplified: use built-in train_score_
        train_loss_curve = m.train_score_.tolist() if hasattr(m, "train_score_") else []

        return {
            "feature_importances": feature_importances,
            "n_estimators_actual": m.n_estimators_,
            "staged_train_accuracy": staged_train_scores,
            "staged_test_accuracy": staged_test_scores,
            "train_loss_curve": train_loss_curve,
        }

    return _evaluate_classifier(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )


# ─── Gradient Boosting Regressor ─────────────────────────────────

def train_gradient_boosting_regressor(
    n_samples: int = 100,
    noise: float = 0.1,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "sine",
    n_estimators: int = 100,
    learning_rate: float = 0.1,
    max_depth: int = 3,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    subsample: float = 1.0,
    max_features: str | None = None,
    loss: str = "squared_error",
) -> dict:
    """Train a Gradient Boosting Regressor and return results and plot data."""
    from sklearn.ensemble import GradientBoostingRegressor as GBR

    X, y = generate_regression_data(dataset_type, n_samples, noise, random_state)

    model = GBR(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        max_depth=max_depth if max_depth and max_depth > 0 else 3,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        subsample=subsample,
        max_features=max_features if max_features and max_features != "none" else None,
        loss=loss,
        random_state=random_state,
    )

    def extras(m, X_train, X_test, y_train, y_test):
        """Extract feature importances and staged train loss."""
        feature_importances = m.feature_importances_.tolist()
        train_loss_curve = m.train_score_.tolist() if hasattr(m, "train_score_") else []

        return {
            "feature_importances": feature_importances,
            "n_estimators_actual": m.n_estimators_,
            "train_loss_curve": train_loss_curve,
        }

    return _evaluate_regressor(
        model, X, y,
        test_size=test_size,
        random_state=random_state,
        extras_fn=extras,
    )
