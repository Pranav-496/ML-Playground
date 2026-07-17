"""Classification algorithm services."""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
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


def train_decision_tree(
    n_samples: int = 200,
    noise: float = 1.5,
    test_size: float = 0.2,
    random_state: int = 42,
    dataset_type: str = "moons",
    criterion: str = "gini",
    splitter: str = "best",
    max_depth: int | None = None,
    min_samples_split: int = 2,
    min_samples_leaf: int = 1,
    max_features: str | None = None,
    max_leaf_nodes: int | None = None,
    min_impurity_decrease: float = 0.0,
) -> dict:
    """Train a Decision Tree model and return results and plot data."""
    
    # Generate data
    X, y = generate_classification_data(
        n_samples=n_samples,
        n_features=2,
        n_classes=2,
        random_state=random_state,
        cluster_std=noise,
        dataset_type=dataset_type,
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    # Initialize and train model
    model = DecisionTreeClassifier(
        criterion=criterion,
        splitter=splitter,
        max_depth=max_depth if max_depth and max_depth > 0 else None,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        max_features=max_features if max_features != "none" else None,
        max_leaf_nodes=max_leaf_nodes if max_leaf_nodes and max_leaf_nodes > 0 else None,
        min_impurity_decrease=min_impurity_decrease,
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
    
    # Decision trees have sharp orthogonal boundaries, so a slightly higher resolution looks better
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 100),
                         np.linspace(y_min, y_max, 100))
    
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
    
    # Extract tree structure for visualization
    def build_tree_dict(node_id: int):
        node_id = int(node_id)
        if node_id == -1:
            return None
        is_leaf = bool(model.tree_.children_left[node_id] == -1 and model.tree_.children_right[node_id] == -1)
        
        node_dict = {
            "node_id": node_id,
            "samples": int(model.tree_.n_node_samples[node_id]),
            "value": [int(v) for v in model.tree_.value[node_id][0]],
            "impurity": round(float(model.tree_.impurity[node_id]), 3),
            "is_leaf": is_leaf
        }
        
        if not is_leaf:
            node_dict["feature"] = f"Feature {model.tree_.feature[node_id]}"
            node_dict["threshold"] = round(float(model.tree_.threshold[node_id]), 3)
            node_dict["left"] = build_tree_dict(int(model.tree_.children_left[node_id]))
            node_dict["right"] = build_tree_dict(int(model.tree_.children_right[node_id]))
            
        return node_dict

    tree_structure = build_tree_dict(0)
    
    return {
        "metrics": metrics,
        "plot_data": plot_data,
        "tree_structure": tree_structure,
        "model_params": model.get_params(),
    }


