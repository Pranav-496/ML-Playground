"""Deep learning algorithm services (Multi-Layer Perceptron)."""

import numpy as np
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    r2_score, mean_squared_error, mean_absolute_error
)
import warnings
from sklearn.exceptions import ConvergenceWarning

from app.utils.data_generation import generate_classification_data, generate_regression_data


# ─── MLP Classifier ──────────────────────────────────────────────

def train_mlp_classifier(
    n_samples: int = 300,
    noise: float = 0.2,
    dataset_type: str = "moons",
    hidden_layer_sizes: tuple = (100,),
    activation: str = "relu",
    solver: str = "adam",
    alpha: float = 0.0001,
    learning_rate_init: float = 0.001,
    max_iter: int = 500,
    random_state: int = 42,
    mesh_resolution: int = 50,
) -> dict:
    """Train an MLP classifier and return decision boundary + loss curve."""
    X, y = generate_classification_data(dataset_type, n_samples, noise, random_state)

    # Standardize data for neural networks
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=random_state
    )

    model = MLPClassifier(
        hidden_layer_sizes=hidden_layer_sizes,
        activation=activation,
        solver=solver,
        alpha=alpha,
        learning_rate_init=learning_rate_init,
        max_iter=max_iter,
        random_state=random_state,
        early_stopping=False,
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=ConvergenceWarning)
        model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    # Metrics
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="macro", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
    }

    # Decision Boundary (unscale it back for plotting visually if needed? No, let's keep it scaled)
    # Actually, the frontend expects raw coordinates, so we'll mesh over scaled, but
    # it's better to mesh over unscaled, scale it, predict, and return.
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, mesh_resolution),
        np.linspace(y_min, y_max, mesh_resolution),
    )
    
    mesh_points = np.c_[xx.ravel(), yy.ravel()]
    mesh_scaled = scaler.transform(mesh_points)
    Z = model.predict(mesh_scaled)
    Z = Z.reshape(xx.shape)

    return {
        "metrics": metrics,
        "loss_curve": model.loss_curve_ if hasattr(model, "loss_curve_") else [],
        "n_iter": model.n_iter_,
        "out_activation": model.out_activation_,
        "plot_data": {
            "x": X[:, 0].tolist(),
            "y": X[:, 1].tolist(),
            "labels": y.tolist(),
            "xx": xx.tolist(),
            "yy": yy.tolist(),
            "z": Z.tolist(),
        },
    }


# ─── MLP Regressor ───────────────────────────────────────────────

def train_mlp_regressor(
    n_samples: int = 100,
    noise: float = 0.1,
    dataset_type: str = "sine",
    hidden_layer_sizes: tuple = (100,),
    activation: str = "relu",
    solver: str = "adam",
    alpha: float = 0.0001,
    learning_rate_init: float = 0.001,
    max_iter: int = 500,
    random_state: int = 42,
) -> dict:
    """Train an MLP regressor and return fit curve + loss curve."""
    X, y = generate_regression_data(dataset_type, n_samples, noise, random_state)

    # Standardize data
    scaler_x = StandardScaler()
    scaler_y = StandardScaler()

    X_scaled = scaler_x.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).ravel()

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_scaled, test_size=0.2, random_state=random_state
    )

    model = MLPRegressor(
        hidden_layer_sizes=hidden_layer_sizes,
        activation=activation,
        solver=solver,
        alpha=alpha,
        learning_rate_init=learning_rate_init,
        max_iter=max_iter,
        random_state=random_state,
        early_stopping=False,
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=ConvergenceWarning)
        model.fit(X_train, y_train)

    y_pred_scaled = model.predict(X_test)

    # Unscale predictions for metrics
    y_test_unscaled = scaler_y.inverse_transform(y_test.reshape(-1, 1)).ravel()
    y_pred_unscaled = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).ravel()

    mse = mean_squared_error(y_test_unscaled, y_pred_unscaled)
    metrics = {
        "r2_score": float(r2_score(y_test_unscaled, y_pred_unscaled)),
        "mse": float(mse),
        "rmse": float(np.sqrt(mse)),
        "mae": float(mean_absolute_error(y_test_unscaled, y_pred_unscaled)),
    }

    # Generate smooth curve for plotting
    X_plot = np.linspace(X.min() - 0.5, X.max() + 0.5, 200).reshape(-1, 1)
    X_plot_scaled = scaler_x.transform(X_plot)
    y_plot_scaled = model.predict(X_plot_scaled)
    y_plot = scaler_y.inverse_transform(y_plot_scaled.reshape(-1, 1)).ravel()

    return {
        "metrics": metrics,
        "loss_curve": model.loss_curve_ if hasattr(model, "loss_curve_") else [],
        "n_iter": model.n_iter_,
        "out_activation": model.out_activation_,
        "plot_data": {
            "x": X.ravel().tolist(),
            "y": y.tolist(),
            "line_x": X_plot.ravel().tolist(),
            "line_y": y_plot.tolist(),
        },
    }
