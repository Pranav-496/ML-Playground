"""Classification algorithm services."""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.utils.data_generation import generate_classification_data


def train_logistic_regression(
    n_samples: int = 200,
    noise: float = 1.5, # Using cluster_std conceptually as noise
    test_size: float = 0.2,
    random_state: int = 42,
    C: float = 1.0,
    penalty: str = "l2",
    solver: str = "lbfgs",
    max_iter: int = 100,
) -> dict:
    """Train a logistic regression model and return results and plot data."""
    
    # Generate data
    X, y = generate_classification_data(
        n_samples=n_samples,
        n_features=2,
        n_classes=2,
        random_state=random_state,
        cluster_std=noise,
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    # Initialize and train model
    model = LogisticRegression(
        C=C,
        penalty=None if penalty == "none" else penalty,
        solver=solver,
        max_iter=max_iter,
        random_state=random_state,
    )
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Metrics
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="macro", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
    }
    
    # Create meshgrid for decision boundary
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    
    # Create a less dense meshgrid to reduce payload size (e.g., 50x50 points)
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 50),
                         np.linspace(y_min, y_max, 50))
    
    # Predict over meshgrid
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
    
    # Equation components
    coefficients = model.coef_[0].tolist() if model.coef_.ndim > 1 else model.coef_.tolist()
    intercept = model.intercept_.tolist()
    
    return {
        "metrics": metrics,
        "plot_data": plot_data,
        "coefficients": coefficients,
        "intercept": intercept,
        "model_params": model.get_params(),
    }


def train_knn(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    n_neighbors: int = 5,
    weights: str = "uniform",
    p: int = 2,
) -> dict:
    """Train a K-Nearest Neighbors model and return results and plot data."""
    
    # Generate data
    X, y = generate_classification_data(
        n_samples=n_samples,
        n_features=2,
        n_classes=2,
        random_state=random_state,
        cluster_std=noise,
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    # Initialize and train model
    model = KNeighborsClassifier(
        n_neighbors=n_neighbors,
        weights=weights,
        p=p,
    )
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Metrics
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="macro", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, average="macro", zero_division=0)),
    }
    
    # Create meshgrid for decision boundary
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 50),
                         np.linspace(y_min, y_max, 50))
    
    # Predict over meshgrid
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
    
    return {
        "metrics": metrics,
        "plot_data": plot_data,
        "model_params": model.get_params(),
    }

